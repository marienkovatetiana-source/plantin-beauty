/* Builds one SVG sprite from src/images/icons/*.svg -> src/partials/sprite.html
   (included once per page with {{> sprite}}; icons are used as <svg class="icon"><use href="#name"/></svg>).
   Runs automatically before `dev` and `build`. To add an icon: drop name.svg into src/images/icons/.
   Single-colour icons are switched to currentColor (colour comes from CSS `color`).
   Icons in KEEP_COLORS keep their drawn colours; icons in SKIP stay plain files. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'src/images/icons');
const out = path.join(root, 'src/partials/sprite.html');
const KEEP_COLORS = new Set(['chevron-accent']);
const SKIP = new Set(['check-box']); // used as a CSS background (course.css), not through the sprite

const symbols = fs.readdirSync(dir)
  .filter((f) => f.endsWith('.svg') && !SKIP.has(path.basename(f, '.svg')))
  .sort()
  .map((file) => {
    const name = path.basename(file, '.svg');
    const svg = fs.readFileSync(path.join(dir, file), 'utf8');
    const viewBox = (svg.match(/viewBox="([^"]+)"/) || [])[1];
    if (!viewBox) throw new Error(`${file}: no viewBox`);
    let inner = svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
    inner = inner.replace(/\s+id="[^"]*"/g, ''); // ids repeat between icons
    if (!KEEP_COLORS.has(name)) {
      inner = inner.replace(/\b(fill|stroke)="(?!none|currentColor)[^"]*"/g, '$1="currentColor"');
    }
    inner = inner.replace(/\s*\n\s*/g, '');
    return `<symbol id="${name}" viewBox="${viewBox}" fill="none">${inner}</symbol>`;
  });

const html = `<!-- icon sprite, built by scripts/sprite.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${symbols.join('')}</svg>
`;
fs.writeFileSync(out, html);
console.log(`sprite: ${symbols.length} icons -> src/partials/sprite.html`);
