import { useEffect, useRef } from 'react';

import Link from 'next/link';
import clsx from 'clsx';
import contact from '@src/constants/contact';
import footerLinks from '@src/components/dom/navbar/constants/footerLinks';
import gsap from 'gsap';
import menuLinks from '@src/components/dom/navbar/constants/menuLinks';
import projectsLinks from '@src/components/dom/navbar/constants/projectsLinks';
import styles from '@src/components/dom/navbar/styles/menuLinks.module.scss';
import useCalEmbed from '@src/hooks/useCalEmbed';
import useIsMobile from '@src/hooks/useIsMobile';
import { useRouter } from 'next/router';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

function MenuLinks() {
  const timeline = useRef(null);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen, lenis, isLoading] = useStore(useShallow((state) => [state.isMenuOpen, state.setIsMenuOpen, state.lenis, state.isLoading]));
  const menuRef = useRef();
  const menuLinksItemsRef = useRef([]);
  const router = useRouter();
  const calProps = useCalEmbed();

  const setupMenuAnimation = (gsapTimeline, refs) => {
    const fluidCanvas = document?.getElementById('fluidCanvas');
    const layout = document?.getElementById('layout');
    const scrollbar = document?.getElementById('scrollbar');
    const header = document?.querySelector('header');

    gsap.set(refs.menuRef.current, { pointerEvents: 'none', autoAlpha: 0 });
    gsap.set(refs.menuLinksItemsRef.current, { x: '-100%' });

    gsapTimeline
      .to(refs.menuRef.current, { autoAlpha: 1, stagger: 0.01, pointerEvents: 'auto' }, 0)
      .to(fluidCanvas, { duration: 0, opacity: 0 }, 0)
      .to(refs.menuLinksItemsRef.current, { x: 0, stagger: 0.016, pointerEvents: 'auto' }, 0)
      .to('main', { borderRadius: '1.3888888889vw', border: '2px solid #f0f4f1', scale: 0.9, pointerEvents: 'none', left: '-40vw' }, 0)
      .to(layout, { opacity: isMobile ? 0.05 : 0.3, height: '90svh' }, 0)
      .to(scrollbar, { opacity: 0, right: '46vw', scale: 0.9 }, 0)
      .to(header, { autoAlpha: 0, left: '-40vw', top: isMobile ? '6vw' : '3vw', scale: 0.9, overwrite: true }, 0);
  };

  useEffect(() => {
    const refs = { menuRef, menuLinksItemsRef };
    const ctx = gsap.context(() => {
      timeline.current = gsap.timeline({ paused: true, defaults: { duration: 0.92, ease: 'expo.inOut' } });
      setupMenuAnimation(timeline.current, refs, isMobile);
    });

    return () => {
      // Revert (not just kill) so a menu that was open when the layout switched between
      // mobile and desktop doesn't leave the page shrunk and unclickable.
      ctx.revert();
      const state = useStore.getState();
      if (state.isMenuOpen) {
        state.setIsMenuOpen(false);
        state.lenis?.start();
      }
    };
  }, [isLoading, isMobile]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    lenis?.start();
  };

  // Esc closes the menu.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      const state = useStore.getState();
      state.setIsMenuOpen(false);
      state.lenis?.start();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  // A link to the page you're already on doesn't trigger a route change, so close the menu here.
  const onLinkClick = (href) => {
    if (router.asPath === href) closeMenu();
  };

  useEffect(() => {
    const tl = timeline.current;
    if (!tl) return;
    if (isMenuOpen) {
      tl.play();
    } else {
      tl.reverse();
    }
  }, [isMenuOpen]);

  const goToBottom = () => {
    setIsMenuOpen(false);

    setTimeout(() => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        const mainHeight = mainElement.scrollHeight;
        lenis.scrollTo(mainHeight, {
          duration: 1.5,
          force: true,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
          onComplete: () => {
            lenis.start();
          },
        });
      }
    }, 850);
  };

  const renderMenuLinks = (links, refs, pathname) =>
    links.map((link, index) => (
      <div
        ref={(el) => {
          menuLinksItemsRef.current[index + 1] = el;
        }}
        key={link.title}
        className={clsx(styles.menuListItem, pathname === link.href && styles.menuListItemActive)}
      >
        {link.href !== undefined ? (
          <Link aria-label={`Go ${link.title}`} scroll={false} href={link.href} onClick={() => onLinkClick(link.href)}>
            <span>{link.title}</span>
          </Link>
        ) : (
          <span
            onClick={goToBottom}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goToBottom();
              }
            }}
          >
            {link.title}
          </span>
        )}
      </div>
    ));

  return (
    <nav id="menu" ref={menuRef} className={styles.menu}>
      <div className={clsx(styles.menuWrapper, 'layout-block-inner')}>
        <div
          ref={(el) => {
            menuLinksItemsRef.current[0] = el;
          }}
          className={styles.menuList}
        >
          {renderMenuLinks(menuLinks, menuLinksItemsRef, router.pathname)}
        </div>
        <div
          ref={(el) => {
            menuLinksItemsRef.current[menuLinks.length + 2] = el;
          }}
          className={styles.menuList}
        >
          {projectsLinks.map((link, index) => (
            <div
              ref={(el) => {
                menuLinksItemsRef.current[menuLinks.length + index + 2] = el;
              }}
              key={link.title}
              className={styles.menuListItem}
            >
              <Link aria-label={`Go ${link.title}`} scroll={false} href={link.href} onClick={() => onLinkClick(link.href)}>
                <span>{link.title}</span>
              </Link>
            </div>
          ))}
        </div>
        <div
          ref={(el) => {
            menuLinksItemsRef.current[menuLinks.length + projectsLinks.length + 3] = el;
          }}
          className={styles.menuList}
        >
          <div
            role="presentation"
            ref={(el) => {
              menuLinksItemsRef.current[menuLinks.length + projectsLinks.length + 3] = el;
            }}
            className={styles.menuListItem}
          >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Link aria-label="Get in touch" scroll={false} href={`mailto:${contact.email}`} {...calProps}>
              <span>GET IN TOUCH</span>
            </Link>
          </div>
        </div>
        <div
          ref={(el) => {
            menuLinksItemsRef.current[menuLinks.length + projectsLinks.length + 4] = el;
          }}
          className={styles.menuList}
        >
          {footerLinks.map((link, index) => (
            <div
              ref={(el) => {
                menuLinksItemsRef.current[menuLinks.length + projectsLinks.length + index + 4] = el;
              }}
              key={link.title}
              className={styles.menuListItem}
            >
              <Link aria-label={`Follow Nument on ${link.title}`} target="_blank" rel="noopener noreferrer" scroll={false} href={link.href}>
                <span>{link.title}</span>
              </Link>
            </div>
          ))}
        </div>
        <button type="button" aria-label="Close menu" onClick={closeMenu} className={styles.menuClose}>
          <p>&#10005;</p>
        </button>
      </div>
    </nav>
  );
}

export default MenuLinks;
