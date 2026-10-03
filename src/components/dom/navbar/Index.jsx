import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import Link from 'next/link';
import MenuButton from '@src/components/dom/navbar/components/MenuButton';
import MenuLinks from '@src/components/dom/navbar/components/MenuLinks';
import SoundButton from '@src/components/dom/navbar/components/SoundButton';
import clsx from 'clsx';
import contact from '@src/constants/contact';
import styles from '@src/components/dom/navbar/styles/index.module.scss';
import { useCallback, useRef } from 'react';
import useBackdropTone from '@src/hooks/useBackdropTone';
import useIsMobile from '@src/hooks/useIsMobile';
import { useRouter } from 'next/router';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

function Navbar() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [lenis] = useStore(useShallow((state) => [state.lenis]));
  const logoRef = useRef();
  // The logo turns light over dark sections (footer, films, 3D windows) so it never disappears.
  const onDark = useBackdropTone(logoRef);

  const scrollToPosition = useCallback(
    (position, duration = 1.5) => {
      if (lenis) {
        lenis.scrollTo(position, {
          duration,
          force: true,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
          onComplete: () => {
            lenis.start();
          },
        });
      }
    },
    [lenis],
  );

  const goToTop = useCallback(() => {
    if (router.pathname === '/') {
      scrollToPosition(0);
    }
  }, [router.pathname, scrollToPosition]);

  return (
    <>
      <MenuLinks />

      <header className={styles.root} role="banner">
        <div className={styles.innerHeader}>
          <Link onClick={goToTop} aria-label="Go home" scroll={false} href="/">
            <h4 ref={logoRef} className={clsx('bold', 'h4', styles.logo, onDark && styles.logoOnDark)}>
              Nument
            </h4>
          </Link>

          <div className={styles.rightContainer}>
            <SoundButton />
            {!isMobile && <ButtonLink cal href={`mailto:${contact.email}`} label="GET IN TOUCH" />}
            <MenuButton />
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
