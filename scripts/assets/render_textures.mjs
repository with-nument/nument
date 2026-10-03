// Renders typography-based textures (3D client badges, lanyard bands) with the site's own
// fonts via headless Chrome. Needs puppeteer-core; pass its entry with PUPPETEER_CORE if it
// isn't installed in this project.
//   PUPPETEER_CORE=/path/to/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js node scripts/assets/render_textures.mjs [badge1,badge2,...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { default: puppeteer } = await import(process.env.PUPPETEER_CORE || 'puppeteer-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = path.join(ROOT, 'scripts/assets/raw');
const font = (file) => pathToFileURL(path.join(ROOT, 'public/fonts', file)).href;
const asset = (file) => pathToFileURL(path.join(RAW, file)).href;

const FONTS = `
@font-face { font-family: 'Inter Display'; src: url('${font('InterDisplay-Regular.woff2')}'); font-weight: 550; }
@font-face { font-family: 'Inter Display'; src: url('${font('InterDisplay-Medium.woff2')}'); font-weight: 650; }
@font-face { font-family: 'Inter Display'; src: url('${font('InterDisplay-Bold.woff2')}'); font-weight: 750; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter Display', sans-serif; -webkit-font-smoothing: antialiased; }`;

// Badge colours are the template's originals, so the Clients section keeps its palette.
// Each badge is an employee ID card of a (fictional) person at the client, in the Indian format.
const CLIENTS = {
  badge1: {
    company: 'company1', org: 'Aurelia Health', tagline: 'Multispeciality Hospitals', emblem: 'emblems/aurelia-alpha.png', photo: 'idphotos/aurelia.png',
    name: 'Dr. Ananya Mehta', role: 'Chief Medical Officer', id: 'AH-CMO-0142', dept: 'Clinical Leadership', blood: 'B+', valid: '03 / 2028',
    address: ['Aurelia Health, Plot 7, Press Enclave Marg,', 'Saket, New Delhi 110017'],
    band: 'AURELIA HEALTH', bg: '#242C3E', ink: '#FFFFFF',
  },
  badge2: {
    company: 'company2', org: 'Corvex Logistics', tagline: 'Freight · Last Mile', emblem: 'emblems/corvex-alpha.png', photo: 'idphotos/corvex.png',
    name: 'Rohan Kapoor', role: 'Head of Network Planning', id: 'CVX-20418', dept: 'Network Operations', blood: 'O+', valid: '12 / 2027',
    address: ['Corvex Logistics Pvt. Ltd., Logistics Park,', 'Bhiwandi, Maharashtra 421302'],
    band: 'CORVEX LOGISTICS', bg: '#FFD303', ink: '#1C1C1E',
  },
  badge3: {
    company: 'company3', org: 'Lumora', tagline: 'Credit for growing businesses', emblem: 'emblems/lumora-alpha.png', photo: 'idphotos/lumora.png',
    name: 'Ishita Rao', role: 'Co-founder & CEO', id: 'LUM-0001', dept: 'Leadership', blood: 'A+', valid: '06 / 2027',
    address: ['Lumora Fintech Pvt. Ltd., 27th Main Road,', 'HSR Layout, Bengaluru 560102'],
    band: 'LUMORA', bg: '#000583', ink: '#FFFFFF',
  },
};

// Card UVs (measured from Tag.glb): front = x 0–511, y 4–773; back = x 513–1023, y 2–775.
// The art is stretched ~8% wider on the card, so it is laid out 8% wider and squeezed back.
// The metal clamp covers the top centre, so nothing important goes there.
const SQUEEZE = 512 / 553;

// Deterministic Code-128-looking barcode from the employee ID.
const barcode = (seed) => {
  let x = 0;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const bars = [];
  while (x < 420) {
    h = (h * 1103515245 + 12345) % 2147483648;
    const w = 2 + (h % 4) * 1.6;
    bars.push(`<i style="left:${x}px;width:${w}px"></i>`);
    x += w + 2 + ((h >> 3) % 3) * 1.8;
  }
  return bars.join('');
};

const tagHtml = (c) => `<!doctype html><html><head><style>${FONTS}
body { width: 1024px; height: 1024px; background: #f4f4f1; color: #1d1d20; position: relative; overflow: hidden; }
.face { position: absolute; top: 4px; width: 553px; height: 770px; transform: scaleX(${SQUEEZE}); transform-origin: 0 0; overflow: hidden; background: #f6f6f3; }
.front { left: 0; }
.back { left: 513px; }
.head { height: 176px; background: ${c.bg}; color: ${c.ink}; padding: 92px 40px 0; display: flex; align-items: center; gap: 18px; }
.emblem { width: 58px; height: 58px; flex: none; background: ${c.ink}; -webkit-mask: url('${asset(c.emblem)}') center / contain no-repeat; }
.org { font-weight: 750; font-size: 34px; letter-spacing: -0.02em; line-height: 1; }
.tag { font-weight: 550; font-size: 18px; opacity: 0.75; margin-top: 6px; letter-spacing: 0.02em; }
.photo { position: absolute; left: 50%; top: 200px; width: 214px; height: 262px; margin-left: -107px; border-radius: 14px; overflow: hidden;
  box-shadow: 0 0 0 5px #fff, 0 0 0 6.5px rgba(0,0,0,0.12); background: url('${asset(c.photo)}') center 22% / cover; }
.who { position: absolute; top: 484px; left: 0; right: 0; text-align: center; padding: 0 30px; }
.name { font-weight: 750; font-size: 40px; letter-spacing: -0.02em; line-height: 1.05; }
.role { font-weight: 650; font-size: 23px; color: ${c.bg === '#FFD303' ? '#7a6100' : c.bg}; margin-top: 8px; }
.grid { position: absolute; top: 590px; left: 40px; right: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 22px; font-size: 19px; }
.grid div { display: flex; flex-direction: column; border-top: 1.5px solid rgba(0,0,0,0.1); padding-top: 7px; }
.grid b { font-weight: 550; font-size: 15px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5; }
.grid span { font-weight: 650; margin-top: 2px; }
.foot { position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: ${c.bg}; }
.back .head { height: 132px; padding-top: 86px; justify-content: center; }
.back .org { font-size: 30px; }
.back .body { padding: 26px 44px 0; font-size: 19px; line-height: 1.4; }
.back .label { font-weight: 650; font-size: 15px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5; }
.back .addr { font-weight: 550; margin-top: 4px; }
.back .rules { margin: 18px 0 0; padding-left: 20px; font-weight: 550; font-size: 17px; opacity: 0.8; }
.qrrow { display: flex; align-items: center; gap: 24px; margin-top: 22px; }
#qr { width: 150px; height: 150px; background: #fff; padding: 8px; border-radius: 8px; box-shadow: 0 0 0 1.5px rgba(0,0,0,0.1); }
#qr svg { width: 100%; height: 100%; display: block; }
.sign { flex: 1; font-size: 16px; }
.sign svg { width: 170px; height: 54px; display: block; }
.sign .line { border-top: 1.5px solid rgba(0,0,0,0.35); padding-top: 5px; font-weight: 650; letter-spacing: 0.04em; opacity: 0.7; }
.bar { position: absolute; left: 66px; bottom: 58px; width: 420px; height: 58px; }
.bar i { position: absolute; top: 0; bottom: 0; background: #1d1d20; }
.barnum { position: absolute; left: 0; right: 0; bottom: 38px; text-align: center; font-size: 15px; letter-spacing: 0.32em; font-weight: 550; opacity: 0.7; }
</style><script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script></head><body>
<div class="face front">
  <div class="head"><div class="emblem"></div><div><div class="org">${c.org}</div><div class="tag">${c.tagline}</div></div></div>
  <div class="photo"></div>
  <div class="who"><div class="name">${c.name}</div><div class="role">${c.role}</div></div>
  <div class="grid">
    <div><b>Emp. ID</b><span>${c.id}</span></div>
    <div><b>Blood group</b><span>${c.blood}</span></div>
    <div><b>Department</b><span>${c.dept}</span></div>
    <div><b>Valid till</b><span>${c.valid}</span></div>
  </div>
  <div class="foot"></div>
</div>
<div class="face back">
  <div class="head"><div class="org">${c.org}</div></div>
  <div class="body">
    <div class="label">If found, please return to</div>
    <div class="addr">${c.address.join('<br>')}</div>
    <ul class="rules"><li>This card is the property of ${c.org}.</li><li>Display it at all times on the premises.</li><li>Non-transferable. Report loss immediately.</li></ul>
    <div class="qrrow"><div id="qr"></div>
      <div class="sign"><svg viewBox="0 0 170 54"><path d="M6 40c14-22 22-30 28-24s-10 26-2 24 14-28 22-26-6 22 4 22 16-20 26-18 2 16 12 14 18-12 30-10" fill="none" stroke="#1d1d20" stroke-width="2.2" stroke-linecap="round"/></svg>
      <div class="line">Authorised Signatory</div></div></div>
  </div>
  <div class="bar">${barcode(c.id)}</div>
  <div class="barnum">${c.id}</div>
  <div class="foot"></div>
</div>
<script>
  const qr = qrcode(0, 'M');
  qr.addData('https://nument.in');
  qr.make();
  document.getElementById('qr').innerHTML = qr.createSvgTag({ margin: 0, scalable: true });
</script>
</body></html>`;

// The lanyard shows ~1.2 copies of this texture, rotated 90° and stretched ~25% along its length,
// so the line is condensed to compensate. It carries the client's own name, like a company lanyard.
const bandHtml = (c) => `<!doctype html><html><head><style>${FONTS}
body { width: 1024px; height: 253px; background: ${c.bg}; color: ${c.ink}; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.t { font-size: 96px; font-weight: 750; letter-spacing: 0.06em; white-space: nowrap; transform: scaleX(0.8); }
.d { display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: ${c.ink}; opacity: 0.5; margin: 0 0.45em; vertical-align: middle; }
</style></head><body><div class="t">${c.band}<span class="d"></span></div></body></html>`;

const only = (process.argv[2] || Object.keys(CLIENTS).join(',')).split(',');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
const shoot = async (html, width, height, out) => {
  const tmp = path.join(RAW, `_render.html`);
  fs.writeFileSync(tmp, html);
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width, height } });
  fs.unlinkSync(tmp);
  console.log('ok  ', path.relative(ROOT, out));
};

for (const key of only) {
  const c = CLIENTS[key];
  await shoot(tagHtml(c), 1024, 1024, path.join(ROOT, `public/model/Tag${c.company}.png`));
  await shoot(bandHtml(c), 1024, 253, path.join(ROOT, `public/model/Band${c.company}.png`));
}
await browser.close();
