import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import FruitNinja from '@src/components/dom/prefooter/Index';
import clsx from 'clsx';
import contact from '@src/constants/contact';
import styles from '@src/components/dom/styles/preFooter.module.scss';

function PreFooter() {
  return (
    <section className={clsx(styles.root, 'layout-block-inner')}>
      <div className={styles.textsContainer}>
        <div>
          <h2 className="h1">Let&apos;s slice through</h2>
          <h2 className="h1"> your next AI challenge</h2>
          <h2 className="h1"> together!</h2>
        </div>
        <div className={styles.cta}>
          <h6 className="h6">Book a 30-minute call with our team today.</h6>
          <ButtonLink cal href={`mailto:${contact.email}`} label="BOOK A CALL" />
        </div>
      </div>

      <div className={styles.canvas}>
        <FruitNinja />
      </div>
    </section>
  );
}

export default PreFooter;
