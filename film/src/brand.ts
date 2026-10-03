import { Easing, interpolate, spring } from 'remotion';
import cues from './generated/vo-cues.json';
import timeline from './timeline.json';

export const FPS = timeline.fps;

// Sampled from the "Nument is now live in India" poster; the film stays light, blue is used as light.
export const C = {
  paper: '#F7F9FD',
  white: '#FFFFFF',
  navy: '#0A1854',
  cobalt: '#233E92',
  electric: '#3159D4',
  azure: '#4E78C1',
  sky: '#8BADDC',
  ice: '#B9CFE6',
  mist: '#E6EEFA',
  line: '#DCE4F2',
  muted: '#5D6B8A',
  faint: '#9AA6BF',
};

export const FONT = "'Inter Display', 'Inter', system-ui, sans-serif";
export const MONO = "'SF Mono', Menlo, Monaco, monospace";

/** Deeper gradient for type, so the last letters keep contrast on paper. */
export const TEXT_GRADIENT = `linear-gradient(100deg, ${C.cobalt} 0%, ${C.electric} 45%, ${C.azure} 100%)`;

export const BRAND_GRADIENT = `linear-gradient(112deg, ${C.cobalt} 0%, ${C.electric} 28%, ${C.azure} 52%, ${C.sky} 76%, ${C.ice} 100%)`;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  snap: Easing.bezier(0.2, 0.9, 0.1, 1),
};

/** 0→1 progress of absolute time `t` between seconds `a` and `b`. */
export const p = (t: number, a: number, b: number, easing = ease.out) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Spring that starts at absolute second `at`. */
export const springAt = (t: number, at: number, config: Partial<{ damping: number; stiffness: number; mass: number }> = {}) =>
  spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { damping: 200, stiffness: 120, mass: 1, ...config } });

type Cue = (typeof cues.cues)[number];
const byLine: Record<string, Cue> = Object.fromEntries(cues.cues.map((c) => [c.line, c]));

/** Absolute start (s) of word `index` in voiceover line `line`. */
export const w = (line: string, index: number) => byLine[line].words[index].start;
export const lineEnd = (line: string) => byLine[line].speechEnd;

export const section = (id: string) => timeline.sections.find((s) => s.id === id)!;
