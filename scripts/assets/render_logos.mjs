// Renders the footer game's tech logos (Simple Icons, CC0) and their "sliced" variants as
// square transparent PNGs. The game maps every logo onto a 1x1 plane, so they must be square.
//   PUPPETEER_CORE=/path/to/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js node scripts/assets/render_logos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { default: puppeteer } = await import(process.env.PUPPETEER_CORE || 'puppeteer-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'scripts/assets/raw/logos');
fs.mkdirSync(path.join(OUT, 'sliced'), { recursive: true });

export const LOGOS = [
  { slug: 'python', hex: '3776AB' },
  { slug: 'pytorch', hex: 'EE4C2C' },
  { slug: 'tensorflow', hex: 'FF6F00' },
  { slug: 'huggingface', hex: 'FFD21E' },
  { slug: 'langchain', hex: '7FC8FF' },
  { slug: 'googlegemini', hex: '8E75B2' },
  { slug: 'claude', hex: 'D97757' },
  { slug: 'docker', hex: '2496ED' },
  { slug: 'kubernetes', hex: '326CE5' },
  { slug: 'nvidia', hex: '76B900' },
];

const SIZE = 512;
const ICON = 360; // ~15% padding on each side

const svgFor = async (slug) => {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`);
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  return res.text();
};

// Whole logo, centred.
const wholeHtml = (svg, hex) => `<!doctype html><html><head><style>
* { margin: 0; } body { width: ${SIZE}px; height: ${SIZE}px; display: grid; place-items: center; background: transparent; }
svg { width: ${ICON}px; height: ${ICON}px; fill: #${hex}; }
</style></head><body>${svg}</body></html>`;

// Two halves cut down the middle, pushed apart and slightly rotated, like the template's sliced art.
const slicedHtml = (svg, hex) => `<!doctype html><html><head><style>
* { margin: 0; } body { width: ${SIZE}px; height: ${SIZE}px; position: relative; background: transparent; }
.half { position: absolute; left: ${(SIZE - ICON) / 2}px; top: ${(SIZE - ICON) / 2}px; width: ${ICON}px; height: ${ICON}px; }
.half svg { width: 100%; height: 100%; fill: #${hex}; }
.l { clip-path: inset(0 50% 0 0); transform: translate(-44px, 8px) rotate(-7deg); }
.r { clip-path: inset(0 0 0 50%); transform: translate(44px, -8px) rotate(7deg); }
</style></head><body><div class="half l">${svg}</div><div class="half r">${svg}</div></body></html>`;

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
const shoot = async (html, out) => {
  await page.setContent(html);
  await page.screenshot({ path: out, type: 'png', omitBackground: true });
};

for (const { slug, hex } of LOGOS) {
  const svg = (await svgFor(slug)).replace(/<title>.*?<\/title>/, '');
  await shoot(wholeHtml(svg, hex), path.join(OUT, `${slug}.png`));
  await shoot(slicedHtml(svg, hex), path.join(OUT, 'sliced', `${slug}Sliced.png`));
  console.log('ok  ', slug);
}
await browser.close();
