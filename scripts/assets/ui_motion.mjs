// Renders a short, seamless "product tour" clip over a static product screenshot: smooth camera
// moves, a cursor, a hover tooltip and a click, drawn frame by frame so the UI text stays crisp.
//   PUPPETEER_CORE=/path/to/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js node scripts/assets/ui_motion.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { default: puppeteer } = await import(process.env.PUPPETEER_CORE || 'puppeteer-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = path.join(ROOT, 'scripts/assets/raw');
const FPS = 30;
const W = 1920;
const H = 1020; // same 190:101 shape as the gallery's big tiles

// Positions are fractions of the screenshot (x from left, y from top).
const CLIPS = [
  {
    name: 'p3-analytics-tour',
    image: 'public/project3/3.webp',
    out: 'public/project3/video2.mp4',
    duration: 8,
    accent: '#0028FF',
    camera: [
      { t: 0, s: 1, x: 0.5, y: 0.5 },
      { t: 0.7, s: 1, x: 0.5, y: 0.5 },
      { t: 2.7, s: 1.33, x: 0.42, y: 0.68 },
      { t: 4.7, s: 1.33, x: 0.42, y: 0.68 },
      { t: 5.9, s: 1.33, x: 0.76, y: 0.5 },
      { t: 6.9, s: 1.33, x: 0.76, y: 0.5 },
      { t: 8, s: 1, x: 0.5, y: 0.5 },
    ],
    cursor: [
      { t: 2.3, x: 0.7, y: 0.98, o: 0 },
      { t: 2.6, x: 0.66, y: 0.94, o: 1 },
      { t: 3.6, x: 0.531, y: 0.764, o: 1 },
      { t: 4.9, x: 0.531, y: 0.764, o: 1 },
      { t: 5.9, x: 0.9, y: 0.434, o: 1 },
      { t: 7.1, x: 0.9, y: 0.434, o: 1 },
      { t: 7.5, x: 0.93, y: 0.48, o: 0 },
    ],
    pulse: { x: 0.529, y: 0.76, from: 3.4, to: 5.0 },
    tooltip: { x: 0.529, y: 0.76, from: 3.7, to: 4.95, lines: ['Week 12', '4.3 min per note', '↓ 62% since launch'] },
    click: { x: 0.9, y: 0.434, at: 6.1 },
    highlight: { x: 0.585, y: 0.413, w: 0.375, h: 0.043, from: 6.1, to: 7.3 },
  },
];

const font = pathToFileURL(path.join(ROOT, 'public/fonts/InterDisplay-Regular.woff2')).href;
const fontBold = pathToFileURL(path.join(ROOT, 'public/fonts/InterDisplay-Medium.woff2')).href;

const html = (clip) => `<!doctype html><html><head><style>
@font-face { font-family: 'Inter Display'; src: url('${font}'); font-weight: 550; }
@font-face { font-family: 'Inter Display'; src: url('${fontBold}'); font-weight: 650; }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #fff; font-family: 'Inter Display', sans-serif; }
#world { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; }
#world img { width: 100%; height: 100%; display: block; }
.pulse { position: absolute; width: 30px; height: 30px; margin: -15px 0 0 -15px; border-radius: 50%; border: 4px solid ${clip.accent}; }
.tip { position: absolute; transform-origin: 0 100%; padding: 22px 28px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px;
  box-shadow: 0 16px 44px rgba(20,20,40,0.18); color: #2D2D2D; font-size: 34px; line-height: 1.3; white-space: nowrap; }
.tip b { display: block; font-weight: 650; font-size: 22px; letter-spacing: 0.04em; text-transform: uppercase; color: #75716A; }
.tip i { font-style: normal; color: ${clip.accent}; font-weight: 650; }
.hl { position: absolute; border-radius: 8px; background: ${clip.accent}14; box-shadow: 0 0 0 2px ${clip.accent}55, 0 0 24px ${clip.accent}40; }
.ripple { position: absolute; width: 90px; height: 90px; margin: -45px 0 0 -45px; border-radius: 50%; background: ${clip.accent}33; }
#cursor { position: absolute; width: 56px; height: 56px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35)); }
</style></head><body>
<div id="world"><img src="${pathToFileURL(path.join(ROOT, clip.image)).href}">
  <div class="hl" id="hl"></div><div class="pulse" id="pulse"></div><div class="ripple" id="ripple"></div>
</div>
<div class="tip" id="tip"><b>${clip.tooltip.lines[0]}</b>${clip.tooltip.lines[1]}<br><i>${clip.tooltip.lines[2]}</i></div>
<svg id="cursor" viewBox="0 0 24 24"><path d="M4 2.5v17.2l4.6-4.4 2.9 6.6 2.9-1.3-2.9-6.4h6.3z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>
</body></html>`;

// Runs in the page: positions everything for time t (seconds).
function render(t, clip, W, H) {
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
  const track = (keys, props) => {
    if (t <= keys[0].t) return keys[0];
    for (let i = 0; i < keys.length - 1; i += 1) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t <= b.t) {
        const p = ease((t - a.t) / (b.t - a.t));
        return Object.fromEntries(props.map((k) => [k, a[k] + (b[k] - a[k]) * p]));
      }
    }
    return keys[keys.length - 1];
  };
  const window01 = (from, to, fade = 0.3) => Math.max(0, Math.min(1, (t - from) / fade, (to - t) / fade));

  // Camera: scale around a focus point, clamped so the screenshot always fills the frame.
  const cam = track(clip.camera, ['s', 'x', 'y']);
  const tx = Math.min(0, Math.max(W - W * cam.s, W / 2 - cam.x * W * cam.s));
  const ty = Math.min(0, Math.max(H - H * cam.s, H / 2 - cam.y * H * cam.s));
  document.getElementById('world').style.transform = `translate(${tx}px, ${ty}px) scale(${cam.s})`;
  const toScreen = (x, y) => [tx + x * W * cam.s, ty + y * H * cam.s];

  const pulse = document.getElementById('pulse');
  const pp = window01(clip.pulse.from, clip.pulse.to);
  const beat = ((t - clip.pulse.from) % 1.1) / 1.1;
  Object.assign(pulse.style, { left: `${clip.pulse.x * W}px`, top: `${clip.pulse.y * H}px`, opacity: pp * (1 - beat), transform: `scale(${1 + beat * 1.6})` });

  const tip = document.getElementById('tip');
  const tp = window01(clip.tooltip.from, clip.tooltip.to, 0.25);
  const [tipX, tipY] = toScreen(clip.tooltip.x, clip.tooltip.y);
  Object.assign(tip.style, { left: `${tipX + 30}px`, top: `${tipY - 190}px`, opacity: tp, transform: `scale(${0.92 + 0.08 * tp})` });

  const hl = document.getElementById('hl');
  Object.assign(hl.style, {
    left: `${clip.highlight.x * W}px`, top: `${clip.highlight.y * H}px`, width: `${clip.highlight.w * W}px`, height: `${clip.highlight.h * H}px`,
    opacity: window01(clip.highlight.from, clip.highlight.to, 0.35),
  });

  const ripple = document.getElementById('ripple');
  const rp = (t - clip.click.at) / 0.6;
  Object.assign(ripple.style, { left: `${clip.click.x * W}px`, top: `${clip.click.y * H}px`, opacity: rp >= 0 && rp <= 1 ? 1 - rp : 0, transform: `scale(${0.3 + rp * 1.4})` });

  const cur = track(clip.cursor, ['x', 'y', 'o']);
  const [cx, cy] = toScreen(cur.x, cur.y);
  const press = Math.abs(t - clip.click.at) < 0.12 ? 0.85 : 1;
  Object.assign(document.getElementById('cursor').style, { left: `${cx - 10}px`, top: `${cy - 6}px`, opacity: cur.o, transform: `scale(${press})` });
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

for (const clip of CLIPS) {
  const dir = path.join(RAW, 'motion', clip.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, 'index.html');
  fs.writeFileSync(tmp, html(clip));
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(`window.render = ${render.toString()}`);
  const frames = Math.round(clip.duration * FPS);
  for (let f = 0; f < frames; f += 1) {
    await page.evaluate((t, c, w, h) => window.render(t, c, w, h), f / FPS, clip, W, H);
    await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, '0')}.png`) });
  }
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(ROOT, clip.out)]);
  console.log('ok  ', clip.name, '->', clip.out);
}
await browser.close();
