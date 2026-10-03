import { Fragment, useRef } from 'react';

import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import DeviceWindow from '@src/components/projects/DeviceWindow';
import Link from 'next/link';
import clsx from 'clsx';
import styles from '@src/components/projects/showcase.module.scss';
import useIntersected from '@src/hooks/useIntersected';

function ProjectRow({ project, index, reverse }) {
  const infoRef = useRef();
  const visible = useIntersected(infoRef, 0.2);

  return (
    <div className={clsx(styles.row, reverse && styles.reverse)}>
      <DeviceWindow project={project} className={styles.window} mirrored={reverse} />
      <div ref={infoRef} className={clsx(styles.info, visible && styles.visible)}>
        <div className={clsx('p-x', styles.kicker)}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{project.industry}</span>
          <span>{project.date}</span>
        </div>
        <Link href={project.link} scroll={false} className={styles.titleLink} aria-label={`Open the ${project.title} case study`}>
          <h3 className={clsx('h3', 'bold', styles.title)}>{project.title}</h3>
        </Link>
        <div className={clsx('p-l', styles.client)}>for {project.client}</div>
        <h6 className={clsx('h6', styles.summary)}>{project.summary}</h6>
        <div className={styles.metrics}>
          {project.metrics.slice(0, 2).map((metric) => (
            <div key={metric.label} className={styles.metric}>
              <span className={clsx('h3', styles.value)}>{metric.value}</span>
              <span className="p-x">{metric.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <span key={tag} className={clsx('p-x', styles.tag)}>
                {tag}
              </span>
            ))}
          </div>
          <ButtonLink href={project.link} label="VIEW CASE STUDY" />
        </div>
      </div>
    </div>
  );
}

// Alternating rows: a 3D device window and the project's story, separated by white spacers.
export default function Showcase({ projects }) {
  return (
    <section className={clsx(styles.root, 'layout-grid-inner')}>
      {projects.map((project, index) => (
        <Fragment key={project.id}>
          <ProjectRow project={project} index={index} reverse={index % 2 === 1} />
          <div className={styles.spacer} />
        </Fragment>
      ))}
    </section>
  );
}
