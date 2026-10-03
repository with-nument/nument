import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import '../fonts';
import { Confetti, DoneCheck, FocusWord, IdeaFolder, L, Progress, SANS, Tunnel } from './look';

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...style }}>{children}</AbsoluteFill>
);

/** Five still frames that define the look, for approval before animating. */
export const StyleFrames: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: L.bg, fontFamily: SANS }}>
      {f === 0 && (
        <Center>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <FocusWord k={1}>Every business has an</FocusWord>
            <IdeaFolder size={128} />
            <FocusWord k={1} gradient>
              idea.
            </FocusWord>
          </div>
        </Center>
      )}
      {f === 1 && (
        <Center>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 70 }}>
            <div style={{ display: 'flex', gap: 18 }}>
              <FocusWord k={1}>Not enough</FocusWord>
              <FocusWord k={1} color={L.sub}>
                engineers.
              </FocusWord>
            </div>
            <Progress value={12} stalled={1} />
          </div>
        </Center>
      )}
      {f === 2 && (
        <>
          <Center>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
              <FocusWord k={1} gradient size={64}>
                Done
              </FocusWord>
              <DoneCheck k={1} />
            </div>
          </Center>
          <Confetti t={0.32} cx={960} cy={560} />
        </>
      )}
      {f === 3 && (
        <>
          <Tunnel z={700} spin={-8} />
          <Center>
            <div style={{ padding: '18px 34px', borderRadius: 40, background: 'rgba(247,247,249,0.82)', backdropFilter: 'blur(14px)' }}>
              <span style={{ fontSize: 50, fontWeight: 500, letterSpacing: '-0.02em' }}>
                <span style={{ backgroundImage: L.grad, WebkitBackgroundClip: 'text', color: 'transparent' }}>AI agents.</span> Apps. Internal tools.
              </span>
            </div>
          </Center>
        </>
      )}
      {f === 4 && (
        <Center>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 132, letterSpacing: '-0.045em', lineHeight: 1, color: L.ink, fontOpticalSizing: 'auto' }}>Nument</span>
            <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', color: L.ink }}>
              Built in India, <span style={{ backgroundImage: L.grad, WebkitBackgroundClip: 'text', color: 'transparent' }}>for the world.</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 70, fontSize: 22, color: L.sub }}>nument.in</div>
        </Center>
      )}
    </AbsoluteFill>
  );
};
