import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export function usePersonalLeaveNavigation(canSubmitLeave: boolean, loading: boolean) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  useEffect(() => {
    if (canSubmitLeave && searchParams.get('apply') === '1') {
      setApplyOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('apply');
      setSearchParams(next, { replace: true });
    }
  }, [canSubmitLeave, searchParams, setSearchParams]);

  useEffect(() => {
    if (!loading && location.hash === '#leave-requests') {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById('leave-requests-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [loading, location.hash]);

  return { applyOpen, setApplyOpen };
}
