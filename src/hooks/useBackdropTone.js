import { useCallback, useEffect, useState } from 'react';

import useScroll from '@src/hooks/useScroll';

// Reports whether the element at `ref` currently sits over a dark part of the page.
// Dark areas are marked in the markup with data-header="dark" (footer, films, 3D windows).
function useBackdropTone(ref) {
  const [onDark, setOnDark] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementsFromPoint(x, y).find((node) => !el.contains(node) && node.closest?.('[data-header]'));
    setOnDark(hit?.closest('[data-header]')?.dataset.header === 'dark');
  }, [ref]);

  useScroll(() => requestAnimationFrame(check));

  useEffect(() => {
    check();
    window.addEventListener('resize', check);
    // Page transitions swap the content under the header without a scroll event.
    const interval = setInterval(check, 600);
    return () => {
      window.removeEventListener('resize', check);
      clearInterval(interval);
    };
  }, [check]);

  return onDark;
}

export default useBackdropTone;
