import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

export interface ApplyLeaveTypeOption {
  id: string;
  name: string;
  code: string;
  isPaid?: boolean;
  halfDayAllowed?: boolean;
  requiresDocument?: boolean;
  sandwichRule?: boolean;
}

export type ApplyLeavePolicyRow = LeaveBoardQuery['leavePolicies'][number];
export type ApplyHolidayRow = LeaveBoardQuery['upcomingHolidays'][number];
export type ApplyBalanceRow = LeaveBoardQuery['leaveBalances'][number];

export function calendarDaysBeforeLeaveStart(fromDate: string): number {
  const [year, month, day] = fromDate.split('-').map(Number);
  if (!year || !month || !day) return Number.NaN;
  const start = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}

const holidayDateIso = (holiday: ApplyHolidayRow) => {
  const value = holiday.holidayDate as string;
  return typeof value === 'string' ? value.slice(0, 10) : '';
};

export function requestedLeaveDays(
  from: string,
  to: string,
  halfDay: boolean,
  sandwichRule: boolean,
  holidays: ApplyHolidayRow[]
): number {
  if (halfDay) return 0.5;
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  const start = new Date(fromYear, fromMonth - 1, fromDay);
  const end = new Date(toYear, toMonth - 1, toDay);
  if (sandwichRule) return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  const holidayDates = new Set(
    holidays.map(holidayDateIso).filter((date) => date && date >= from && date <= to)
  );
  let requestedDays = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isoDate = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(
      current.getDate()
    ).padStart(2, '0')}`;
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(isoDate)) requestedDays += 1;
    current.setDate(current.getDate() + 1);
  }
  return requestedDays;
}
