import { CameraMotionBlur } from '@remotion/motion-blur';
import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import mixWav from '../../assets/mix/mix.wav';
import { w } from '../brand';
import '../fonts';
import { easeInOut, mix, prog } from '../ui/kit';
import { Confetti, DoneCheck, FocusWord, IdeaFolder, L, SANS, Sparkle, Tunnel } from './look';
import { Cursor, FloatHearts, GlassTile, Glyph, Line, LiveBadge, Pill, ProductCard } from './parts';

// One continuous shot. Every beat is keyed to the voiceover word timings (src/generated/vo-cues.json).
const ICON = 150;
const snap = Easing.bezier(0.7, 0, 0.2, 1);
const overshoot = Easing.bezier(0.34, 1.45, 0.64, 1);

/** Segments with fast motion get real camera motion blur (rendered with sub-frame samples). */
const FAST: [number, number][] = [
  [2.72, 3.12],
  [4.33, 4.62],
  [5.83, 6.12],
  [7.55, 8.15],
  [13.3, 14.7],
  [15.8, 18.25],
  [21.35, 22.75],
  [23.15, 26.0],
];

const Check: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={L.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.4l3 3 6-6.6" />
  </svg>
);

/** The centre icon: folder (S1) that flips into clock, heart and moon (S2), with small story details. */
const CentreIcon: React.FC<{ t: number }> = ({ t }) => {
  const flips: [number, Glyph | 'folder'][] = [
    [0, 'folder'],
    [3.0, 'clock'],
    [4.5, 'heart'],
    [6.0, 'moon'],
  ];
  let idx = 0;
  flips.forEach(([at], i) => {
    if (t >= at - 0.12) idx = i;
  });
  const [flipAt, kind] = flips[idx];
  const turn = idx === 0 ? 0 : 1 - prog(t, flipAt - 0.02, flipAt + 0.22, overshoot);
  const pop = prog(t, w('L1', 4) - 0.1, w('L1', 4) + 0.4, overshoot);
  const hollow = prog(t, w('L1', 7), w('L1', 7) + 0.4);
  const pulse = kind === 'heart' ? prog(t, w('L2b', 3), w('L2b', 3) + 0.35) : kind === 'clock' ? prog(t, w('L2a', 4), w('L2a', 4) + 0.35) : 0;
  // the clock hands race until "hours", then settle
  const clockT = kind === 'clock' ? Math.min(t, w('L2a', 4)) * (1 + 4 * (1 - prog(t, 3.0, w('L2a', 4)))) : t;
  return (
    <div style={{ position: 'relative', width: ICON, height: ICON }}>
      <div style={{ perspective: 800, transform: `scale(${idx === 0 ? 0.4 + 0.6 * pop : 1})`, opacity: idx === 0 ? Math.min(1, pop * 1.5) : 1 }}>
        <div style={{ transform: `rotateY(${turn * 90}deg)` }}>
          {kind === 'folder' ? <IdeaFolder size={ICON} hollow={hollow * 0.85} /> : <GlassTile kind={kind} t={clockT} size={ICON} pulse={pulse} />}
        </div>
      </div>
      {kind === 'clock' && (
        <Pill k={prog(t, w('L2a', 4) + 0.05, w('L2a', 4) + 0.35) * (1 - prog(t, 4.3, 4.45))} style={{ left: ICON / 2 - 95, top: ICON + 26 }}>
          <Check /> 6 hrs saved
        </Pill>
      )}
      {kind === 'heart' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <FloatHearts t={t} at={w('L2b', 3)} />
        </div>
      )}
      {kind === 'moon' && (
        <Pill k={prog(t, w('L2c', 3), w('L2c', 3) + 0.3) * (1 - prog(t, 7.4, 7.55))} style={{ left: ICON / 2 - 130, top: ICON + 26 }}>
          <Check /> Rerouted · 3:12 AM
        </Pill>
      )}
    </div>
  );
};

// ---------- S1 + S2 (0–8 s) ----------
const Opening: React.FC<{ t: number }> = ({ t }) => {
  const L1 = (i: number) => w('L1', i);
  const toBar = prog(t, 7.62, 8.05, easeInOut);
  return (
    <>
      <Line
        t={t}
        exitAt={L1(5) - 0.12}
        centreW={ICON}
        left={[
          { text: 'Every', at: L1(0) },
          { text: 'business', at: L1(1) },
          { text: 'has', at: L1(2) },
          { text: 'an', at: L1(3) },
        ]}
        right={[{ text: 'idea.', at: L1(4), gradient: true }]}
      />
      <Line t={t} exitAt={2.8} centreW={ICON} left={[{ text: 'it never', at: L1(5) }]} right={[{ text: 'built.', at: L1(7), color: L.sub }]} />
      <Line
        t={t}
        exitAt={4.36}
        centreW={ICON}
        left={[
          { text: 'A tool', at: w('L2a', 1) },
          { text: 'that saves', at: w('L2a', 3) },
        ]}
        right={[{ text: 'hours.', at: w('L2a', 4), gradient: true }]}
      />
      <Line
        t={t}
        exitAt={5.86}
        centreW={ICON}
        left={[
          { text: 'An app', at: w('L2b', 1) },
          { text: 'customers', at: w('L2b', 2) },
        ]}
        right={[{ text: 'love.', at: w('L2b', 3), gradient: true }]}
      />
      <Line
        t={t}
        exitAt={7.5}
        centreW={ICON}
        left={[
          { text: 'An agent', at: w('L2c', 1) },
          { text: 'that never', at: w('L2c', 3) },
        ]}
        right={[{ text: 'sleeps.', at: w('L2c', 4), gradient: true }]}
      />
      {toBar < 1 && (
        <div style={{ position: 'absolute', left: 960 - ICON / 2, top: 540 - ICON / 2, width: ICON, height: ICON, opacity: 1 - toBar }}>
          <CentreIcon t={t} />
        </div>
      )}
    </>
  );
};

// ---------- S3 + S4: the stalled bar, then "Nument changes that." → Done (7.6–14 s) ----------
const BAR_W = 1000;
const BAR_H = 60;

const BarScene: React.FC<{ t: number }> = ({ t }) => {
  const grow = prog(t, 7.62, 8.1, snap);
  const crawl = interpolate(t, [8.15, 9.05], [0, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - (1 - x) ** 3 });
  // "Not enough time.": the bar slips back and dims
  const slip = prog(t, w('L3b', 4), w('L3b', 5) + 0.15, easeInOut);
  const stallValue = crawl - 3 * slip;
  const stutter = t > w('L3b', 1) && t < w('L3b', 3) ? Math.sin(t * 40) * 0.6 : 0;
  const blackout = prog(t, 11.5, 11.85);
  const back = prog(t, 11.98, 12.12);
  const hit = w('L4', 0) - 0.05;
  const shoot = interpolate(t, [hit, w('L4', 2) + 0.05], [12, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const toCircle = prog(t, w('L4', 2) + 0.12, w('L4', 2) + 0.42, snap);
  const check = prog(t, w('L4', 2) + 0.36, w('L4', 2) + 0.62);
  const dive = prog(t, 13.55, 14.05, (x) => x * x * x);
  const live = t >= 11.95;
  const value = live ? shoot : stallValue + stutter;
  const stalled = !live;

  const width = mix(mix(ICON, BAR_W, grow), 170, toCircle);
  const height = mix(mix(ICON, BAR_H, grow), 170, toCircle);
  const fillPct = mix(Math.max(6, value), 100, toCircle);
  // fades to white for the silent beat, then comes back for the hit
  const visible = t < 11.95 ? 1 - blackout : back * (1 - prog(t, 13.9, 14.05));
  const counter = prog(t, 8.0, 8.3) * (1 - toCircle);

  return (
    <AbsoluteFill style={{ opacity: visible, transform: `scale(${1 + dive * 9})`, transformOrigin: '960px 600px' }}>
      <div style={{ position: 'absolute', left: 960 - width / 2, top: 600 - height / 2, width, height, opacity: 1 - slip * 0.35 }}>
        <div style={{ position: 'absolute', right: 0, top: -84, fontFamily: SANS, fontSize: 54, fontWeight: 500, letterSpacing: '-0.02em', opacity: counter, whiteSpace: 'nowrap' }}>
          <span style={stalled ? { color: L.ink } : { backgroundImage: L.grad, WebkitBackgroundClip: 'text', color: 'transparent' }}>{Math.round(value)}</span>
          <span style={{ color: '#C9CBD3' }}>/100</span>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: Math.min(width, height) / 2,
            background: grow < 1 ? 'linear-gradient(155deg, #9DB6FF 0%, #4F6EFF 48%, #3240E6 100%)' : '#ECEDF2',
            overflow: 'hidden',
            boxShadow: toCircle > 0 ? '0 30px 60px -20px rgba(67,56,255,0.45)' : 'inset 0 2px 6px rgba(17,18,22,0.06)',
          }}
        >
          {grow >= 1 && (
            <div
              style={{
                width: `${fillPct}%`,
                height: '100%',
                borderRadius: BAR_H,
                background: stalled ? 'linear-gradient(90deg, #B9BCC6, #D8DAE0)' : 'linear-gradient(90deg, #C9C6FF 0%, #4338FF 30%, #2F7BFF 70%, #7FD8F5 100%)',
                boxShadow: stalled ? 'none' : '0 0 40px rgba(67,56,255,0.45)',
                opacity: 1 - toCircle,
              }}
            />
          )}
          {toCircle > 0 && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 30%, #FFFFFF, #EEF1FF 60%, #DDE3FF)', opacity: toCircle }} />}
        </div>
        {check > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoneCheck k={check} size={170} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const BarText: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760 }}>
    <Line
      t={t}
      exitAt={w('L3b', 0) - 0.12}
      left={[
        { text: 'But most', at: w('L3a', 1) },
        { text: 'never', at: w('L3a', 2) },
      ]}
      right={[
        { text: 'get', at: w('L3a', 3) },
        { text: 'made.', at: w('L3a', 4), color: L.sub },
      ]}
    />
    <Line t={t} exitAt={w('L3b', 3) - 0.12} left={[{ text: 'Not enough', at: w('L3b', 1) }]} right={[{ text: 'engineers.', at: w('L3b', 2), color: L.sub }]} />
    <Line t={t} exitAt={11.5} left={[{ text: 'Not enough', at: w('L3b', 4) }]} right={[{ text: 'time.', at: w('L3b', 5), color: L.sub }]} />
    <Line
      t={t}
      exitAt={w('L4', 2) + 0.3}
      left={[{ text: 'Nument', at: w('L4', 0), weight: 600 }]}
      right={[
        { text: 'changes', at: w('L4', 1) },
        { text: 'that.', at: w('L4', 2), gradient: true },
      ]}
    />
    <Line
      t={t}
      exitAt={13.5}
      left={[]}
      centre={
        <FocusWord k={prog(t, w('L4', 2) + 0.3, w('L4', 2) + 0.6)} gradient size={60}>
          Done
        </FocusWord>
      }
      centreW={200}
    />
  </div>
);

// ---------- S5: tunnel, idea → live, in weeks (14–21 s) ----------
const Build: React.FC<{ t: number }> = ({ t }) => {
  const W5 = (i: number) => w('L5', i);
  // speed ramp: rush in, ease right down on "AI agents", rush out
  const z = interpolate(t, [13.8, 14.7, W5(4) - 0.2, W5(4) + 0.9, 17.95], [-1100, 600, 900, 1200, 3400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const spin = interpolate(t, [13.8, 17.95], [-16, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tunnelIn = prog(t, 13.85, 14.2);
  const tunnelOut = prog(t, 17.72, 18.15);
  const pill = (items: { text: string; at: number; gradient?: boolean }[], exitAt: number) => {
    const out = prog(t, exitAt, exitAt + 0.25);
    if (out >= 1 || t < items[0].at - 0.1) return null;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', display: 'flex', justifyContent: 'center', transform: 'translateY(-50%)', opacity: 1 - out, filter: `blur(${out * 10}px)` }}>
        <div style={{ display: 'flex', gap: 16, padding: '18px 34px', borderRadius: 44, background: 'rgba(247,247,249,0.86)', backdropFilter: 'blur(16px)' }}>
          {items.map((it, i) => (
            <FocusWord key={i} k={prog(t, it.at - 0.05, it.at + 0.3)} gradient={it.gradient} size={54}>
              {it.text}
            </FocusWord>
          ))}
        </div>
      </div>
    );
  };
  // from idea to live: the folder travels the line and becomes the Live badge
  const rowIn = prog(t, W5(10) - 0.15, W5(10) + 0.2);
  const rowOut = prog(t, W5(14) - 0.1, W5(14) + 0.2);
  const travel = prog(t, W5(11) - 0.05, W5(13), easeInOut);
  const liveK = prog(t, W5(13) - 0.02, W5(13) + 0.3, overshoot);
  const weeksOut = prog(t, 20.45, 20.8);
  return (
    <>
      {tunnelOut < 1 && (
        <AbsoluteFill style={{ opacity: tunnelIn * (1 - tunnelOut) }}>
          <Tunnel z={z} spin={spin} />
        </AbsoluteFill>
      )}
      {pill(
        [
          { text: 'We design', at: W5(1) },
          { text: 'and build', at: W5(3) },
        ],
        W5(4) - 0.15,
      )}
      {pill(
        [
          { text: 'AI agents.', at: W5(4), gradient: t < W5(6) - 0.05 },
          { text: 'Apps.', at: W5(6), gradient: t >= W5(6) - 0.05 && t < W5(8) - 0.05 },
          { text: 'Internal tools.', at: W5(8), gradient: t >= W5(8) - 0.05 },
        ],
        17.75,
      )}
      {rowIn > 0 && rowOut < 1 && (
        <AbsoluteFill style={{ opacity: rowIn * (1 - rowOut), filter: `blur(${rowOut * 10}px)` }}>
          <Line
            t={t}
            left={[
              { text: 'From', at: W5(10) },
              { text: 'idea', at: W5(11) },
            ]}
            right={[
              { text: 'to', at: W5(12) },
              { text: 'live.', at: W5(13), gradient: true },
            ]}
            centreW={520}
            centre={
              <div style={{ position: 'relative', width: 520, height: 8 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: '#E4E6EC' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${travel * 100}%`, borderRadius: 8, background: L.grad }} />
                <div style={{ position: 'absolute', left: travel * 520 - 34, top: -34, opacity: 1 - prog(t, W5(13) - 0.05, W5(13) + 0.1), transform: `rotate(${travel * 360}deg)` }}>
                  <IdeaFolder size={68} />
                </div>
              </div>
            }
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
            <LiveBadge t={t} k={liveK} />
          </div>
        </AbsoluteFill>
      )}
      {t > W5(14) - 0.1 && weeksOut < 1 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - weeksOut, filter: `blur(${weeksOut * 12}px)` }}>
          <div style={{ display: 'flex', gap: 28, transform: `scale(${mix(1.25, 1, prog(t, W5(14) - 0.05, W5(15) + 0.4))})` }}>
            <FocusWord k={prog(t, W5(14) - 0.05, W5(14) + 0.3)} size={150} weight={500}>
              in
            </FocusWord>
            <FocusWord k={prog(t, W5(15) - 0.05, W5(15) + 0.35)} size={150} weight={500} gradient>
              weeks.
            </FocusWord>
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};

// ---------- S6: deploy click → sparkle → floating work (21–26 s) ----------
const CARDS: [string, string, string][] = [
  ['project3/1.webp', 'Clinic notes', 'Pulse Scribe · Healthcare'],
  ['project1/1.webp', 'Shopping assistant', 'Brightlane · Retail'],
  ['project4/1.webp', 'Dispatch planner', 'Freightmind · Logistics'],
  ['project5/1.webp', 'Credit decisions', 'Lumora · Fintech'],
  ['project2/1.webp', 'Research assistant', 'Vault Search · Finance'],
  ['project1/5.webp', 'Customer insights', 'Brightlane · Retail'],
  ['project4/3.webp', 'Live operations', 'Freightmind · Logistics'],
  ['project3/2.webp', 'Patient summary', 'Pulse Scribe · Healthcare'],
];

const DeployCard: React.FC<{ t: number; press: number; gone: number }> = ({ t, press, gone }) => {
  const checks = ['Unit tests · 412 passed', 'Evals · accuracy 97.4%', 'Security review · approved', 'Code review · 2 senior engineers'];
  const rise = prog(t, 20.7, 21.4, easeInOut);
  return (
    <div
      style={{
        position: 'absolute',
        left: 960 - 560,
        top: 330,
        width: 1120,
        height: 560,
        borderRadius: 28,
        background: '#fff',
        boxShadow: '0 60px 120px -40px rgba(17,18,22,0.3), 0 0 0 1px rgba(17,18,22,0.06)',
        fontFamily: SANS,
        padding: '40px 48px',
        transform: `perspective(1600px) rotateX(${mix(30, 12, prog(t, 20.7, 22.0, easeInOut))}deg) rotateZ(${mix(-8, -3, rise)}deg) translateY(${mix(220, 0, rise)}px) scale(${1 - gone * 0.1})`,
        opacity: prog(t, 20.7, 21.0) * (1 - gone),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 600, color: L.ink }}>
        Order-tracking agent
        <span style={{ fontSize: 17, fontWeight: 500, color: L.sub, padding: '5px 12px', borderRadius: 14, background: '#F1F2F6' }}>v2.4 · ready</span>
      </div>
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {checks.map((c, i) => {
          const k = prog(t, 21.1 + i * 0.13, 21.3 + i * 0.13);
          return (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, color: L.ink, opacity: 0.25 + 0.75 * k }}>
              <span style={{ width: 30, height: 30, borderRadius: 30, background: k > 0.5 ? L.grad : '#E4E6EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 8.4l3 3 6-6.6" />
                </svg>
              </span>
              {c}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 48,
          bottom: 40,
          padding: '20px 34px',
          borderRadius: 16,
          fontSize: 24,
          fontWeight: 600,
          color: '#fff',
          background: press > 0.5 ? L.grad : L.ink,
          transform: `scale(${1 - 0.06 * Math.sin(Math.min(press, 1) * Math.PI)})`,
          boxShadow: press > 0.5 ? '0 16px 30px -10px rgba(67,56,255,0.6)' : 'none',
        }}
      >
        Deploy to production
      </div>
    </div>
  );
};

const Craft: React.FC<{ t: number }> = ({ t }) => {
  const click = w('L6a', 2) - 0.32;
  const press = prog(t, click, click + 0.12);
  const gone = prog(t, click + 0.12, click + 0.4, snap);
  const btn = { x: 960 + 560 - 48 - 150, y: 330 + 560 - 40 - 32 };
  const glide = (from: number, to: number) => interpolate(t, [21.35, click - 0.05], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const cur = { x: glide(1560, btn.x + 40), y: glide(1040, btn.y + 10) };
  const spark = prog(t, click + 0.15, click + 0.55, snap);
  const sparkOut = prog(t, w('L6b', 0) - 0.15, w('L6b', 0) + 0.25, easeInOut);
  const cardsAt = w('L6b', 0) - 0.05;
  const exit = prog(t, 25.45, 25.98, (x) => x * x);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 400 }}>
        <Line t={t} exitAt={click + 0.1} left={[{ text: 'Senior', at: w('L6a', 0) }]} right={[{ text: 'engineering.', at: w('L6a', 1), gradient: true }]} />
      </div>
      {t < click + 0.45 && <DeployCard t={t} press={press} gone={gone} />}
      {t > 21.3 && t < click + 0.35 && <Cursor x={cur.x} y={cur.y} press={press} />}
      {t > click + 0.12 && sparkOut < 1 && (
        <div
          style={{
            position: 'absolute',
            left: mix(btn.x + 150, 960, spark) - 90,
            top: mix(btn.y + 32, 430, spark) - 90,
            opacity: 1 - sparkOut,
            transform: `scale(${mix(0.3, 1, spark) * (1 + sparkOut * 2.5)})`,
          }}
        >
          <Sparkle size={180} rot={(t - click) * 160} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, height: 360 }}>
        <Line
          t={t}
          exitAt={w('L6b', 0) - 0.12}
          left={[
            { text: 'AI', at: w('L6a', 2) },
            { text: 'at the', at: w('L6a', 4) },
          ]}
          right={[{ text: 'core.', at: w('L6a', 5), gradient: true }]}
        />
      </div>
      {t > cardsAt && (
        <AbsoluteFill style={{ perspective: 1400, opacity: 1 - prog(t, 25.8, 26.0) }}>
          {CARDS.map(([src, title, meta], i) => {
            const k = prog(t, cardsAt + i * 0.05, cardsAt + 0.9 + i * 0.05, overshoot);
            const a = (i / CARDS.length) * Math.PI * 2 + 0.4;
            const r = 560 + (i % 3) * 90;
            const drift = (t - cardsAt) * 30;
            const x = Math.cos(a) * r * Math.min(k, 1.05);
            const y = Math.sin(a) * r * 0.62 * Math.min(k, 1.05);
            const zz = mix(-600, (i % 2 ? 80 : -140) + drift * 4, Math.min(k, 1)) + exit * 1900;
            // depth of field: cards close to the lens blur, the focal plane sits around z = -40
            const dof = Math.min(16, Math.abs(zz + 40) / 70);
            return (
              <div
                key={src + i}
                style={{
                  position: 'absolute',
                  left: 960 - 210 + x,
                  top: 540 - 150 + y,
                  transform: `translateZ(${zz}px) rotateY(${-Math.cos(a) * 26}deg) rotateX(${Math.sin(a) * 14}deg) rotateZ(${(i % 2 ? 1 : -1) * 5}deg)`,
                  opacity: Math.min(1, k * 1.6),
                  filter: dof > 1 ? `blur(${dof}px)` : undefined,
                }}
              >
                <ProductCard src={src} title={title} meta={meta} />
              </div>
            );
          })}
          <Line
            t={t}
            exitAt={25.5}
            left={[
              { text: 'Built around', at: w('L6b', 0) },
              { text: 'the way', at: w('L6b', 2) },
            ]}
            right={[
              { text: 'you', at: w('L6b', 4) },
              { text: 'work.', at: w('L6b', 5), gradient: true },
            ]}
          />
        </AbsoluteFill>
      )}
    </>
  );
};

// ---------- S7: end card (26–30 s) ----------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const mark = prog(t, w('L7a', 0) - 0.08, w('L7a', 0) + 0.4);
  const glint = prog(t, w('L7a', 0) - 0.3, w('L7a', 0) + 0.3);
  const L7 = (i: number) => w('L7b', i);
  const url = prog(t, L7(5) + 0.6, L7(5) + 1.0);
  const push = mix(1, 1.035, prog(t, 26, 30, (x) => x));
  const words = (list: [string, number][], gradient: boolean) =>
    list.map(([s, at]) => (
      <FocusWord key={s} k={prog(t, at - 0.05, at + 0.3)} size={40} gradient={gradient}>
        {s}
      </FocusWord>
    ));
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
      {glint < 1 && (
        <div style={{ position: 'absolute', left: mix(1500, 960, glint) - 40, top: mix(160, 470, glint) - 40, opacity: Math.sin(glint * Math.PI), transform: `scale(${mix(1, 0.2, glint)})` }}>
          <Sparkle size={80} rot={glint * 180} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, marginTop: -20 }}>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 132,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            color: L.ink,
            opacity: Math.min(1, mark * 1.4),
            filter: `blur(${(1 - mark) * 16}px)`,
            transform: `scale(${1.06 - 0.06 * mark})`,
          }}
        >
          Nument
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          {words(
            [
              ['Built', L7(0)],
              ['in', L7(1)],
              ['India,', L7(2)],
            ],
            false,
          )}
          {words(
            [
              ['for', L7(3)],
              ['the', L7(4)],
              ['world.', L7(5)],
            ],
            true,
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 70, fontFamily: SANS, fontSize: 22, color: L.sub, opacity: url }}>nument.in</div>
    </AbsoluteFill>
  );
};

/** Everything on screen. Reads the (possibly sub-frame) time itself so motion blur can sample it. */
const Body: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const doneAt = w('L4', 2) + 0.42;
  return (
    <AbsoluteFill style={{ background: L.bg, WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>
      {t < 8.1 && <Opening t={t} />}
      {t > 7.55 && t < 14.05 && <BarScene t={t} />}
      {t > 7.9 && t < 13.6 && <BarText t={t} />}
      {t > doneAt - 0.05 && t < 14.6 && <Confetti t={t - doneAt} cx={960} cy={600} n={110} />}
      {t > 13.8 && t < 21.0 && <Build t={t} />}
      {t > 20.65 && t < 26.05 && <Craft t={t} />}
      {t > 25.9 && <EndCard t={t} />}
    </AbsoluteFill>
  );
};

export const Film3: React.FC<{ motionBlur?: boolean }> = ({ motionBlur = true }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const fast = motionBlur && FAST.some(([a, b]) => t >= a && t <= b);
  return (
    <AbsoluteFill style={{ background: L.bg }}>
      {fast ? (
        <CameraMotionBlur shutterAngle={180} samples={8}>
          <Body />
        </CameraMotionBlur>
      ) : (
        <Body />
      )}
      <Audio src={mixWav} />
    </AbsoluteFill>
  );
};
