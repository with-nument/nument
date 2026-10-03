/* eslint-disable react/jsx-props-no-spreading */
import Hero from '@src/pages/about/components/hero/Hero';
import Overview from '@src/pages/about/components/overview/Overview';
import Services from '@src/pages/about/components/services/Services';
import Process from '@src/pages/about/components/process/Process';
import CustomHead from '@src/components/dom/CustomHead';

const seo = {
  title: 'Nument AI | About',
  description: 'Learn how Nument AI helps startups, enterprises and founding teams turn AI from promising demos into reliable, measurable products.',
  keywords: [
    'About Nument AI',
    'Nument',
    'AI Solutions Company',
    'AI Services',
    'AI Product Engineering',
    'AI Strategy & Advisory',
    'MLOps & Reliability',
    'AI Delivery Process',
    'Enterprise AI Partner',
    'AI for Startups',
    'Generative AI Development',
    'Gurugram AI Company',
  ],
};
function Page() {
  return (
    <>
      <CustomHead {...seo} />

      <Hero />
      <Overview />
      <Services />
      <Process />
    </>
  );
}

export default Page;
