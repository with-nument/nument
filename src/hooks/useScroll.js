import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

// Subscribes to Lenis scroll events once per Lenis instance; the latest callback is kept in a
// ref so callers can pass inline functions without re-subscribing on every render.
function useScroll(callback) {
  const [lenis] = useStore(useShallow((state) => [state.lenis]));
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useIsomorphicLayoutEffect(() => {
    if (!lenis) return undefined;
    const onScroll = (...args) => callbackRef.current(...args);
    lenis.on('scroll', onScroll);
    lenis.emit();

    return () => {
      lenis.off('scroll', onScroll);
    };
  }, [lenis]);
}
export default useScroll;
