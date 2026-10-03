// Renders stills at given seconds and tiles them into a contact sheet.
// Usage: node scripts/stills.mjs <name> <sec> [<sec> ...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [name, ...secs] = process.argv.slice(2);
const out = path.resolve('out/stills');
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('../public') });
const composition = await selectComposition({ serveUrl, id: 'NumentFilm' });
const files = [];
for (const s of secs.map(Number)) {
  const file = path.join(out, `${name}-${s.toFixed(2)}.png`);
  await renderStill({ composition, serveUrl, frame: Math.round(s * composition.fps), output: file, scale: 0.5 });
  files.push(file);
}
const cols = Math.min(3, files.length);
const rows = Math.ceil(files.length / cols);
const inputs = files.flatMap((f) => ['-i', f]);
const layout = files.map((_, i) => `${(i % cols) * 960}_${Math.floor(i / cols) * 540}`).join('|');
const sheet = path.join(out, `${name}-sheet.png`);
if (files.length > 1) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', `xstack=inputs=${files.length}:layout=${layout}:fill=white`, sheet]);
} else fs.copyFileSync(files[0], sheet);
console.log(sheet, `${cols}x${rows}`);
