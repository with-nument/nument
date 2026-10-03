import { useEffect, useState } from 'react';

import PerspectiveText from '@src/components/animationComponents/perspectiveText/Index';
import clsx from 'clsx';
import sound from '@src/sound/engine';
import styles from '@src/components/dom/navbar/styles/soundButton.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';

function SoundButton() {
  const isMobile = useIsMobile();
  // `enabled` is the visitor's choice; `ready` is whether the browser has actually let audio start
  // (it needs a click first). The bars only move when sound can really be heard.
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setEnabled(sound.isEnabled());
      setReady(sound.isReady());
    };
    sync();
    return sound.subscribe(sync);
  }, []);
  const audible = enabled && ready;
  let title = 'Sound off (M)';
  if (audible) title = 'Sound on (M)';
  else if (enabled) title = 'Click to turn sound on';

  // "M" toggles sound, unless the visitor is typing somewhere.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== 'm' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      sound.unlock().then(() => sound.toggle());
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Sound chosen but not started yet: a click starts it rather than switching it off.
  const handleClick = () => {
    if (enabled && !ready) {
      sound.unlock().then(() => sound.play('chimeOn'));
      return;
    }
    sound.unlock().then(() => sound.toggle());
  };

  return (
    <button
      type="button"
      data-sound="none"
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={audible ? 'Turn sound off' : 'Turn sound on'}
      title={title}
      className={clsx('p-xs', styles.button, !audible && styles.muted)}
    >
      <span className={styles.bars} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {!isMobile && <PerspectiveText label="Sound" className={clsx('p-x', styles.label)} />}
    </button>
  );
}

export default SoundButton;
