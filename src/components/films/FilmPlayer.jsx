import { useEffect, useRef } from 'react';

import clsx from 'clsx';
import styles from '@src/components/films/films.module.scss';
import { useIntersection } from 'react-use';

// A film that plays silently on loop while on screen. The only control is sound: the first time it is
// turned on the film restarts, so the viewer hears it from the beginning. `previewStart` (seconds) lets
// the silent loop open on a strong frame.
export default function FilmPlayer({ film, soundOn, onSound }) {
  const root = useRef();
  const video = useRef();
  const heard = useRef(false);
  const intersection = useIntersection(root, { threshold: 0.2 });
  const inView = intersection?.isIntersecting;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else if (inView === false) v.pause();
  }, [inView]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = !soundOn;
    if (soundOn && !heard.current) {
      heard.current = true;
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [soundOn]);

  const toggle = () => onSound(!soundOn);

  return (
    <div ref={root} data-header={film.tone} className={styles.player}>
      {/* Captions are added per film (`captions`: a .vtt file). */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        src={film.src}
        poster={film.poster}
        muted
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
        onLoadedMetadata={(e) => {
          if (film.previewStart && !heard.current) e.currentTarget.currentTime = film.previewStart;
        }}
      >
        {film.captions && <track kind="captions" src={film.captions} srcLang="en" label="English" default />}
      </video>
      <button type="button" className={clsx('p-x', styles.sound, soundOn && styles.on)} onClick={toggle} aria-label={soundOn ? `Mute ${film.title}` : `Unmute ${film.title}`} aria-pressed={soundOn}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
          {soundOn ? (
            <path d="M15.5 9a4 4 0 010 6M17.8 7a7 7 0 010 10" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M15.5 9.5l5 5m0-5l-5 5" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" />
          )}
        </svg>
        <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
      </button>
    </div>
  );
}
