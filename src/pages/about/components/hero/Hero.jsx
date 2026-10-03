import { Suspense, useEffect, useRef, useState } from 'react';

import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import { Canvas } from '@react-three/fiber';
import HeroScene from '@src/pages/about/components/hero/HeroScene';
import clsx from 'clsx';
import contact from '@src/constants/contact';
import styles from '@src/pages/about/components/hero/styles/hero.module.scss';
import { useIntersection } from 'react-use';

const STATS = [
  { value: '5', label: 'AI products in production' },
  { value: '4', label: 'industries, from healthcare to fintech' },
  { value: '10 wks', label: 'from first idea to launch' },
  { value: '100%', label: 'senior, hands-on team' },
];

// About hero: kinetic headline, a live glass "N" in the site's signature window, and key numbers.
function Hero() {
  const windowRef = useRef();
  const [onScreen, setOnScreen] = useState(true);
  const intersection = useIntersection(windowRef, { threshold: 0, rootMargin: '200px' });
  useEffect(() => {
    if (intersection) setOnScreen(intersection.isIntersecting);
  }, [intersection]);

  return (
    <>
      <section className={clsx(styles.root, 'layout-grid-inner')}>
        <div className={clsx('p-x', styles.kicker)}>
          <span>About Nument</span>
          <span>Based in {contact.location}</span>
        </div>
        <h1 className={clsx('h1', styles.title)}>
          <AppearTitle>
            <span>We build AI</span>
            <span className={styles.bold}>that actually ships.</span>
          </AppearTitle>
        </h1>
      </section>

      <section className={clsx(styles.stage, 'layout-grid-inner')}>
        <div ref={windowRef} className={styles.window} data-header="dark" role="img" aria-label="The Nument monogram in glass">
          <Canvas
            dpr={[1, 2]}
            frameloop={onScreen ? 'always' : 'never'}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 7], fov: 35 }}
            style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
          <div className={clsx('p-x', styles.caption)}>Move your cursor</div>
        </div>
      </section>

      <section className={clsx(styles.stats, 'layout-grid-inner')}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={clsx('h2', styles.value)}>{stat.value}</span>
            <span className="h6">{stat.label}</span>
          </div>
        ))}
      </section>
    </>
  );
}

export default Hero;
