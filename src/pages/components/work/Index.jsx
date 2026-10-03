import AppearByWords from '@src/components/animationComponents/appearByWords/Index';
import Showcase from '@src/components/projects/Showcase';
import clsx from 'clsx';
import styles from '@src/pages/components/work/styles/work.module.scss';
import useIntersected from '@src/hooks/useIntersected';
import { useRef } from 'react';

const TRUSTED_BY = ['IIM Rohtak', 'IIM Shillong'];

// Products we designed and built, shown in the same 3D device rows as the projects page (no links out).
const WORK = [
  {
    id: 'veraawell',
    title: 'Veraawell',
    industry: 'Mental health',
    summary: 'A complete mental health platform for India, designed and built from scratch, with private video therapy in the browser.',
    metrics: [
      { value: '1,000+', label: 'people healing on the platform' },
      { value: '50+', label: 'verified therapists and experts' },
    ],
    tags: ['Product design', 'Web platform', 'WebRTC video'],
    device: { screen: '/work/veraawell-screen.webp', phone: '/work/veraawell-phone.webp' },
    accent: '#14a3b4',
  },
  {
    id: 'voicely',
    title: 'Voicely',
    industry: 'Voice AI',
    summary: 'AI voice agents that hold natural phone conversations, for outbound calling, lead qualification and support.',
    metrics: [
      { value: '~600 ms', label: 'response time on live calls' },
      { value: 'Gen 3', label: 'LLM voice AI, not IVR menus' },
    ],
    tags: ['Voice agents', 'LLMs', 'Real-time audio'],
    device: { screen: '/work/voicely-screen.webp', phone: '/work/voicely-phone.webp' },
    accent: '#2f6bff',
  },
];

// Home: "Our work" with who trusts us beside it, then the products themselves.
function Work() {
  const trustedRef = useRef();
  const trustedVisible = useIntersected(trustedRef, 0.3);

  return (
    <>
      <section className={clsx(styles.titleContainer, 'layout-grid-inner')}>
        <h1 className={clsx(styles.title, 'h1')}>
          <AppearByWords>Our work</AppearByWords>
        </h1>
        <div ref={trustedRef} className={clsx(styles.trusted, trustedVisible && styles.visible)}>
          <span className={clsx('p-x', styles.label)}>Trusted by</span>
          <ul className={styles.names}>
            {TRUSTED_BY.map((name) => (
              <li key={name} className="h5">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Showcase projects={WORK} />
    </>
  );
}

export default Work;
