import AppearByWords from '@src/components/animationComponents/appearByWords/Index';
import Films from '@src/components/films/Films';
import clsx from 'clsx';
import styles from '@src/pages/components/projects/styles/projects.module.scss';

// Home: "Inside Nument" — the founder's message and a project film.
function Projects() {
  return (
    <>
      <section className={clsx(styles.titleContainer, 'layout-grid-inner')}>
        <h1 className={clsx(styles.title, 'h1')}>
          <AppearByWords>Inside Nument</AppearByWords>
        </h1>
      </section>
      <Films />
    </>
  );
}

export default Projects;
