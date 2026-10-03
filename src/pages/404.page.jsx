import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  const redirected = useRef(false);

  // replace (not push) so the Back button doesn't land on the dead URL again.
  useEffect(() => {
    if (redirected.current) return;
    redirected.current = true;
    router.replace('/');
  }, [router]);

  return null;
}
