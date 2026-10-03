// Renders the favicon set ("N" in Inter Display Bold) and captures the social share image
// (og.png) from the running site. Needs puppeteer-core and, for og.png, `npm run dev` on :3000.
//   PUPPETEER_CORE=/path/to/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js node scripts/assets/render_icons.mjs [--og]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { default: puppeteer } = await import(process.env.PUPPETEER_CORE || 'puppeteer-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PUBLIC = path.join(ROOT, 'public');
const RAW = path.join(ROOT, 'scripts/assets/raw');
fs.mkdirSync(RAW, { recursive: true });

const INK = '#28282b';
const PAPER = '#f0f4f1';
const font = pathToFileURL(path.join(PUBLIC, 'fonts/InterDisplay-Bold.woff2')).href;

// radius: corner rounding as a share of the size; scale: letter size as a share of the tile.
const icon = (size, { radius = 0.22, scale = 0.68 } = {}) => `<!doctype html><html><head><style>
@font-face { font-family: 'Inter Display'; src: url('${font}'); font-weight: 750; }
* { margin: 0; } html, body { width: ${size}px; height: ${size}px; background: transparent; }
.tile { width: ${size}px; height: ${size}px; border-radius: ${size * radius}px; background: ${INK}; color: ${PAPER};
  display: grid; place-items: center; font: 750 ${size * scale}px/1 'Inter Display', sans-serif; letter-spacing: -0.04em; }
.tile span { transform: translateY(-3%); }
</style></head><body><div class="tile"><span>N</span></div></body></html>`;

const ICONS = [
  { file: 'favicon-16x16.png', size: 16, opts: { radius: 0.2, scale: 0.78 } },
  { file: 'favicon-32x32.png', size: 32, opts: { radius: 0.2, scale: 0.74 } },
  { file: 'apple-touch-icon.png', size: 180, opts: { radius: 0 } }, // iOS rounds the corners itself
  { file: 'android-chrome-192x192.png', size: 192, opts: { radius: 0, scale: 0.5 } }, // maskable: keep inside the safe circle
  { file: 'android-chrome-512x512.png', size: 512 },
  { file: 'mstile-150x150.png', size: 270, opts: { radius: 0, scale: 0.5 } },
  { file: '_ico-48.png', size: 48, opts: { radius: 0.2, scale: 0.72 }, raw: true },
];

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();

for (const { file, size, opts, raw } of ICONS) {
  const tmp = path.join(RAW, '_icon.html');
  fs.writeFileSync(tmp, icon(size, opts));
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(raw ? RAW : PUBLIC, file), omitBackground: true });
  fs.unlinkSync(tmp);
  console.log('ok  ', file);
}

if (process.argv.includes('--og')) {
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 9000)); // loader + intro transition
  await page.mouse.move(1199, 629);
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(PUBLIC, 'og.png') });
  console.log('ok   og.png');
}
await browser.close();
