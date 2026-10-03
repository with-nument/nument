// Composes the project cover images as case-study "shots": the project's real product screens laid
// out in 3D over a generated brand background, with a frosted metric card. Rendered by headless
// Chrome so every screen stays pin-sharp.
//   PUPPETEER_CORE=/path/to/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js node scripts/assets/render_covers.mjs [p3,p4,...]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { default: puppeteer } = await import(process.env.PUPPETEER_CORE || 'puppeteer-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = path.join(ROOT, 'scripts/assets/raw');
const W = 2560;
const H = 1200;
const url = (p) => pathToFileURL(path.join(ROOT, p)).href;

const COVERS = {
  p3: {
    out: 'public/project3/project3.webp',
    layout: 'phones',
    desktop: 'public/project3/1.webp',
    phones: ['public/project3/7.webp', 'public/project3/6.webp'],
    metric: { value: '−62%', label: 'documentation time per patient', accent: '#0028FF' },
  },
  p1: {
    out: 'public/project1/project1.webp',
    layout: 'phones',
    desktop: 'public/project1/1.webp',
    phones: ['public/project1/2.webp', 'public/project1/3.webp'],
    metric: { value: '3.4×', label: 'conversion for shoppers who chat', accent: '#FF573E' },
  },
  p4: {
    out: 'public/project4/project4.webp',
    layout: 'stack',
    screens: ['public/project4/2.webp', 'public/project4/7.webp', 'public/project4/1.webp'],
    metric: { value: '94%', label: 'forecast accuracy across 120 cities', accent: '#5C58EB' },
  },
  p5: {
    out: 'public/project5/project5.webp',
    layout: 'stack',
    screens: ['public/project5/6.webp', 'public/project5/2.webp', 'public/project5/1.webp'],
    metric: { value: '1.2M', label: 'documents searchable with citations', accent: '#002AB0' },
  },
  p2: {
    out: 'public/project2/project2.webp',
    layout: 'stack',
    screens: ['public/project2/3.webp', 'public/project2/2.webp', 'public/project2/1.webp'],
    metric: { value: '<10 min', label: 'from application to credit decision', accent: '#0E0063' },
  },
};

const FONT = `
@font-face { font-family: 'Inter Display'; src: url('${url('public/fonts/InterDisplay-Regular.woff2')}'); font-weight: 550; }
@font-face { font-family: 'Inter Display'; src: url('${url('public/fonts/InterDisplay-Bold.woff2')}'); font-weight: 750; }`;

// A desktop app window: thin glass chrome bar with traffic lights, then the screenshot.
const windowEl = (src, cls = '') => `<div class="win ${cls}"><div class="bar"><i></i><i></i><i></i></div><img src="${url(src)}"></div>`;
const phoneEl = (src, cls = '') => `<div class="phone ${cls}"><img src="${url(src)}"></div>`;

const metricEl = (m) => `<div class="metric"><div class="v" style="color:${m.accent}">${m.value}</div><div class="l">${m.label}</div></div>`;

const page = (c, key) => `<!doctype html><html><head><style>${FONT}
* { margin: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: 'Inter Display', sans-serif; }
.bg { position: absolute; inset: 0; background: url('${pathToFileURL(path.join(RAW, 'coverbg', `${key}.png`)).href}') center / cover; }
.grain { position: absolute; inset: 0; opacity: 0.18; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.stage { position: absolute; inset: 0; perspective: 3400px; }
.win { position: absolute; width: 1420px; border-radius: 22px; overflow: hidden; background: #fff;
  box-shadow: 0 0 0 1.5px rgba(255,255,255,0.45), 0 70px 140px -20px rgba(10,10,40,0.55), 0 24px 48px rgba(10,10,40,0.25); }
.win .bar { height: 40px; background: rgba(255,255,255,0.92); display: flex; gap: 11px; align-items: center; padding-left: 20px; border-bottom: 1px solid rgba(0,0,0,0.06); }
.win .bar i { width: 13px; height: 13px; border-radius: 50%; background: #E3E1DC; }
.win img { display: block; width: 100%; }
.phone { position: absolute; width: 400px; padding: 13px; border-radius: 64px; background: #0d0d10;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.18), 0 60px 120px -10px rgba(10,10,40,0.6), 0 20px 40px rgba(10,10,40,0.3); }
.phone img { display: block; width: 100%; border-radius: 52px; }
.metric { position: absolute; padding: 34px 40px 32px; border-radius: 28px; background: rgba(255,255,255,0.78); backdrop-filter: blur(24px);
  box-shadow: 0 0 0 1.5px rgba(255,255,255,0.7), 0 40px 80px -10px rgba(10,10,40,0.35); }
.metric .v { font-weight: 750; font-size: 96px; letter-spacing: -0.04em; line-height: 1; }
.metric .l { margin-top: 12px; font-weight: 550; font-size: 27px; color: #2b2b30; max-width: 300px; line-height: 1.25; }
/* phones layout: tilted desktop with two phones in front on the right */
.phones .main { left: 640px; top: 230px; transform: rotateY(-17deg) rotateX(7deg) rotateZ(-1.5deg); transform-origin: 60% 50%; }
.phones .p1 { left: 1810px; top: 300px; transform: rotateZ(5deg) translateZ(120px); }
.phones .p2 { left: 1530px; top: 400px; transform: rotateZ(-3deg) scale(0.9); }
.phones .metric { left: 470px; top: 720px; transform: translateZ(160px); }
/* stack layout: three windows cascading from back-left to front-right in gentle perspective */
.cascade { position: absolute; inset: 0; transform-style: preserve-3d; }
.cascade .win { transform-origin: 50% 50%; }
.cascade .s0 { width: 1080px; left: 560px; top: 120px; transform: rotateY(-16deg) rotateX(6deg) translateZ(-260px); filter: brightness(0.94); }
.cascade .s1 { width: 1180px; left: 860px; top: 270px; transform: rotateY(-16deg) rotateX(6deg) translateZ(-120px); filter: brightness(0.97); }
.cascade .s2 { width: 1300px; left: 1140px; top: 430px; transform: rotateY(-16deg) rotateX(6deg); }
.stack .metric { left: 330px; top: 700px; }
</style></head><body>
<div class="bg"></div>
<div class="stage ${c.layout}">
${c.layout === 'phones'
    ? `${windowEl(c.desktop, 'main')}${phoneEl(c.phones[1], 'p2')}${phoneEl(c.phones[0], 'p1')}`
    : `<div class="cascade">${c.screens.map((s, i) => windowEl(s, `s${i}`)).join('')}</div>`}
${metricEl(c.metric)}
</div>
<div class="grain"></div>
</body></html>`;

const only = (process.argv[2] || Object.keys(COVERS).join(',')).split(',');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files'],
});
const tab = await browser.newPage();
await tab.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
fs.mkdirSync(path.join(RAW, 'covers'), { recursive: true });
for (const key of only) {
  const c = COVERS[key];
  const tmp = path.join(RAW, 'covers', `${key}.html`);
  fs.writeFileSync(tmp, page(c, key));
  await tab.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const png = path.join(RAW, 'covers', `${key}.png`);
  await tab.screenshot({ path: png });
  execFileSync('cwebp', ['-quiet', '-q', '90', png, '-o', path.join(ROOT, c.out)]);
  console.log('ok  ', key, '->', c.out);
}
await browser.close();
