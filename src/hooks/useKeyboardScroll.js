import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

const LINE = 120;

// The scroll container keeps `overflow: hidden` for Lenis, so the browser's own keyboard
// scrolling does nothing. Map the usual keys onto Lenis instead.
function useKeyboardScroll() {
  const [lenis] = useStore(useShallow((state) => [state.lenis]));

  useEffect(() => {
    if (!lenis) return undefined;

    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || lenis.isStopped) return;
      if (e.target.closest?.('input, textarea, select, button, [contenteditable="true"], [role="button"]')) return;
      const page = window.innerHeight * 0.85;
      const deltas = {
        ArrowDown: LINE,
        ArrowUp: -LINE,
        PageDown: page,
        PageUp: -page,
        ' ': e.shiftKey ? -page : page,
      };
      let target;
      if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = lenis.limit;
      else if (e.key in deltas) target = lenis.targetScroll + deltas[e.key];
      else return;
      e.preventDefault();
      lenis.scrollTo(Math.max(0, Math.min(lenis.limit, target)));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lenis]);
}

export default useKeyboardScroll;
