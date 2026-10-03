import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import styles from '@src/components/films/films.module.scss';
import { useIntersection } from 'react-use';

const format = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// A film with a silent looping preview; click to watch it from the start with sound and controls.
export default function FilmPlayer({ film }) {
  const root = useRef();
  const video = useRef();
  const hideTimer = useRef();
  const [playing, setPlaying] = useState(false); // watching with sound (not the silent preview)
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [controlsVisible, setControlsVisible] = useState(true);
  const intersection = useIntersection(root, { threshold: 0.25 });
  const inView = intersection?.isIntersecting;

  // Preview loops while visible; a film being watched pauses when scrolled away.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView === false) v.pause();
    else if (inView && !paused) v.play().catch(() => {});
  }, [inView, paused]);

  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2200);
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const start = () => {
    const v = video.current;
    v.currentTime = 0;
    v.muted = false;
    v.loop = false;
    setMuted(false);
    setPaused(false);
    setPlaying(true);
    v.play().catch(() => {});
    showControls();
  };

  const toggle = () => {
    const v = video.current;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
    showControls();
  };

  const stop = () => {
    const v = video.current;
    setPlaying(false);
    setPaused(false);
    v.muted = true;
    v.loop = true;
    v.play().catch(() => {});
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = video.current;
    v.currentTime = ((e.clientX - rect.left) / rect.width) * (v.duration || 0);
    showControls();
  };

  return (
    <div ref={root} data-header="dark" className={clsx(styles.player, playing && styles.watching, controlsVisible && styles.controlsOn)} onPointerMove={playing ? showControls : undefined}>
      {/* Captions are added per film (`captions`: a .vtt file); the placeholder clips have no speech. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        src={film.src}
        poster={film.poster}
        muted={!playing || muted}
        loop={!playing}
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => setTime({ current: 0, duration: e.currentTarget.duration })}
        onTimeUpdate={(e) => setTime({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration })}
        onEnded={stop}
        onClick={playing ? toggle : start}
      >
        {film.captions && <track kind="captions" src={film.captions} srcLang="en" label="English" default />}
      </video>
      {!playing && (
        <button type="button" className={styles.play} onClick={start} aria-label={`Play ${film.title}`}>
          <span className={styles.circle}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          <span className={clsx('p-x', styles.playLabel)}>Play film · {format(time.duration)}</span>
        </button>
      )}
      {playing && (
        <div className={styles.controls}>
          <button type="button" className={styles.icon} onClick={toggle} aria-label={paused ? 'Play' : 'Pause'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {paused ? <path d="M8 5.5v13l11-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
            </svg>
          </button>
          <div className={styles.track} onClick={seek} role="presentation">
            <span style={{ transform: `scaleX(${time.duration ? time.current / time.duration : 0})` }} />
          </div>
          <span className={clsx('p-x', styles.time)}>
            {format(time.current)} / {format(time.duration)}
          </span>
          <button
            type="button"
            className={styles.icon}
            onClick={() => {
              video.current.muted = !muted;
              setMuted(!muted);
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
              {muted ? (
                <path d="M15.5 9.5l5 5m0-5l-5 5" strokeWidth="1.8" stroke="currentColor" fill="none" />
              ) : (
                <path d="M15.5 9a4 4 0 010 6M17.8 7a7 7 0 010 10" strokeWidth="1.8" stroke="currentColor" fill="none" />
              )}
            </svg>
          </button>
          <button type="button" className={styles.icon} onClick={() => video.current.requestFullscreen?.()} aria-label="Full screen">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" strokeWidth="1.8" stroke="currentColor" fill="none" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
