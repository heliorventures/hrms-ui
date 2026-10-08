import { useEffect, useState } from 'react';

import { millisecondsUntilTenantDateChange } from '../../../utils/tenantCalendar';
import { tenantDateKey } from '../../../utils/tenantTime';

interface TenantCalendarDateState {
  ownerKey: string;
  date: string;
}

function currentTenantDate(timezone: string): string {
  return tenantDateKey(new Date(), timezone);
}

/**
 * Maintains the tenant calendar date independently of the configured attendance-day cutoff.
 * The owner key prevents a prior tenant/user timer from publishing into a replacement context.
 */
export function useTenantCalendarDate(timezone: string, identity: string): string {
  const ownerKey = `${identity}:${timezone}`;
  const [state, setState] = useState<TenantCalendarDateState>(() => ({
    ownerKey,
    date: currentTenantDate(timezone),
  }));
  const visibleDate = state.ownerKey === ownerKey ? state.date : currentTenantDate(timezone);

  useEffect(() => {
    let timerId: number | null = null;
    let active = true;

    const refresh = () => {
      if (!active) return;
      setState({ ownerKey, date: currentTenantDate(timezone) });
    };
    const schedule = () => {
      if (timerId !== null) window.clearTimeout(timerId);
      const now = new Date();
      timerId = window.setTimeout(
        () => {
          refresh();
          schedule();
        },
        millisecondsUntilTenantDateChange(now, timezone)
      );
    };
    const resume = () => {
      refresh();
      schedule();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resume();
    };

    refresh();
    schedule();
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      active = false;
      if (timerId !== null) window.clearTimeout(timerId);
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [ownerKey, timezone]);

  return visibleDate;
}
