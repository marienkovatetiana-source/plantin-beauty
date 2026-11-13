import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import fs from 'node:fs';
import path from 'node:path';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, 'src');

/* SEO: per-page title / description / keywords live in src/seo.json and are rendered by partials/seo.html.
   Set the site address at build time:  SITE_URL=https://your-domain npm run build  (used for canonical + Open Graph) */
const SITE_URL = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '');
const seoData = JSON.parse(fs.readFileSync(resolve(root, 'seo.json'), 'utf8'));
const localBusiness = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Plantin Beauty Studio',
  description: seoData.index.description,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og-image.jpg`,
  telephone: '+32468264014',
  address: { '@type': 'PostalAddress', streetAddress: 'Plantinkaai 1a', postalCode: '2000', addressLocality: 'Antwerpen', addressCountry: 'BE' },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '17:00' },
  ],
  sameAs: ['https://www.instagram.com/beauty.studio.antwerp/'],
});

/* Every .html in src/ (except partials/) is a page of the site */
const pages = (dir = root) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'partials' || e.name === 'images' ? [] : pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });

/* <img src="images/hero-home.jpg" sizes="…"> -> <picture> with WebP + JPEG srcset, built from the files made by scripts/images.mjs */
function responsivePictures() {
  const manifestPath = resolve(root, 'images/gen/manifest.json');
  return {
    name: 'responsive-pictures',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!fs.existsSync(manifestPath)) return html;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        return html.replace(/<img\b([^>]*?)\bsrc="(?:\/)?images\/(?!gen\/)([^"]+)\.(?:jpe?g|png)"([^>]*)>/g, (all, before, name, after) => {
          const stem = name.split('/').join('-');
          const m = manifest[stem];
          if (!m) return all;
          const attrs = `${before} ${after}`;
          const sizes = (attrs.match(/\bsizes="([^"]*)"/) || [, '100vw'])[1];
          let clean = attrs.replace(/\bsizes="[^"]*"/, '').replace(/\s+/g, ' ').trim();
          // keep width/height true to the file (they only reserve space, CSS sets the real size)
          const aw = +(clean.match(/\bwidth="(\d+)"/) || [])[1], ah = +(clean.match(/\bheight="(\d+)"/) || [])[1];
          if (!aw || !ah || Math.abs(aw / ah - m.width / m.height) > 0.02) {
            clean = clean.replace(/\b(width|height)="\d+"\s*/g, '').trim() + ` width="${m.width}" height="${m.height}"`;
          }
          const set = (ext) => m.widths.map((w) => `/images/gen/${stem}-${w}.${ext} ${w}w`).join(', ');
          const mid = m.widths.includes(960) ? 960 : m.widths[m.widths.length - 1];
          return `<picture><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="/images/gen/${stem}-${mid}.jpg" srcset="${set('jpg')}" sizes="${sizes}" ${clean}></picture>`;
        });
      },
    },
  };
}

/* sitemap.xml + robots.txt next to the built pages (noindex pages are left out) */
function sitemap() {
  return {
    name: 'sitemap',
    closeBundle() {
      const out = resolve(import.meta.dirname, 'dist');
      const urls = Object.entries(seoData).filter(([, v]) => !v.noindex)
        .map(([n]) => `  <url><loc>${n === 'index' ? `${SITE_URL}/` : `${SITE_URL}/${n}.html`}</loc></url>`).join('\n');
      fs.writeFileSync(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
      fs.writeFileSync(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}

export default defineConfig({
  root,
  base: './',
  publicDir: resolve(import.meta.dirname, 'public'),
  plugins: [
    handlebars({
      partialDirectory: resolve(root, 'partials'),
      context(pagePath) {
        const name = path.basename(pagePath, '.html');
        return {
          siteUrl: SITE_URL,
          url: name === 'index' ? `${SITE_URL}/` : `${SITE_URL}/${name}.html`,
          seo: seoData[name] || seoData.index,
          schema: name === 'index' ? localBusiness : '',
        };
      },
    }),
    responsivePictures(),
    sitemap(),
  ],
  server: { port: 5173, host: true },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    assetsInlineLimit: 2048, // only tiny icons are inlined; photos/avatars stay separate cacheable files
    rollupOptions: { input: pages() },
  },
});
