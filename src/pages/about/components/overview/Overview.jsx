import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import clsx from 'clsx';
import styles from '@src/pages/about/components/overview/styles/overview.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';

function Overview() {
  const isMobile = useIsMobile();

  return (
    <section className={clsx(styles.root, 'layout-grid-inner')}>
      <div className={styles.title}>
        {isMobile ? (
          <AppearTitle key="mobile-queto">
            <h3 className="h3">Our role is to turn AI from</h3>
            <h3 className="h3">a promising demo into a</h3>
            <h3 className="h3">
              <span className="medium">reliable</span>, <span className="medium">measurable</span> and
            </h3>
            <h3 className="h3">
              <span className="medium">everyday</span> part of your
            </h3>
            <h3 className="h3">business.</h3>
          </AppearTitle>
        ) : (
          <AppearTitle key="desktop-queto">
            <h3 className="h3">Our role is to turn AI from a</h3>
            <h3 className="h3">
              promising demo into a <span className="medium">reliable</span>,
            </h3>
            <h3 className="h3">
              <span className="medium">measurable</span> and <span className="medium">everyday</span> part
            </h3>
            <h3 className="h3">of your business.</h3>
          </AppearTitle>
        )}
      </div>
      <div className={clsx(styles.text, 'p-l', styles.myStory)}>
        <AppearTitle>
          <span>Our story</span>
        </AppearTitle>
      </div>
      <div className={styles.desc}>
        {!isMobile ? (
          <AppearTitle key="desktop-overview">
            <h6 className="h6">Nument is an AI solutions company built on a simple belief: AI should earn</h6>
            <h6 className="h6">its place in a business by the results it delivers, not the demos it wins.</h6>
            <h6 className="h6">We help startups, enterprises and two-person founding teams turn ideas</h6>
            <h6 className="h6">into products people rely on every day.</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>We have seen the same pattern again and again: brilliant AI prototypes that</h6>
            <h6 className="h6">never make it to production. Nument exists to close that gap, with the</h6>
            <h6 className="h6">product thinking, engineering and evaluation it takes to ship.</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>Our team brings together senior AI engineers, product leaders and</h6>
            <h6 className="h6">designers who have shipped AI at scale for some of India&apos;s largest</h6>
            <h6 className="h6">digital platforms. Small, senior and hands-on, by design.</h6>

            <h6 className={clsx(styles.paddingTop, 'h6')}>Have an idea worth building with AI? We&apos;d love to hear about it!</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>Team Nument AI.</h6>
          </AppearTitle>
        ) : (
          <AppearTitle key="mobile-overview">
            <h6 className="h6">Nument is an AI solutions company built on a simple belief: AI</h6>
            <h6 className="h6">should earn its place in a business by the results it delivers,</h6>
            <h6 className="h6">not the demos it wins. We help startups, enterprises and</h6>
            <h6 className="h6">founding teams turn ideas into products people rely on.</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>We have seen the same pattern again and again: brilliant AI</h6>
            <h6 className="h6">prototypes that never make it to production. Nument exists to</h6>
            <h6 className="h6">close that gap, with the product thinking, engineering and</h6>
            <h6 className="h6">evaluation it takes to ship.</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>Our team brings together senior AI engineers,</h6>
            <h6 className="h6">product leaders and designers who have shipped AI</h6>
            <h6 className="h6">at scale for some of India&apos;s largest digital</h6>
            <h6 className="h6">platforms. Small, senior and hands-on, by design.</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>Have an idea worth building with AI? We&apos;d love to hear</h6>
            <h6 className="h6">about it!</h6>
            <h6 className={clsx(styles.paddingTop, 'h6')}>Team Nument AI.</h6>
          </AppearTitle>
        )}
      </div>
    </section>
  );
}
export default Overview;
