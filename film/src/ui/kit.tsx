import { Easing, interpolate } from 'remotion';

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 progress of time `t` between seconds `a` and `b`. */
export const prog = (t: number, a: number, b: number, e = easeOut) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
