// Renders every frame of the "Style" composition at full size and tiles them.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('out/style');
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('../public') });
const composition = await selectComposition({ serveUrl, id: 'Style' });
const files = [];
for (let f = 0; f < composition.durationInFrames; f += 1) {
  const file = path.join(out, `style-${f + 1}.png`);
  await renderStill({ composition, serveUrl, frame: f, output: file });
  files.push(file);
}
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', `${files.map((_, i) => `[${i}]scale=960:-1[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=0_0|960_0|0_540|960_540|0_1080:fill=white`, path.join(out, 'style-sheet.png')]);
console.log('style frames in', out);
