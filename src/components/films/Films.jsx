import { useRef, useState } from 'react';

import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import FilmPlayer from '@src/components/films/FilmPlayer';
import clsx from 'clsx';
import films from '@src/constants/films';
import styles from '@src/components/films/films.module.scss';
import useIntersected from '@src/hooks/useIntersected';

function FilmCard({ film, index, soundOn, onSound }) {
  const ref = useRef();
  const visible = useIntersected(ref, 0.15);
  return (
    <article ref={ref} className={clsx(styles.card, index === 0 ? styles.lead : styles.second, visible && styles.visible)}>
      <FilmPlayer film={film} soundOn={soundOn} onSound={onSound} />
      <div className={styles.caption}>
        <div className={clsx('p-x', styles.kicker)}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{film.kicker}</span>
        </div>
        <h3 className={clsx(index === 0 ? 'h3' : 'h4', 'bold', styles.title)}>{film.title}</h3>
        <p className={clsx('p-l', styles.text)}>{film.text}</p>
        {film.byline && (
          <div className={styles.credit}>
            <span className="p-x">{film.byline}</span>
            {film.affiliation && <span className={clsx('p-xs', styles.affiliation)}>{film.affiliation}</span>}
          </div>
        )}
        {film.cta && <ButtonLink href={film.cta.href} label={film.cta.label} />}
      </div>
    </article>
  );
}

// Home page films: the founder's message leads, the Nument film follows offset below. Only one plays with sound.
export default function Films() {
  const [soundId, setSoundId] = useState(null);
  return (
    <section className={clsx(styles.root, 'layout-grid-inner')}>
      {films.map((film, index) => (
        <FilmCard key={film.id} film={film} index={index} soundOn={soundId === film.id} onSound={(on) => setSoundId(on ? film.id : null)} />
      ))}
    </section>
  );
}
