// Synthesis recipes for the site's micro sounds. Each `build` schedules nodes on an
// OfflineAudioContext; the engine renders them once and replays the buffers.
// `drift` is a small random pitch factor so repeated sounds never feel identical.

const SILENT = 0.0001;

const noiseSource = (ctx, seconds, start = 0) => {
  const length = Math.ceil(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.start(start);
  return source;
};

const filter = (ctx, type, frequency, q = 0.7) => {
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.Q.value = q;
  return node;
};

// Percussive envelope: fast linear attack, exponential decay.
const envelope = (ctx, start, attack, peak, end) => {
  const node = ctx.createGain();
  node.gain.setValueAtTime(0, 0);
  node.gain.setValueAtTime(SILENT, start);
  node.gain.linearRampToValueAtTime(peak, start + attack);
  node.gain.exponentialRampToValueAtTime(SILENT, end);
  return node;
};

const chain = (...nodes) => {
  for (let i = 0; i < nodes.length - 1; i += 1) nodes[i].connect(nodes[i + 1]);
  return nodes[nodes.length - 1];
};

// Soft glass bell: sine carrier with a decaying 2:1 frequency modulator.
const bell = (ctx, out, frequency, start, length, level) => {
  const carrier = ctx.createOscillator();
  carrier.frequency.value = frequency;
  const modulator = ctx.createOscillator();
  modulator.frequency.value = frequency * 2;
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(frequency * 0.55, start);
  depth.gain.exponentialRampToValueAtTime(frequency * 0.02, start + length * 0.6);
  chain(modulator, depth, carrier.frequency);
  chain(carrier, envelope(ctx, start, 0.004, level, start + length), out);
  carrier.start(start);
  modulator.start(start);
};

// Filtered-noise sweep used by the whooshes.
const sweep = (ctx, out, { length, from, to, peakAt, level, panFrom, panTo }) => {
  const lowpass = filter(ctx, 'lowpass', from, 0.9);
  lowpass.frequency.setValueAtTime(from, 0);
  lowpass.frequency.exponentialRampToValueAtTime(to, peakAt + 0.08);
  lowpass.frequency.exponentialRampToValueAtTime(Math.min(from, to) * 1.6, length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(level, peakAt);
  gain.gain.exponentialRampToValueAtTime(SILENT, length - 0.02);
  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panFrom, 0);
  panner.pan.linearRampToValueAtTime(panTo, length);
  chain(noiseSource(ctx, length), filter(ctx, 'highpass', 140), lowpass, gain, panner, out);
};

const TONE_STEPS = [0, 2, 4, 7, 9, 12, 14, 16, 19]; // major pentatonic, two octaves

const recipes = {
  // Any click on a link or button.
  click: {
    duration: 0.08,
    gain: 0.3,
    reverb: 0.05,
    build: (ctx, out, { drift }) => {
      const hp = filter(ctx, 'highpass', 320);
      hp.connect(out);
      chain(noiseSource(ctx, 0.04), filter(ctx, 'bandpass', 3000 * drift, 1.1), envelope(ctx, 0, 0.0015, 0.9, 0.03), hp);
      const blip = ctx.createOscillator();
      blip.frequency.setValueAtTime(1700 * drift, 0);
      blip.frequency.exponentialRampToValueAtTime(1100 * drift, 0.03);
      chain(blip, envelope(ctx, 0, 0.001, 0.32, 0.04), hp);
      blip.start(0);
    },
  },

  // Pointer entering a link or button.
  hover: {
    duration: 0.04,
    gain: 0.09,
    reverb: 0.03,
    build: (ctx, out, { drift }) => {
      const tick = ctx.createOscillator();
      tick.frequency.value = 3400 * drift;
      chain(tick, envelope(ctx, 0, 0.001, 0.5, 0.018), out);
      tick.start(0);
      chain(noiseSource(ctx, 0.02), filter(ctx, 'highpass', 7000), envelope(ctx, 0, 0.0008, 0.25, 0.008), out);
    },
  },

  // Detent while scrolling.
  tick: {
    duration: 0.03,
    gain: 0.09,
    reverb: 0.02,
    build: (ctx, out, { drift }) => {
      chain(noiseSource(ctx, 0.02), filter(ctx, 'bandpass', 5200 * drift, 3), envelope(ctx, 0, 0.0007, 1, 0.012), out);
      const body = ctx.createOscillator();
      body.frequency.value = 2600 * drift;
      chain(body, envelope(ctx, 0, 0.0007, 0.22, 0.01), out);
      body.start(0);
    },
  },

  // Menu opening / closing.
  whooshIn: {
    duration: 0.6,
    gain: 0.3,
    reverb: 0.16,
    build: (ctx, out, { drift }) => sweep(ctx, out, { length: 0.6, from: 280, to: 3200 * drift, peakAt: 0.22, level: 0.9, panFrom: -0.35, panTo: 0.35 }),
  },
  whooshOut: {
    duration: 0.55,
    gain: 0.55,
    reverb: 0.16,
    build: (ctx, out, { drift }) => sweep(ctx, out, { length: 0.55, from: 3000 * drift, to: 300, peakAt: 0.12, level: 0.8, panFrom: 0.35, panTo: -0.35 }),
  },

  // Page change: slow airy swell that settles with a soft low thump.
  transition: {
    duration: 1.1,
    gain: 0.25,
    reverb: 0.22,
    build: (ctx, out, { drift }) => {
      sweep(ctx, out, { length: 1.05, from: 220, to: 2000 * drift, peakAt: 0.4, level: 0.8, panFrom: 0.2, panTo: -0.2 });
      const sub = ctx.createOscillator();
      sub.frequency.setValueAtTime(110 * drift, 0.42);
      sub.frequency.exponentialRampToValueAtTime(48, 0.68);
      chain(sub, envelope(ctx, 0.42, 0.01, 0.7, 0.78), out);
      sub.start(0.42);
    },
  },

  // Slicing a logo in the footer game.
  slice: {
    duration: 0.35,
    gain: 0.25,
    reverb: 0.12,
    build: (ctx, out, { drift }) => {
      const hp = filter(ctx, 'highpass', 1200, 0.9);
      hp.frequency.setValueAtTime(1200, 0);
      hp.frequency.exponentialRampToValueAtTime(7000 * drift, 0.09);
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(-0.3, 0);
      panner.pan.linearRampToValueAtTime(0.3, 0.1);
      chain(noiseSource(ctx, 0.14), hp, envelope(ctx, 0, 0.02, 0.9, 0.13), panner, out);
      const pop = ctx.createOscillator();
      pop.frequency.setValueAtTime(520 * drift, 0.07);
      pop.frequency.exponentialRampToValueAtTime(160, 0.15);
      chain(pop, envelope(ctx, 0.07, 0.002, 0.6, 0.18), out);
      pop.start(0.07);
    },
  },

  // Hovering an item in the Services / Process lists; variant = pitch step.
  tone: {
    duration: 0.6,
    gain: 0.17,
    reverb: 0.3,
    variants: TONE_STEPS.length,
    build: (ctx, out, { index }) => bell(ctx, out, 523.25 * 2 ** (TONE_STEPS[index] / 12), 0, 0.5, 0.5),
  },

  // Sound toggle.
  chimeOn: {
    duration: 1.2,
    gain: 0.24,
    reverb: 0.35,
    variants: 1,
    build: (ctx, out) => {
      bell(ctx, out, 659.25, 0, 0.8, 0.45);
      bell(ctx, out, 987.77, 0.09, 0.9, 0.4);
    },
  },
  chimeOff: {
    duration: 1.2,
    gain: 0.24,
    reverb: 0.35,
    variants: 1,
    build: (ctx, out) => {
      bell(ctx, out, 987.77, 0, 0.8, 0.4);
      bell(ctx, out, 659.25, 0.09, 0.9, 0.45);
    },
  },
};

export default recipes;
