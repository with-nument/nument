import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import Image from 'next/image';
import clsx from 'clsx';
import { gsap } from 'gsap';
import styles from '@src/pages/components/about/styles/about.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';
import { useRef } from 'react';

function About() {
  const isMobile = useIsMobile();
  const rootRef = useRef();
  const animatedImageRef = useRef();

  const setupScrollAnimation = () => {
    const ctx = gsap.context(() => {
      gsap.set(animatedImageRef.current, { top: !isMobile ? '-20vw' : '0' });
      if (!isMobile) {
        gsap.to(animatedImageRef.current, {
          top: '20vw',
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scroller: document?.querySelector('main'),
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return ctx;
  };

  useIsomorphicLayoutEffect(() => {
    const ctx = setupScrollAnimation();
    return () => ctx.kill();
  }, [isMobile]);

  const renderImageContainer = () => (
    <div className={styles.imageContainer}>
      <Image priority src="/brand/team.webp" sizes="(max-width: 812px) 90vw, 46vw" fill alt="Nument AI team" style={{ objectFit: 'cover' }} />
    </div>
  );

  return (
    <section ref={rootRef} className={styles.root}>
      <div className={clsx(styles.nameContainer, 'layout-block-inner')}>
        <AppearTitle>
          <h1 className={clsx('h1', 'medium')}>Hey, we&apos;re</h1>
          <h1 className={clsx('h1', 'medium')}>Nument AI!</h1>
        </AppearTitle>
      </div>

      <div className={clsx(styles.container, 'layout-grid-inner')}>
        {isMobile ? renderImageContainer() : null}
        <div className={clsx(styles.descWrapper)} ref={animatedImageRef}>
          <AppearTitle>
            <div className="p-l">“We started Nument to close the gap between</div>
            <div className="p-l">AI that impresses in a demo and AI that</div>
            <div className="p-l">quietly moves the numbers, every single</div>
            <div className="p-l">day, for the teams who depend on it.”</div>
          </AppearTitle>
        </div>
        {!isMobile ? renderImageContainer() : null}
        <div className={clsx(styles.descWrapperBottom)}>
          {!isMobile ? (
            <AppearTitle key="desktop-descWrapperBottom">
              <h6 className="h6">An AI solutions company based in Gurugram, India.</h6>
              <h6 className="h6">A senior team of AI engineers, product leaders</h6>
              <h6 className="h6">and designers helping startups, enterprises</h6>
              <h6 className="h6">and founding teams build AI products that</h6>
              <h6 className="h6">deliver real, measurable results.</h6>
            </AppearTitle>
          ) : (
            <AppearTitle key="mobile-descWrapperBottom">
              <h6 className="h6">An AI solutions company based in Gurugram, India. A senior</h6>
              <h6 className="h6">team of AI engineers, product leaders and designers</h6>
              <h6 className="h6">helping startups, enterprises and founding teams</h6>
              <h6 className="h6">build AI that delivers real, measurable results.</h6>
            </AppearTitle>
          )}
          <div className={clsx(styles.buttonContainer)}>
            <ButtonLink href="/about" label="ABOUT US" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
