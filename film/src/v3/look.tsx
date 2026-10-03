import React from 'react';
import { Img, random, staticFile } from 'remotion';

// ---------- v3 look: white stage, small precise type, one gradient accent, glossy objects ----------
export const L = {
  bg: '#F7F7F9',
  ink: '#111216',
  sub: '#8A8D96',
  hair: '#E7E8EC',
  grad: 'linear-gradient(92deg, #4338FF 0%, #2F7BFF 52%, #22C3EE 100%)',
  indigo: '#4338FF',
  blue: '#2F7BFF',
  cyan: '#22C3EE',
  pink: '#FF6FD8',
  charcoal: '#29292B',
  paper: '#EEF4F0',
};
export const SANS = "'Inter Text', 'Inter', system-ui, sans-serif";

/** A word that blurs into focus (k: 0 → 1). */
export const FocusWord: React.FC<{ k: number; children: React.ReactNode; gradient?: boolean; color?: string; size?: number; weight?: number }> = ({
  k,
  children,
  gradient,
  color = L.ink,
  size = 56,
  weight = 500,
}) => (
  <span
    style={{
      display: 'inline-block',
      fontFamily: SANS,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: '-0.02em',
      opacity: Math.min(1, k * 1.4),
      filter: `blur(${(1 - k) * 14}px)`,
      transform: `scale(${1.08 - 0.08 * k})`,
      ...(gradient ? { backgroundImage: L.grad, WebkitBackgroundClip: 'text', color: 'transparent' } : { color }),
    }}
  >
    {children}
  </span>
);

/** Glossy glass "idea" folder: back plate, paper, frosted front pocket. `hollow` 0→1 drains it to an outline. */
export const IdeaFolder: React.FC<{ size?: number; hollow?: number }> = ({ size = 150, hollow = 0 }) => {
  const s = size / 150;
  return (
    <div style={{ position: 'relative', width: 150 * s, height: 124 * s, filter: `saturate(${1 - hollow})`, opacity: 1 - hollow * 0.45 }}>
      <div style={{ position: 'absolute', inset: `${16 * s}px ${6 * s}px ${-14 * s}px`, borderRadius: 30 * s, background: 'radial-gradient(closest-side, rgba(47,123,255,0.45), rgba(47,123,255,0))', filter: `blur(${12 * s}px)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 6 * s, bottom: 0, borderRadius: 22 * s, background: 'linear-gradient(160deg, #6A8BFF, #2F5BFF 55%, #2A46E8)' }} />
      {[
        [26, 0, -5],
        [52, 8, 4],
      ].map(([x, y, r], i) => (
        <div key={i} style={{ position: 'absolute', left: x * s, top: y * s, width: 74 * s, height: 92 * s, borderRadius: 9 * s, background: '#fff', transform: `rotate(${r}deg)`, boxShadow: '0 4px 10px rgba(20,30,90,0.18)', padding: 10 * s }}>
          {[0.8, 0.55, 0.7, 0.4].map((w, j) => (
            <div key={j} style={{ height: 5 * s, width: `${w * 100}%`, borderRadius: 4, background: j === 0 ? '#BFC9F5' : '#E1E5F4', marginTop: j ? 7 * s : 4 * s }} />
          ))}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 46 * s,
          bottom: 0,
          borderRadius: 22 * s,
          background: 'linear-gradient(180deg, rgba(150,180,255,0.62), rgba(64,110,255,0.78))',
          backdropFilter: `blur(${6 * s}px)`,
          boxShadow: `inset 0 ${1.5 * s}px 0 rgba(255,255,255,0.7), inset 0 -${10 * s}px ${22 * s}px rgba(30,60,220,0.35)`,
          border: `${1 * s}px solid rgba(255,255,255,0.45)`,
        }}
      >
        <div style={{ position: 'absolute', left: 16 * s, bottom: 16 * s, fontFamily: SANS, fontSize: 15 * s, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>Ideas</div>
        <div style={{ position: 'absolute', right: 14 * s, bottom: 16 * s, width: 10 * s, height: 10 * s, borderRadius: 10 * s, background: 'rgba(255,255,255,0.9)' }} />
      </div>
      {hollow > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 6 * s, bottom: 0, borderRadius: 22 * s, border: `${2 * s}px dashed rgba(17,18,22,${0.35 * hollow})` }} />
      )}
    </div>
  );
};

/** Thick gradient progress bar with a counter. */
export const Progress: React.FC<{ value: number; stalled?: number; width?: number }> = ({ value, stalled = 0, width = 980 }) => (
  <div style={{ position: 'relative', width }}>
    <div style={{ textAlign: 'right', fontFamily: SANS, fontSize: 54, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 18 }}>
      <span style={stalled ? { color: L.ink } : { backgroundImage: L.grad, WebkitBackgroundClip: 'text', color: 'transparent' }}>{Math.round(value)}</span>
      <span style={{ color: '#C9CBD3' }}>/100</span>
    </div>
    <div style={{ height: 60, borderRadius: 60, background: '#ECEDF2', boxShadow: 'inset 0 2px 6px rgba(17,18,22,0.06)' }}>
      <div
        style={{
          width: `${Math.max(9, value)}%`,
          height: '100%',
          borderRadius: 60,
          background: stalled ? `linear-gradient(90deg, #B9BCC6, #D8DAE0)` : 'linear-gradient(90deg, #C9C6FF 0%, #4338FF 30%, #2F7BFF 70%, #7FD8F5 100%)',
          boxShadow: stalled ? 'none' : '0 18px 40px -10px rgba(67,56,255,0.45)',
        }}
      />
    </div>
  </div>
);

/** "Done" check in a glassy circle. */
export const DoneCheck: React.FC<{ k: number; size?: number }> = ({ k, size = 170 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: 'radial-gradient(circle at 35% 30%, #FFFFFF, #EEF1FF 60%, #DDE3FF)',
      boxShadow: '0 30px 60px -20px rgba(67,56,255,0.45), inset 0 0 0 2px rgba(110,130,255,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${0.6 + 0.4 * k})`,
      opacity: k,
    }}
  >
    <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 40 40" fill="none" stroke="url(#doneGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="doneGrad" x1="0" x2="1">
          <stop offset="0" stopColor={L.indigo} />
          <stop offset="1" stopColor={L.cyan} />
        </linearGradient>
      </defs>
      <path d="M8 21l8 8 16-17" strokeDasharray="48" strokeDashoffset={48 * (1 - k)} />
    </svg>
  </div>
);

/** Confetti burst from (cx, cy); t = seconds since burst. */
export const Confetti: React.FC<{ t: number; cx: number; cy: number; n?: number }> = ({ t, cx, cy, n = 90 }) => {
  if (t < 0) return null;
  const colors = [L.indigo, L.blue, L.cyan, L.pink, '#9B8CFF'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const v = 500 + random(`v${i}`) * 900;
        // pieces start on a ring around the check (not a clump at its centre) and fly outward
        const r0 = 90 + random(`r0${i}`) * 50;
        const x = cx + Math.cos(a) * (r0 + v * t * 1.6);
        const y = cy + Math.sin(a) * (r0 * 0.9 + v * t * 0.9) + 900 * t * t;
        // a few big pieces fly close to the camera (larger, blurrier), like real confetti
        const near = random(`n${i}`) > 0.86;
        const w = near ? 60 + random(`w${i}`) * 60 : 10 + random(`w${i}`) * 26;
        const rot = random(`r${i}`) * 360 + t * (random(`s${i}`) - 0.5) * 900;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: w * (0.35 + random(`h${i}`) * 0.5),
              background: colors[i % colors.length],
              transform: `rotate(${rot}deg) rotateX(${rot * 1.3}deg) rotateY(${rot * 0.7}deg)`,
              borderRadius: i % 3 === 0 ? 3 : 1,
              opacity: Math.min(1, t * 12) * Math.max(0, 1 - t / 1.6),
              filter: `blur(${near ? 6 : Math.min(1.5, v * 0.001 * (1 - t))}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const SCREENS = ['project1/2.webp', 'project3/1.webp', 'project1/3.webp', 'project2/1.webp', 'project4/2.webp', 'project1/7.webp', 'project5/3.webp', 'project3/2.webp', 'project4/5.webp', 'project5/1.webp', 'project2/2.webp', 'project1/4.webp'];

/** Hexagonal tunnel of product screens; `z` moves the camera forward through it. */
export const Tunnel: React.FC<{ z: number; spin?: number }> = ({ z, spin = 0 }) => {
  const faces = 6;
  const R = 640;
  const depthStep = 1100;
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 900, perspectiveOrigin: '50% 50%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d', transform: `translateZ(${z}px) rotateZ(${spin}deg)` }}>
        {Array.from({ length: 4 * faces }, (_, i) => {
          const ring = Math.floor(i / faces);
          const f = i % faces;
          const ang = (360 / faces) * f;
          const src = SCREENS[i % SCREENS.length];
          const phone = /project1\/(2|3|4|7)/.test(src);
          const W = phone ? 380 : 980;
          const H = phone ? 760 : 560;
          // depth of field: panels rushing past the lens blur, far ones soften
          const depth = z - ring * depthStep - (f % 2) * 420 - 300;
          const dof = depth > 150 ? Math.min(14, (depth - 150) / 45) : depth < -2600 ? Math.min(3, (-depth - 2600) / 500) : 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: W,
                height: H,
                left: -W / 2,
                top: -H / 2,
                transformStyle: 'preserve-3d',
                // applied right to left: lay the panel flat (rotateX), push it down the tunnel (translateZ),
                // out to the wall (translateY), then around the axis (rotateZ)
                transform: `rotateZ(${ang}deg) translateY(${R}px) translateZ(${-ring * depthStep - (f % 2) * 420 - 300}px) rotateX(90deg)`,
                backfaceVisibility: 'hidden',
                borderRadius: phone ? 48 : 18,
                overflow: 'hidden',
                background: '#fff',
                border: phone ? '10px solid #0D0D10' : '1px solid #DADCE3',
                boxShadow: '0 30px 60px rgba(17,18,22,0.18)',
                filter: dof > 0.3 ? `blur(${dof}px)` : undefined,
              }}
            >
              <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Four-point sparkle (the AI mark that becomes the logo). */
export const Sparkle: React.FC<{ size: number; rot?: number; style?: React.CSSProperties }> = ({ size, rot = 0, style }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 12px 24px rgba(47,123,255,0.45))', ...style }}>
    <defs>
      <linearGradient id="spark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7FD8F5" />
        <stop offset="0.5" stopColor={L.blue} />
        <stop offset="1" stopColor={L.indigo} />
      </linearGradient>
    </defs>
    <path d="M0,-48 C6,-14 14,-6 48,0 C14,6 6,14 0,48 C-6,14 -14,6 -48,0 C-14,-6 -6,-14 0,-48 Z" fill="url(#spark)" />
  </svg>
);

/** Nument mark: the site's charcoal tile with the "N". */
export const Mark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: L.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontFamily: "'Inter Display', sans-serif", fontWeight: 700, fontSize: size * 0.62, color: L.paper, lineHeight: 1, marginTop: -size * 0.02 }}>N</span>
  </div>
);
