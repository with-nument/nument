/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useMemo } from 'react';

import CaseStudy from '@src/pages/projects/components/caseStudy/CaseStudy';
import CustomHead from '@src/components/dom/CustomHead';
import NextProject from '@src/pages/projects/components/nextProject/NextProject';
import { gsap } from 'gsap';
import projects from '@src/constants/projects';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';

function Page({ id }) {
  const [setFluidColor] = useStore(useShallow((state) => [state.setFluidColor]));

  const projectIndex = useMemo(() => projects.findIndex((project) => project.id === id), [id]);
  const currentProject = useMemo(() => projects[projectIndex], [projectIndex]);

  const updateCSSVariables = (project) => {
    gsap.set('html', {
      '--black': project.primary,
      '--white': project.secondary,
      '--accentColor': project.accentColor,
      '--fillColor': project.fillColor,
      '--menuColor': project.menuColor,
      '--menuFontColor': project.menuFontColor,
    });
  };

  useEffect(() => {
    if (currentProject) {
      updateCSSVariables(currentProject);
      setFluidColor(currentProject.fluidColor);
    }
    return () => {
      updateCSSVariables({
        primary: '#28282b',
        secondary: '#f0f4f1',
        accentColor: '#f9f9f9',
        fillColor: '#f2ffbd',
        menuColor: '#28282b',
        menuFontColor: '#f0f4f1',
      });
      setFluidColor('#d7d7d4');
    };
  }, [currentProject]);

  const seo = useMemo(
    () => ({
      title: `Nument AI | ${currentProject.title}`,
      description: `${currentProject.title}: an AI product Nument AI designed, built and shipped for ${currentProject.company}.`,
      keywords: [
        `${currentProject.title}`,
        `${currentProject.title} AI`,
        `${currentProject.company}`,
        `Nument AI ${currentProject.title}`,
        `${currentProject.company} AI case study`,
        'Nument AI case study',
        'AI product development',
        'Production AI',
      ],
    }),
    [currentProject],
  );

  return (
    <>
      <CustomHead {...seo} />
      <CaseStudy key={currentProject.id} project={currentProject} />
      <NextProject nextProject={projectIndex === projects.length - 1 ? projects[0] : projects[projectIndex + 1]} />
    </>
  );
}

export async function getStaticPaths() {
  const paths = projects.map((project) => ({ params: { id: project.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps(context) {
  const { params } = context;
  return { props: { id: params.id } };
}

export default Page;
