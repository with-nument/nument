import { useEffect, useState } from 'react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Same query as the SCSS `mobile` mixin, so JS and CSS always agree.
    const query = window.matchMedia('(max-width: 812px)');
    const handleChange = () => setIsMobile(query.matches);

    handleChange();
    query.addEventListener('change', handleChange);

    return () => {
      query.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
