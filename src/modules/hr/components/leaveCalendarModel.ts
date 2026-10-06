import type { HolidayEntry, HrLeaveCalendarQuery } from '../../../api/graphql/graphql';

export { HrLeaveCalendarRangeDocument } from '../../../api/graphql/graphql';

export type LeaveCalendarData = Omit<HrLeaveCalendarQuery, 'upcomingHolidays'> & {
  upcomingHolidays: Pick<
    HolidayEntry,
    'id' | 'holidayDate' | 'name' | 'calendarName' | 'holidayType'
  >[];
};
export type LeaveCalendarResponse = Omit<LeaveCalendarData, 'orgChart' | 'upcomingHolidays'> &
  Partial<Pick<LeaveCalendarData, 'orgChart' | 'upcomingHolidays'>>;

export const MAX_EMPLOYEES = 45;

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function monthRange(year: number, month: number): { days: string[] } {
  const last = new Date(year, month + 1, 0).getDate();
  const days: string[] = [];
  for (let d = 1; d <= last; d++) {
    days.push(`${year}-${pad2(month + 1)}-${pad2(d)}`);
  }
  return { days };
}

export function hslForLeaveType(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 62% 42%)`;
}

export function parseIsoDate(s: unknown): string {
  return String(s).slice(0, 10);
}

export function eachDayInclusive(from: string, to: string): Set<string> {
  const out = new Set<string>();
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const a = new Date(fy, fm - 1, fd);
  const b = new Date(ty, tm - 1, td);
  const cur = new Date(a);
  while (cur <= b) {
    out.add(`${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
