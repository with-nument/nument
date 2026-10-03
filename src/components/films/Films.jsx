import { useRef, useState } from 'react';

import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import FilmPlayer from '@src/components/films/FilmPlayer';
import clsx from 'clsx';
import film from '@src/constants/film';
import styles from '@src/components/films/films.module.scss';
import useIntersected from '@src/hooks/useIntersected';

// Home page film: a large looping film with a short caption beside it.
export default function Films() {
  const ref = useRef();
  const visible = useIntersected(ref, 0.15);
  const [soundOn, setSoundOn] = useState(false);
  return (
    <section className={clsx(styles.root, 'layout-grid-inner')}>
      <article ref={ref} className={clsx(styles.card, visible && styles.visible)}>
        <FilmPlayer film={film} soundOn={soundOn} onSound={setSoundOn} />
        <div className={styles.caption}>
          <div className={clsx('p-x', styles.kicker)}>{film.kicker}</div>
          <h3 className={clsx('h3', 'bold', styles.title)}>{film.title}</h3>
          <p className={clsx('p-l', styles.text)}>{film.text}</p>
          {film.cta && <ButtonLink href={film.cta.href} label={film.cta.label} />}
        </div>
      </article>
    </section>
  );
}
