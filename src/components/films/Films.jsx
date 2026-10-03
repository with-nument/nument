import { Fragment, useRef } from 'react';

import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import FilmPlayer from '@src/components/films/FilmPlayer';
import clsx from 'clsx';
import films from '@src/constants/films';
import styles from '@src/components/films/films.module.scss';
import useIntersected from '@src/hooks/useIntersected';

function FilmIntro({ film, index }) {
  const ref = useRef();
  const visible = useIntersected(ref, 0.2);
  return (
    <div ref={ref} className={clsx(styles.intro, visible && styles.visible)}>
      <div className={clsx('p-x', styles.kicker)}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{film.kicker}</span>
      </div>
      <h3 className={clsx('h3', 'bold', styles.title)}>{film.title}</h3>
      <div className={styles.side}>
        <h6 className="h6">{film.text}</h6>
        {film.byline && <div className={clsx('p-x', styles.byline)}>{film.byline}</div>}
        {film.cta && <ButtonLink href={film.cta.href} label={film.cta.label} />}
      </div>
    </div>
  );
}

// Home page films: the founder's message, then a project film.
export default function Films() {
  return (
    <section className={clsx(styles.root, 'layout-grid-inner')}>
      {films.map((film, index) => (
        <Fragment key={film.id}>
          <FilmIntro film={film} index={index} />
          <div className={styles.frame}>
            <FilmPlayer film={film} />
          </div>
        </Fragment>
      ))}
    </section>
  );
}
