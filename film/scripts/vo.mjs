// Generates voiceover takes with Cartesia. Usage:
//   node scripts/vo.mjs <jobs.json> <outDir>
// jobs.json: [{ "name": "l1-morgan-1", "voice": "<id>", "language": "en", "text": "...", "speed": 1, "emotion": "content" }]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
);
const [jobsFile, outDir] = process.argv.slice(2);
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const SAMPLE_RATE = 48000;

const wavHeader = (dataBytes) => {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + dataBytes, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(dataBytes, 40);
  return h;
};

// SSE endpoint so each take comes with word timestamps (saved next to the wav as .words.json).
const synth = async (job) => {
  const body = {
    model_id: 'sonic-3',
    transcript: job.text,
    voice: { mode: 'id', id: job.voice },
    language: job.language,
    output_format: { container: 'raw', encoding: 'pcm_s16le', sample_rate: SAMPLE_RATE },
    generation_config: { speed: job.speed ?? 1, volume: 1, ...(job.emotion ? { emotion: job.emotion } : {}) },
    add_timestamps: true,
  };
  const res = await fetch('https://api.cartesia.ai/tts/sse', {
    method: 'POST',
    headers: { 'X-API-Key': env.CARTESIA_API_KEY, 'Cartesia-Version': '2025-04-16', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${job.name}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const chunks = [];
  const words = [];
  for (const line of (await res.text()).split('\n')) {
    if (!line.startsWith('data:')) continue;
    const event = JSON.parse(line.slice(5));
    if (event.type === 'error') throw new Error(`${job.name}: ${event.error || JSON.stringify(event)}`);
    if (event.type === 'chunk' && event.data) chunks.push(Buffer.from(event.data, 'base64'));
    if (event.type === 'timestamps' && event.word_timestamps) {
      const { words: w, start, end } = event.word_timestamps;
      w.forEach((word, i) => words.push({ word, start: start[i], end: end[i] }));
    }
  }
  const pcm = Buffer.concat(chunks);
  if (!pcm.length) throw new Error(`${job.name}: no audio returned`);
  fs.writeFileSync(path.join(outDir, `${job.name}.wav`), Buffer.concat([wavHeader(pcm.length), pcm]));
  fs.writeFileSync(path.join(outDir, `${job.name}.words.json`), JSON.stringify({ text: job.text, language: job.language, words }, null, 1));
  return job.name;
};

// One request at a time (the free plan allows 2 concurrent); retry when rate limited.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const job of jobs) {
  if (fs.existsSync(path.join(outDir, `${job.name}.wav`))) continue;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      console.log('ok', await synth(job));
      break;
    } catch (err) {
      if (!err.message.includes('HTTP 429') || attempt === 5) {
        console.log('FAIL', err.message);
        break;
      }
      await sleep(1500 * attempt);
    }
  }
}
