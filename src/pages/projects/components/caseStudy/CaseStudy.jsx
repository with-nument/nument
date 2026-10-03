import { useMemo, useRef } from 'react';

import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import DeviceWindow from '@src/components/projects/DeviceWindow';
import Image from 'next/image';
import clsx from 'clsx';
import styles from '@src/pages/projects/components/caseStudy/caseStudy.module.scss';
import useIntersected from '@src/hooks/useIntersected';

function Reveal({ children, className }) {
  const ref = useRef();
  const visible = useIntersected(ref, 0.15);
  return (
    <div ref={ref} className={clsx(styles.reveal, visible && styles.visible, className)}>
      {children}
    </div>
  );
}

function Media({ item, title, index, priority }) {
  if (item.tag === 'video') {
    return (
      <div className={styles.media}>
        <video loop muted autoPlay playsInline preload="metadata" poster={item.src.replace(/\.mp4$/, '-poster.webp')}>
          <source src={item.src} type="video/mp4" />
        </video>
      </div>
    );
  }
  return (
    <div className={clsx(styles.media, item.tag === 'medium' ? styles.medium : styles.big)}>
      <Image priority={priority} src={item.src} fill sizes="(max-width: 812px) 92vw, 82vw" alt={`${title} screen ${index + 1}`} />
    </div>
  );
}

// Case-study layout: hero, live 3D devices, key metrics, the story, then the product gallery.
export default function CaseStudy({ project }) {
  // Desktop screens and videos run large in order; every mobile screen is collected into one strip.
  const { wide, phones } = useMemo(
    () => ({
      wide: project.images.filter((item) => item.tag !== 'small'),
      phones: project.images.filter((item) => item.tag === 'small'),
    }),
    [project],
  );
  const story = [
    { label: 'The challenge', text: project.challenge },
    { label: 'What we built', text: project.solution },
    { label: 'The impact', text: project.impact },
  ];

  return (
    <>
      <section className={clsx(styles.hero, 'layout-grid-inner')}>
        <div className={clsx('p-x', styles.kicker)}>
          <span>Case study</span>
          <span>{project.industry}</span>
          <span>{project.date}</span>
        </div>
        <h1 className={clsx('h1', styles.title)}>
          <AppearTitle>
            <span>{project.title}</span>
          </AppearTitle>
        </h1>
        <dl className={styles.facts}>
          <div>
            <dt className="p-x">Client</dt>
            <dd className="h6">{project.client}</dd>
          </div>
          <div>
            <dt className="p-x">Industry</dt>
            <dd className="h6">{project.industry}</dd>
          </div>
          <div>
            <dt className="p-x">Year</dt>
            <dd className="h6">{project.date}</dd>
          </div>
          <div>
            <dt className="p-x">Scope</dt>
            <dd className="h6">{project.tags.join(', ')}</dd>
          </div>
        </dl>
        <Reveal className={styles.lede}>
          <p className="h3">{project.summary}</p>
        </Reveal>
      </section>

      <section className={clsx(styles.stage, 'layout-grid-inner')}>
        <DeviceWindow project={project} className={styles.window} />
      </section>

      <section className={clsx(styles.metrics, 'layout-grid-inner')}>
        {project.metrics.map((metric) => (
          <Reveal key={metric.label} className={styles.metric}>
            <span className={clsx('h1', styles.value)}>{metric.value}</span>
            <span className="h6">{metric.label}</span>
          </Reveal>
        ))}
      </section>

      <section className={clsx(styles.story, 'layout-grid-inner')}>
        {story.map((block) => (
          <Reveal key={block.label} className={styles.block}>
            <h6 className={clsx('p-x', styles.label)}>{block.label}</h6>
            <p className={clsx('h6', styles.text)}>{block.text}</p>
          </Reveal>
        ))}
      </section>

      <section className={clsx(styles.gallery, 'layout-grid-inner')}>
        {wide.slice(0, 2).map((item, index) => (
          <Reveal key={item.src} className={styles.galleryItem}>
            <Media item={item} title={project.title} index={index} priority={index === 0} />
          </Reveal>
        ))}
        {phones.length > 0 && (
          <Reveal className={styles.phones}>
            {phones.map((item, index) => (
              <div key={item.src} className={styles.phone}>
                <Image src={item.src} fill sizes="(max-width: 812px) 44vw, 20vw" alt={`${project.title} mobile screen ${index + 1}`} />
              </div>
            ))}
          </Reveal>
        )}
        {wide.slice(2).map((item, index) => (
          <Reveal key={item.src} className={styles.galleryItem}>
            <Media item={item} title={project.title} index={index + 2} />
          </Reveal>
        ))}
      </section>
    </>
  );
}
