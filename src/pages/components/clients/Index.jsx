import AppearByWords from '@src/components/animationComponents/appearByWords/Index';
import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import Badge from '@src/pages/components/clients/components/Badge';
import clsx from 'clsx';
import { gsap } from 'gsap';
import styles from '@src/pages/components/clients/styles/clients.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';
import { useRef } from 'react';
import { useWindowSize } from '@darkroom.engineering/hamo';

function Clients() {
  const isMobile = useIsMobile();
  const textRefs = useRef([]);
  const badgeRefs = useRef([]);
  const rootRef = useRef();
  const windowSize = useWindowSize();

  const setupScrollAnimation = () => {
    const ctx = gsap.context(() => {
      if (!isMobile) {
        const vw = (coef) => windowSize.height * (coef / 100);
        textRefs.current.forEach((textRef, index) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: rootRef.current,
                start: index === 0 ? `top-=${vw(35)}` : `top+=${vw(35 + 5.5555556 * index)}`,
                end: index === 0 ? `bottom-=${vw(35 + 5.5555556 * index)}` : `bottom+=${vw(25)}`,
                toggleActions: 'play none reverse none',
                scrub: true,
                scroller: document?.querySelector('main'),
                invalidateOnRefresh: true,
              },
            })
            .to(textRef, {
              top: `${10 + 30 * index + 5.5555556 * index}vw`,
            });
        });
      }
    });

    return ctx;
  };

  useIsomorphicLayoutEffect(() => {
    const ctx = setupScrollAnimation(textRefs, rootRef, windowSize, isMobile);
    return () => ctx.kill();
  }, [isMobile, windowSize.height]);

  return (
    <section ref={rootRef} className={clsx(styles.root, 'layout-grid-inner')}>
      <h1 className={clsx(styles.sectionTitle, 'h1')}>
        <AppearByWords>Clients</AppearByWords>
      </h1>
      {isMobile ? <div className={styles.mobileEmpty} /> : null}
      {isMobile ? (
        <div className={styles.mobileCount}>
          <AppearTitle>2026</AppearTitle>
        </div>
      ) : null}
      <div
        ref={(el) => {
          badgeRefs.current[0] = el;
        }}
        className={styles.first}
        data-header="dark"
      >
        <Badge name="company1" />
      </div>
      {isMobile ? <div className={styles.mobileEmptySecond} /> : null}
      {isMobile ? (
        <div className={styles.textMobile}>
          <AppearTitle>
            <h4 className={clsx('h4', 'bold')}>Aurelia Health</h4>
          </AppearTitle>
          <AppearTitle>
            <div className="p-l">“Our doctors used to spend a third of</div>
            <div className="p-l">every shift typing notes. With Pulse</div>
            <div className="p-l">Scribe, the note is ready before the</div>
            <div className="p-l">patient leaves the room, and they get</div>
            <div className="p-l">their evenings back. Nument made AI</div>
            <div className="p-l">feel safe for our clinicians.”</div>
            <div className="p-l">— Dr. Ananya Mehta,</div>
            <div className="p-l">Chief Medical Officer</div>
          </AppearTitle>
        </div>
      ) : null}
      {!isMobile ? (
        <>
          <div className={styles.firstEmpty} />
          <div
            ref={(el) => {
              textRefs.current[0] = el;
            }}
            className={styles.firstText}
          >
            <AppearTitle>
              <h6 className="h6">2026</h6>
            </AppearTitle>
            <AppearTitle>
              <h4 className={clsx('h4', 'bold', styles.title)}>Aurelia Health</h4>
            </AppearTitle>
            <AppearTitle>
              <div className="p-l">“Our doctors used to spend a third of</div>
              <div className="p-l">every shift typing notes. With Pulse</div>
              <div className="p-l">Scribe, the note is ready before the</div>
              <div className="p-l">patient leaves the room, and they get</div>
              <div className="p-l">their evenings back. Nument made AI</div>
              <div className="p-l">feel safe for our clinicians.”</div>
              <div className="p-l">— Dr. Ananya Mehta,</div>
              <div className="p-l">Chief Medical Officer</div>
            </AppearTitle>
          </div>
        </>
      ) : null}
      {!isMobile ? <div className={styles.secondEmpty} /> : null}
      {isMobile ? <div className={styles.mobileEmpty} /> : null}
      {isMobile ? (
        <div className={styles.mobileCount}>
          <AppearTitle>2025</AppearTitle>
        </div>
      ) : null}
      <div
        ref={(el) => {
          badgeRefs.current[1] = el;
        }}
        className={styles.second}
        data-header="dark"
      >
        <Badge name="company2" />
      </div>
      {isMobile ? <div className={styles.mobileEmptySecond} /> : null}
      {isMobile ? (
        <div className={styles.textMobile}>
          <AppearTitle>
            <h4 className={clsx('h4', 'bold')}>Corvex Logistics</h4>
          </AppearTitle>
          <AppearTitle>
            <div className="p-l">“We planned 40,000 shipments a day</div>
            <div className="p-l">on spreadsheets and phone calls.</div>
            <div className="p-l">Freightmind gives our planners one</div>
            <div className="p-l">live view and tells them what will go</div>
            <div className="p-l">wrong before it does. Empty runs are</div>
            <div className="p-l">down 18% in a single quarter.”</div>
            <div className="p-l">— Rohan Kapoor,</div>
            <div className="p-l">Head of Network Planning</div>
          </AppearTitle>
        </div>
      ) : null}
      {!isMobile ? (
        <>
          <div
            ref={(el) => {
              textRefs.current[1] = el;
            }}
            className={styles.secondText}
          >
            <AppearTitle>
              <h6 className="h6">2025</h6>
            </AppearTitle>
            <AppearTitle>
              <h4 className={clsx('h4', 'bold', styles.title)}>Corvex Logistics</h4>
            </AppearTitle>
            <AppearTitle>
              <div className="p-l">“We planned 40,000 shipments a day</div>
              <div className="p-l">on spreadsheets and phone calls.</div>
              <div className="p-l">Freightmind gives our planners one</div>
              <div className="p-l">live view and tells them what will go</div>
              <div className="p-l">wrong before it does. Empty runs are</div>
              <div className="p-l">down 18% in a single quarter.”</div>
              <div className="p-l">— Rohan Kapoor,</div>
              <div className="p-l">Head of Network Planning</div>
            </AppearTitle>
          </div>
          <div className={styles.fourthEmpty} />
        </>
      ) : null}
      {isMobile ? <div className={styles.mobileEmpty} /> : null}
      {isMobile ? (
        <div className={styles.mobileCount}>
          <AppearTitle>2024</AppearTitle>
        </div>
      ) : null}
      <div
        ref={(el) => {
          badgeRefs.current[2] = el;
        }}
        className={styles.third}
        data-header="dark"
      >
        <Badge name="company3" />
      </div>
      {isMobile ? <div className={styles.mobileEmptySecond} /> : null}
      {isMobile ? (
        <div className={styles.textMobile}>
          <AppearTitle>
            <h4 className={clsx('h4', 'bold')}>Lumora</h4>
          </AppearTitle>
          <AppearTitle>
            <div className="p-l">“We had an idea, a deadline and no</div>
            <div className="p-l">engineers. Nument shipped our</div>
            <div className="p-l">underwriting product in ten weeks,</div>
            <div className="p-l">and it is the reason we closed our</div>
            <div className="p-l">seed round. They built it like it</div>
            <div className="p-l">was their own company.”</div>
            <div className="p-l">— Ishita Rao,</div>
            <div className="p-l">Co-founder &amp; CEO</div>
          </AppearTitle>
        </div>
      ) : null}
      {!isMobile ? (
        <>
          <div className={styles.fifthEmpty} />
          <div
            ref={(el) => {
              textRefs.current[2] = el;
            }}
            className={styles.thirdText}
          >
            <AppearTitle>
              <h6 className="h6">2024</h6>
            </AppearTitle>
            <AppearTitle>
              <h4 className={clsx('h4', 'bold', styles.title)}>Lumora</h4>
            </AppearTitle>
            <AppearTitle>
              <div className="p-l">“We had an idea, a deadline and no</div>
              <div className="p-l">engineers. Nument shipped our</div>
              <div className="p-l">underwriting product in ten weeks,</div>
              <div className="p-l">and it is the reason we closed our</div>
              <div className="p-l">seed round. They built it like it</div>
              <div className="p-l">was their own company.”</div>
              <div className="p-l">— Ishita Rao,</div>
              <div className="p-l">Co-founder &amp; CEO</div>
            </AppearTitle>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default Clients;
