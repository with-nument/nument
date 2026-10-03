import contact from '@src/constants/contact';
import { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

const CAL_NAMESPACE = 'nument';
const CAL_CONFIG = JSON.stringify({ layout: 'month_view', theme: 'light' });

// Returns props that turn a link into a Cal.com booking popup trigger,
// or null when no booking link is configured (callers keep their mailto fallback).
const useCalEmbed = (enabled = true) => {
  const calLink = enabled ? contact.calLink : '';

  useEffect(() => {
    if (!calLink) return;

    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal('ui', {
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
        cssVarsPerTheme: { light: { 'cal-brand': '#28282b' } },
      });
    })();
  }, [calLink]);

  if (!calLink) return null;

  return {
    'data-cal-link': calLink,
    'data-cal-namespace': CAL_NAMESPACE,
    'data-cal-config': CAL_CONFIG,
    // Cal.com listens for the click on the document; stop the mailto fallback from opening too.
    onClick: (e) => e.preventDefault(),
  };
};

export default useCalEmbed;
