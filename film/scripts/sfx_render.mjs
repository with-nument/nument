// Renders the website's own sound recipes (src/sound/recipes.js, unchanged) to WAV files
// for the film, using headless Chrome's OfflineAudioContext.
// Output: assets/sfx/site/<name>[-<variant>].wav (48 kHz stereo, recipe gain applied, dry)
//         assets/sfx/site/meta.json (each recipe's reverb send, applied later in the mix)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const film = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const repo = path.resolve(film, '..');
const outDir = path.join(film, 'assets/sfx/site');
fs.mkdirSync(outDir, { recursive: true });

// Tiny static server so the page can import the recipes as an ES module.
const page = `<!doctype html><script type="module">
import recipes from '/src/sound/recipes.js';
const SR = 48000;
const toWav = (buf) => {
  const n = buf.length, ch = 2, data = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const str = (o, s) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); data.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVEfmt ');
  data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true);
  data.setUint32(24, SR, true); data.setUint32(28, SR * ch * 2, true); data.setUint16(32, ch * 2, true);
  data.setUint16(34, 16, true); str(36, 'data'); data.setUint32(40, n * ch * 2, true);
  const L = buf.getChannelData(0), R = buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0);
  for (let i = 0; i < n; i++) for (const [c, s] of [[0, L[i]], [1, R[i]]]) data.setInt16(44 + (i * 2 + c) * 2, Math.max(-1, Math.min(1, s)) * 32767, true);
  let bin = ''; const bytes = new Uint8Array(data.buffer);
  for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(bin);
};
window.renderAll = async () => {
  const out = {};
  for (const [name, r] of Object.entries(recipes)) {
    const variants = r.variants || 1;
    for (let i = 0; i < variants; i++) {
      const ctx = new OfflineAudioContext(2, Math.ceil((r.duration + 0.05) * SR), SR);
      const gain = ctx.createGain(); gain.gain.value = r.gain; gain.connect(ctx.destination);
      r.build(ctx, gain, { drift: 1, index: i });
      const key = variants > 1 ? name + '-' + i : name;
      out[key] = { wav: toWav(await ctx.startRendering()), reverb: r.reverb };
    }
  }
  return JSON.stringify(out);
};
window.ready = true;
</script>`;
const server = http.createServer((req, res) => {
  if (req.url === '/') return res.writeHead(200, { 'Content-Type': 'text/html' }).end(page);
  const file = path.join(repo, decodeURIComponent(req.url));
  if (!file.startsWith(path.join(repo, 'src/sound/'))) return res.writeHead(403).end();
  res.writeHead(200, { 'Content-Type': 'text/javascript' }).end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const profile = path.join(film, 'out/.chrome-sfx');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=9335', `--user-data-dir=${profile}`, '--no-first-run', `http://127.0.0.1:${port}/`], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60 && !ws; i += 1) {
  try {
    const target = (await (await fetch('http://127.0.0.1:9335/json/list')).json()).find((x) => x.type === 'page' && x.url.includes(String(port)));
    if (target) ws = new WebSocket(target.webSocketDebuggerUrl);
  } catch {
    /* chrome not up yet */
  }
  if (!ws) await sleep(250);
}
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) pending.get(m.id)(m);
});
const evaluate = (expression) =>
  new Promise((r) => {
    id += 1;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  });
for (let i = 0; i < 40; i += 1) {
  if ((await evaluate('window.ready === true')).result?.result?.value) break;
  await sleep(250);
}
const res = await evaluate('window.renderAll()');
const sounds = JSON.parse(res.result.result.value);
const meta = {};
for (const [name, { wav, reverb }] of Object.entries(sounds)) {
  fs.writeFileSync(path.join(outDir, `${name}.wav`), Buffer.from(wav, 'base64'));
  meta[name] = { reverb };
}
fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 1));
console.log('rendered', Object.keys(sounds).length, 'site sounds:', Object.keys(sounds).join(', '));
ws.close();
chrome.kill();
server.close();
fs.rmSync(profile, { recursive: true, force: true });
