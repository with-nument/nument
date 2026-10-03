/* eslint-disable react/jsx-props-no-spreading */
import Home from '@src/pages/components/home/Index';
import About from '@src/pages/components/about/Index';
import Quote from '@src/pages/components/quote/Index';
import Projects from '@src/pages/components/projects/Index';
import Clients from '@src/pages/components/clients/Index';
import CustomHead from '@src/components/dom/CustomHead';

const seo = {
  title: 'Nument AI | AI Solutions for Startups & Enterprises',
  description: 'Nument AI designs, builds and scales production-grade AI for startups, enterprises and founding teams: LLM applications, AI agents, RAG knowledge assistants, predictive ML and MLOps.',
  keywords: [
    'Nument',
    'Nument AI',
    'AI Solutions',
    'AI Company',
    'AI Development Company',
    'Enterprise AI',
    'AI for Startups',
    'Generative AI',
    'LLM Applications',
    'AI Agents',
    'AI Automation',
    'RAG',
    'Knowledge Assistants',
    'Machine Learning',
    'Predictive Analytics',
    'Computer Vision',
    'Voice AI',
    'MLOps',
    'AI Strategy',
    'AI MVP',
    'AI Consulting',
    'Gurugram',
    'India',
  ],
};

function Page() {
  return (
    <>
      <CustomHead {...seo} />
      <Home />
      <About />
      <Clients />
      <Quote />
      <Projects />
    </>
  );
}

export default Page;
