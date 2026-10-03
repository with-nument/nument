/* eslint-disable react/jsx-props-no-spreading */
import { useMemo, useState } from 'react';

import CustomHead from '@src/components/dom/CustomHead';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Showcase from '@src/components/projects/Showcase';
import clsx from 'clsx';
import projects from '@src/constants/projects';
import styles from '@src/pages/projects/projects.module.scss';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';

const seo = {
  title: 'Nument AI | Projects',
  description:
    'Explore AI products Nument AI has designed and shipped, from clinical documentation copilots and logistics forecasting to AI underwriting, shopping assistants and enterprise knowledge search.',
  keywords: [
    'Nument AI Projects',
    'AI Case Studies',
    'AI Product Portfolio',
    'LLM Applications',
    'AI Agents',
    'RAG Systems',
    'Healthcare AI',
    'Logistics AI',
    'Fintech AI',
    'Retail AI',
    'Enterprise Knowledge Search',
    'Production AI',
  ],
};

const FILTERS = ['All', ...new Set(projects.map((project) => project.industry))];

function Page() {
  const [filter, setFilter] = useState('All');
  const visible = useMemo(() => (filter === 'All' ? projects : projects.filter((project) => project.industry === filter)), [filter]);

  // Row positions change when filtering, so re-measure the page's scroll animations.
  useIsomorphicLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, [filter]);

  return (
    <>
      <CustomHead {...seo} />
      <section className={clsx(styles.titleContainer, 'layout-block-inner')}>
        <h1 className={clsx(styles.title, 'h1')}>All Projects</h1>
        <div className={styles.filters} role="toolbar" aria-label="Filter projects by industry">
          {FILTERS.map((name) => (
            <button key={name} type="button" aria-pressed={filter === name} className={clsx('p-x', styles.filter, filter === name && styles.active)} onClick={() => setFilter(name)}>
              {name}
              <span>{name === 'All' ? projects.length : projects.filter((project) => project.industry === name).length}</span>
            </button>
          ))}
        </div>
      </section>
      <Showcase key={filter} projects={visible} />
    </>
  );
}

export default Page;
