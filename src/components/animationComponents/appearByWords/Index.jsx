import clsx from 'clsx';
import styles from '@src/components/animationComponents/appearByWords/appearByWords.module.scss';
import useIntersected from '@src/hooks/useIntersected';
import { useRef } from 'react';
import useSplitAnimation from '@src/hooks/useSplitAnimation';

// The animated words are hidden from screen readers, so expose the plain text separately.
const visuallyHidden = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 };

function AppearByWords({ children }) {
  const animationContainerRef = useRef();
  const intersected = useIntersected(animationContainerRef);
  useSplitAnimation(animationContainerRef, styles);

  return (
    <>
      <span style={visuallyHidden}>{children}</span>
      <span ref={animationContainerRef} className={clsx(styles.title, intersected && styles.visible)} aria-hidden="true">
        {children}
      </span>
    </>
  );
}

export default AppearByWords;
