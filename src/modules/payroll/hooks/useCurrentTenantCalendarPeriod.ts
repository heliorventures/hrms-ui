import { useEffect, useState } from 'react';

import {
  millisecondsUntilNextMinute,
  tenantCalendarPeriod,
  type TenantCalendarPeriod,
} from '../../../utils/tenantCalendar';

export function useCurrentTenantCalendarPeriod(timezone: string): TenantCalendarPeriod {
  const [period, setPeriod] = useState(() => tenantCalendarPeriod(new Date(), timezone));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refreshPeriod = () => {
      const next = tenantCalendarPeriod(new Date(), timezone);
      setPeriod((current) =>
        current.month === next.month && current.year === next.year ? current : next
      );
    };
    const refreshAtNextMinute = () => {
      const now = new Date();
      timer = setTimeout(() => {
        refreshPeriod();
        refreshAtNextMinute();
      }, millisecondsUntilNextMinute(now));
    };
    refreshPeriod();
    refreshAtNextMinute();
    return () => clearTimeout(timer);
  }, [timezone]);

  return period;
}
