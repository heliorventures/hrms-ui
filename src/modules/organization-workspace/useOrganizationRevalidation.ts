import { useEffect } from 'react';

export function useOrganizationRevalidation(refresh: () => void) {
  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', revalidate);
    document.addEventListener('visibilitychange', revalidate);
    const timer = window.setInterval(revalidate, 60_000);
    return () => {
      window.removeEventListener('focus', revalidate);
      document.removeEventListener('visibilitychange', revalidate);
      window.clearInterval(timer);
    };
  }, [refresh]);
}
