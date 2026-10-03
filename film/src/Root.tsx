import React from 'react';
import { Composition } from 'remotion';
import timeline from './timeline.json';
import { Film3 } from './v3/Film3';
import { StyleFrames } from './v3/StyleFrames';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NumentFilm" component={Film3} durationInFrames={timeline.duration * timeline.fps} fps={timeline.fps} width={timeline.width} height={timeline.height} />
    {/* fast preview for pacing reviews: 30 fps, render with --scale=0.5 */}
    <Composition id="Animatic" component={Film3} durationInFrames={timeline.duration * 30} fps={30} width={timeline.width} height={timeline.height} />
    <Composition id="Style" component={StyleFrames} durationInFrames={5} fps={timeline.fps} width={timeline.width} height={timeline.height} />
  </>
);
