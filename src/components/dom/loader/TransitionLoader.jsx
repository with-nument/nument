import { useEffect, useState } from 'react';

import clsx from 'clsx';
import projects from '@src/constants/projects';
import styles from '@src/components/dom/loader/transitionLoader.module.scss';
import { useRouter } from 'next/router';

const STATUS = ['Preparing the page', 'Loading the visuals', 'Almost there'];

const labelFor = (url) => {
  const path = url.split(/[?#]/)[0];
  if (path === '/') return 'Home';
  if (path === '/about') return 'About';
  if (path === '/projects') return 'All Projects';
  const project = projects.find((p) => path === p.link);
  return project ? project.title : 'Nument';
};

// Shown on the sliding panel between pages: the destination's name rises in letter by letter while
// a progress line fills and a status line cycles, instead of a static "Loading".
export default function TransitionLoader() {
  const router = useRouter();
  const [visit, setVisit] = useState({ label: labelFor(router.asPath), id: 0 });

  useEffect(() => {
    const onStart = (url) => setVisit((prev) => ({ label: labelFor(url), id: prev.id + 1 }));
    router.events.on('routeChangeStart', onStart);
    return () => router.events.off('routeChangeStart', onStart);
  }, [router]);

  return (
    <div key={visit.id} className={styles.root} aria-live="polite">
      <div className={clsx('p-x', styles.kicker)}>
        <span className={styles.dot} />
        Loading
      </div>
      <h2 className={clsx('h1', styles.label)} aria-label={visit.label}>
        {Array.from(visit.label).map((char, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} style={{ '--i': i }} aria-hidden="true">
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </h2>
      <div className={styles.bar}>
        <span />
      </div>
      <div className={clsx('p-x', styles.status)}>
        {STATUS.map((text, i) => (
          <span key={text} style={{ '--i': i }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
