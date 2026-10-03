// Micro sound design for the site: every sound is synthesized with the Web Audio API
// (filtered noise transients + short sine / FM tones), rendered once into buffers and
// replayed with small random variations. No audio files are loaded.

import recipes from '@src/sound/recipes';

const STORAGE_KEY = 'nument-sound';
const VARIANTS = 4;
const MAX_VOICES = 8;

// Minimum time between two plays of the same sound, in seconds.
const THROTTLE = { click: 0.04, hover: 0.06, tick: 0.07, tone: 0.05, slice: 0.06, whooshIn: 0.2, whooshOut: 0.2, transition: 0.4, chimeOn: 0.2, chimeOff: 0.2 };
// Sounds dropped first when too many voices are playing.
const LOW_PRIORITY = new Set(['hover', 'tick']);

const isBrowser = typeof window !== 'undefined';

let ctx = null;
let master = null;
let reverbSend = null;
let buffers = {};
let unlocked = false;
let ready = false; // AudioContext running and every sound rendered
let unlockPromise = null;
let voices = 0;
const lastPlayed = {};
const listeners = new Set();

const readPreference = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
};

let enabled = isBrowser ? readPreference() : true;

const notify = () => listeners.forEach((fn) => fn(enabled));

// Short, airy room: decaying stereo noise used as a convolution impulse response.
const createImpulse = (context, seconds = 1.1, decay = 3.2) => {
  const length = Math.floor(context.sampleRate * seconds);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  [0, 1].forEach((channel) => {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  });
  return impulse;
};

const renderRecipe = async (name, variation) => {
  const recipe = recipes[name];
  const offline = new OfflineAudioContext(2, Math.ceil(recipe.duration * ctx.sampleRate), ctx.sampleRate);
  recipe.build(offline, offline.destination, variation);
  return offline.startRendering();
};

const renderAll = async () => {
  const entries = await Promise.all(
    Object.keys(recipes).map(async (name) => {
      const total = recipes[name].variants || VARIANTS;
      const rendered = await Promise.all(
        Array.from({ length: total }, (_, i) => {
          // Variant 0 is the reference sound; the others drift up to ±4% in pitch.
          const drift = i === 0 ? 1 : 1 + (Math.random() * 2 - 1) * 0.04;
          return renderRecipe(name, { drift, index: i });
        }),
      );
      return [name, rendered];
    }),
  );
  buffers = Object.fromEntries(entries);
};

const createGraph = () => {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 12;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.12;
  compressor.connect(ctx.destination);

  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(compressor);

  const reverb = ctx.createConvolver();
  reverb.buffer = createImpulse(ctx);
  const reverbFilter = ctx.createBiquadFilter();
  reverbFilter.type = 'highpass';
  reverbFilter.frequency.value = 350;
  reverbSend = ctx.createGain();
  reverbSend.gain.value = 1;
  reverbSend.connect(reverbFilter);
  reverbFilter.connect(reverb);
  reverb.connect(master);
};

// Must be called from a user gesture (click / tap / key): browsers block audio until then.
// Returns the same promise to every caller, resolved once the sounds are ready to play.
const unlock = () => {
  if (unlockPromise) return unlockPromise;
  if (!isBrowser) return Promise.resolve();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return Promise.resolve();
  unlocked = true;
  ctx = new AudioContextClass({ latencyHint: 'interactive' });
  createGraph();
  unlockPromise = (async () => {
    try {
      await ctx.resume();
      await renderAll();
      ready = true;
      notify();
    } catch {
      // Audio is a nice-to-have; ignore failures (e.g. very old browsers).
    }
  })();
  return unlockPromise;
};

const play = (name, { gain = 1, rate = 1, pan = 0, variant } = {}) => {
  if (!enabled || !ctx || !buffers[name] || document.hidden) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  if (now - (lastPlayed[name] ?? -1) < (THROTTLE[name] ?? 0.03)) return;
  if (voices >= MAX_VOICES && LOW_PRIORITY.has(name)) return;
  lastPlayed[name] = now;

  const list = buffers[name];
  const source = ctx.createBufferSource();
  source.buffer = list[variant ?? Math.floor(Math.random() * list.length)];
  source.playbackRate.value = rate;

  const level = ctx.createGain();
  level.gain.value = gain * (recipes[name].gain ?? 1);
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  source.connect(level);
  level.connect(panner);
  panner.connect(master);

  const reverbAmount = recipes[name].reverb ?? 0;
  if (reverbAmount > 0) {
    const send = ctx.createGain();
    send.gain.value = reverbAmount;
    panner.connect(send);
    send.connect(reverbSend);
  }

  voices += 1;
  source.onended = () => {
    voices -= 1;
    source.disconnect();
  };
  source.start(now);
};

const setEnabled = (value) => {
  enabled = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
  notify();
};

const sound = {
  unlock,
  play,
  setEnabled,
  toggle: () => {
    const next = !enabled;
    if (next) {
      setEnabled(true);
      play('chimeOn');
    } else {
      play('chimeOff');
      setEnabled(false);
    }
  },
  isEnabled: () => enabled,
  isUnlocked: () => unlocked,
  isReady: () => ready,
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  // Dev helper: peak and RMS (dBFS, after each recipe's gain) of every rendered sound.
  levels: () =>
    Object.fromEntries(
      Object.entries(buffers).map(([name, list]) => {
        const data = list[0].getChannelData(0);
        let peak = 0;
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          peak = Math.max(peak, Math.abs(data[i]));
          sum += data[i] * data[i];
        }
        const gain = recipes[name].gain ?? 1;
        const db = (v) => Math.round(20 * Math.log10(Math.max(v * gain, 1e-6)) * 10) / 10;
        return [name, { peakDb: db(peak), rmsDb: db(Math.sqrt(sum / data.length)) }];
      }),
    ),
};

if (isBrowser && process.env.NODE_ENV === 'development') window.nument_sound = sound;

export default sound;
