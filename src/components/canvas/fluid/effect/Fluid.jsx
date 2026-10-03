import { forwardRef, useMemo } from 'react';

import FluidEffect from '@src/components/canvas/fluid/effect/FluidEffect';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';

const FluidEffectWrapper = forwardRef((props, ref) => {
  // Textures can't be serialised (three.js warns on every render); key them by uuid instead.
  const key = JSON.stringify(props, (_, value) => (value?.isTexture ? value.uuid : value));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const effect = useMemo(() => new FluidEffect(props), [key]);

  useIsomorphicLayoutEffect(
    () => () => {
      if (effect) effect.dispose();
    },
    [effect],
  );

  return <primitive ref={ref} object={effect} />;
});

FluidEffectWrapper.defaultProps = {
  intensity: 1.0,
  fluidColor: '#ffffff',
  backgroundColor: '#000000',
};

export default FluidEffectWrapper;
