// Image pipeline: originals/ (JPG/PNG sources) -> src/images/gen/ (WebP + JPEG fallback in several widths) + manifest.json.
// Run automatically before `npm run dev` and `npm run build`. Only changed files are re-encoded.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'originals';
const OUT = 'src/images/gen';
const WIDTHS = [480, 960, 1440, 1920];
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;
const JPEG_QUALITY = 80;

fs.mkdirSync(OUT, { recursive: true });

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(jpe?g|png)$/i.test(e.name) ? [p] : [];
  });

const manifest = {};
let encoded = 0;

for (const file of walk(SRC)) {
  const stem = path.relative(SRC, file).replace(/\.[^.]+$/, '').split(path.sep).join('-');
  const meta = await sharp(file).metadata();
  const full = meta.width;
  // Never upscale, never wider than MAX_WIDTH: sizes from the list that fit, plus the (capped) original width.
  // Resizing keeps the aspect ratio; nothing is cropped (cropping, if any, is CSS object-fit).
  const cap = Math.min(full, MAX_WIDTH);
  const widths = [...new Set([...WIDTHS.filter((w) => w <= cap), cap])];
  manifest[stem] = { width: full, height: meta.height, widths };

  const srcTime = fs.statSync(file).mtimeMs;
  for (const w of widths) {
    for (const [ext, opts] of [['webp', { quality: WEBP_QUALITY }], ['jpg', { quality: JPEG_QUALITY, mozjpeg: true }]]) {
      const out = path.join(OUT, `${stem}-${w}.${ext}`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;
      const img = sharp(file).rotate().resize({ width: w, withoutEnlargement: true });
      await (ext === 'webp' ? img.webp(opts) : img.jpeg(opts)).toFile(out);
      encoded++;
    }
  }
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`images: ${Object.keys(manifest).length} sources, ${encoded} files (re)encoded`);
