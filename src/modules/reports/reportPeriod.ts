import { monthBoundsIso } from '../../utils/calendarRange';
import { tenantDateKey } from '../../utils/tenantTime';

export function currentReportPeriod(timezone: string) {
  const today = tenantDateKey(new Date(), timezone);
  const [year, month] = today.split('-').map(Number);
  const period = monthBoundsIso(year, month - 1);
  return { fromDate: period.start, toDate: period.end };
}

export function reportPeriodError(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return 'Choose both dates.';
  return fromDate > toDate ? 'From date must be on or before to date.' : null;
}
