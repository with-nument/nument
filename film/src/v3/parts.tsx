import React from 'react';
import { Img, staticFile } from 'remotion';
import { prog } from '../ui/kit';
import { FocusWord, L, SANS } from './look';

export type Item = { text: string; at: number; gradient?: boolean; color?: string; weight?: number };

/**
 * A centred line in the reference style: words sit around a fixed centre slot (usually a glossy
 * icon), each word blurs into focus at its voiceover time, and the whole line blurs out at `exitAt`.
 * Space for every word is reserved from the start so nothing reflows while words appear.
 */
export const Line: React.FC<{ t: number; left: Item[]; right?: Item[]; exitAt?: number; size?: number; gap?: number; centre?: React.ReactNode; centreW?: number }> = ({
  t,
  left,
  right = [],
  exitAt = 1e9,
  size = 56,
  gap = 30,
  centre,
  centreW = 0,
}) => {
  const out = prog(t, exitAt, exitAt + 0.28);
  if (out >= 1) return null;
  const word = (it: Item, i: number) => (
    <FocusWord key={i} k={prog(t, it.at - 0.05, it.at + 0.3)} gradient={it.gradient} color={it.color} size={size} weight={it.weight}>
      {it.text}
    </FocusWord>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        display: 'grid',
        gridTemplateColumns: `1fr ${centreW}px 1fr`,
        alignItems: 'center',
        // without a centre slot the two halves still need a normal word space between them
        columnGap: centre || centreW ? gap : size * 0.26,
        transform: 'translateY(-50%)',
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: size * 0.26 }}>{left.map(word)}</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{centre}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: size * 0.26 }}>{right.map(word)}</div>
    </div>
  );
};

// ---------- glossy glass tile with a white glyph ----------
export type Glyph = 'clock' | 'heart' | 'moon';

const GlyphSvg: React.FC<{ kind: Glyph; t: number }> = ({ kind, t }) => {
  if (kind === 'clock') {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round">
        <circle cx="32" cy="32" r="24" />
        <line x1="32" y1="32" x2="32" y2="17" transform={`rotate(${t * 220} 32 32)`} />
        <line x1="32" y1="32" x2="43" y2="32" transform={`rotate(${t * 18} 32 32)`} />
      </svg>
    );
  }
  if (kind === 'heart') {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <path d="M32 54 C10 40 6 28 10 20 C14 11 26 10 32 20 C38 10 50 11 54 20 C58 28 54 40 32 54 Z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <path d="M40 10 A22 22 0 1 0 54 42 A18 18 0 1 1 40 10 Z" fill="#fff" />
      <circle cx="47" cy="17" r="2.4" fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 9)} />
      <circle cx="54" cy="27" r="1.7" fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 7 + 1)} />
    </svg>
  );
};

export const GlassTile: React.FC<{ kind: Glyph; t: number; size?: number; pulse?: number }> = ({ kind, t, size = 140, pulse = 0 }) => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size,
      // a slow idle tilt so the glass catches light like a real object
      transform: `scale(${1 + 0.08 * Math.sin(pulse * Math.PI)}) rotateX(${Math.sin(t * 1.3) * 7}deg) rotateY(${Math.cos(t * 1.1) * 9}deg)`,
    }}
  >
    <div style={{ position: 'absolute', inset: '18% 4% -12%', borderRadius: '30%', background: 'radial-gradient(closest-side, rgba(47,123,255,0.5), rgba(47,123,255,0))', filter: 'blur(14px)' }} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: size * 0.27,
        background: 'linear-gradient(155deg, #9DB6FF 0%, #4F6EFF 48%, #3240E6 100%)',
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.85), inset 0 0 0 1.5px rgba(255,255,255,0.28), inset 0 -16px 32px rgba(28,40,200,0.5), 0 22px 40px -16px rgba(50,64,230,0.55)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: '-20%', right: '-20%', top: '-55%', height: '95%', borderRadius: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0))' }} />
      <div style={{ position: 'absolute', left: '12%', right: '12%', bottom: '7%', height: '10%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(180,220,255,0.55), rgba(180,220,255,0))' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${size / 140})` }}>
        <GlyphSvg kind={kind} t={t} />
      </div>
    </div>
  </div>
);

/** macOS-style pointer. */
export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width="44" height="58" viewBox="0 0 22 29" style={{ position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.12 * press})`, transformOrigin: '3px 3px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))' }}>
    <path d="M2 2 L2 24 L8 18.5 L12 27 L15.5 25.5 L11.6 17.2 L19.5 17.2 Z" fill="#111216" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

/** Glassy "Live" pill. */
export const LiveBadge: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 28px',
      borderRadius: 40,
      background: 'linear-gradient(180deg, #FFFFFF, #F1F3FF)',
      boxShadow: '0 20px 40px -14px rgba(67,56,255,0.45), inset 0 0 0 1.5px rgba(110,130,255,0.35)',
      fontFamily: SANS,
      fontSize: 40,
      fontWeight: 500,
      color: L.ink,
      transform: `scale(${0.6 + 0.4 * k})`,
      opacity: k,
    }}
  >
    <span style={{ position: 'relative', width: 16, height: 16 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: 16, background: L.grad }} />
      <span style={{ position: 'absolute', inset: -10 * ((t * 1.4) % 1), borderRadius: 40, border: `2px solid ${L.blue}`, opacity: 1 - ((t * 1.4) % 1) }} />
    </span>
    Live
  </div>
);

/** Floating product card with a caption row, like the reference's video cards. */
export const ProductCard: React.FC<{ src: string; title: string; meta: string; w?: number }> = ({ src, title, meta, w = 420 }) => (
  <div style={{ width: w, borderRadius: 18, background: '#fff', padding: 10, boxShadow: '0 30px 60px -20px rgba(17,18,22,0.28), 0 0 0 1px rgba(17,18,22,0.06)', fontFamily: SANS }}>
    <Img src={staticFile(src)} style={{ width: '100%', height: w * 0.56, objectFit: 'cover', objectPosition: 'top', borderRadius: 12, display: 'block' }} />
    <div style={{ padding: '10px 6px 4px', fontSize: 19, fontWeight: 600, color: L.ink }}>{title}</div>
    <div style={{ padding: '0 6px 6px', fontSize: 15, color: L.sub }}>{meta}</div>
  </div>
);

/** Small glass pill that pops off an icon ("6 hrs saved", "Rerouted 3:12 AM"). */
export const Pill: React.FC<{ k: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, children, style }) => (
  <div
    style={{
      position: 'absolute',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 20px',
      borderRadius: 30,
      background: 'rgba(255,255,255,0.9)',
      boxShadow: '0 18px 36px -14px rgba(50,64,230,0.4), inset 0 0 0 1px rgba(110,130,255,0.25)',
      fontFamily: SANS,
      fontSize: 24,
      fontWeight: 500,
      color: L.ink,
      whiteSpace: 'nowrap',
      opacity: k,
      transform: `translateY(${(1 - k) * 18}px) scale(${0.85 + 0.15 * k})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Little glass hearts drifting up from the heart tile. */
export const FloatHearts: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <>
    {[0, 1, 2, 3, 4].map((i) => {
      const k = prog(t, at + i * 0.08, at + 1.0 + i * 0.08);
      if (k <= 0 || k >= 1) return null;
      const x = Math.sin(i * 2.3) * 70;
      return (
        <svg
          key={i}
          width={30 + (i % 3) * 10}
          height={30 + (i % 3) * 10}
          viewBox="0 0 64 64"
          style={{ position: 'absolute', left: 60 + x, top: 20 - k * (150 + i * 24), opacity: Math.sin(k * Math.PI), transform: `rotate(${(i % 2 ? 1 : -1) * 14}deg)` }}
        >
          <defs>
            <linearGradient id={`fh${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9DB6FF" />
              <stop offset="1" stopColor="#4338FF" />
            </linearGradient>
          </defs>
          <path d="M32 54 C10 40 6 28 10 20 C14 11 26 10 32 20 C38 10 50 11 54 20 C58 28 54 40 32 54 Z" fill={`url(#fh${i})`} />
        </svg>
      );
    })}
  </>
);
