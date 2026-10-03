import { useEffect, useRef } from 'react';

import sound from '@src/sound/engine';
import useScroll from '@src/hooks/useScroll';
import { useStore } from '@src/store';

const INTERACTIVE = 'a, button, [role="button"], [data-sound="hover"]';
const SCROLL_STEP = 140; // px of scroll between two detent ticks

// Wires the site-wide sounds: unlock on first gesture, clicks, hovers, scroll detents,
// menu open/close and page transitions. Mount once (in _app).
function useSoundEffects(router) {
  const scrollAccumulator = useRef(0);
  const lastScroll = useRef(null);

  useEffect(() => {
    const unlock = () => sound.unlock();
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const onPointerDown = (e) => {
      unlock();
      const target = e.target.closest?.(INTERACTIVE);
      if (target && target.dataset.sound !== 'none') sound.play('click');
    };

    const onPointerOver = (e) => {
      const target = e.target.closest?.(INTERACTIVE);
      if (!target || target.dataset.sound === 'none') return;
      // Only when entering the element, not when moving between its children.
      if (e.relatedTarget && target.contains(e.relatedTarget)) return;
      sound.play('hover');
    };

    const onKeyDown = (e) => {
      unlock();
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.matches?.(INTERACTIVE)) sound.play('click');
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    if (canHover) window.addEventListener('pointerover', onPointerOver, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerover', onPointerOver);
    };
  }, []);

  // Menu open / close whooshes.
  useEffect(
    () =>
      useStore.subscribe((state, prev) => {
        if (state.isMenuOpen !== prev.isMenuOpen) sound.play(state.isMenuOpen ? 'whooshIn' : 'whooshOut');
      }),
    [],
  );

  // Page transitions.
  useEffect(() => {
    const onStart = (url) => {
      if (url !== router.asPath) sound.play('transition');
    };
    router.events.on('routeChangeStart', onStart);
    return () => router.events.off('routeChangeStart', onStart);
  }, [router]);

  // Scroll detents: a faint tick every SCROLL_STEP px, louder when scrolling faster.
  useScroll(({ scroll, velocity }) => {
    if (lastScroll.current === null) {
      lastScroll.current = scroll;
      return;
    }
    scrollAccumulator.current += Math.abs(scroll - lastScroll.current);
    lastScroll.current = scroll;
    if (scrollAccumulator.current >= SCROLL_STEP) {
      scrollAccumulator.current %= SCROLL_STEP;
      const intensity = Math.min(1, Math.max(0.25, Math.abs(velocity) / 40));
      sound.play('tick', { gain: intensity });
    }
  });
}

export default useSoundEffects;
