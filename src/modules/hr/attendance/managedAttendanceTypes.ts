import type { ManagedAttendancePageQuery } from '../../../api/graphql/graphql';

export const MANAGED_ATTENDANCE_PAGE_SIZE = 50;
export const MAX_MANAGED_ATTENDANCE_RANGE_DAYS = 92;

export type ManagedAttendanceRow =
  ManagedAttendancePageQuery['managedAttendance']['edges'][number]['node'];
export type ManagedAttendancePageInfo = ManagedAttendancePageQuery['managedAttendance']['pageInfo'];

export interface ManagedAttendanceFiltersValue {
  fromDate: string;
  toDate: string;
  employeeSearch: string;
  employeeId?: string;
}

export interface ManagedAttendanceEmployee {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
}

export type ManagedAttendanceActions = {
  onAdd: (employee: ManagedAttendanceEmployee) => void;
  onAdjust: (row: ManagedAttendanceRow) => void;
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function asUtcDate(isoDate: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const value = new Date(Date.UTC(year, monthIndex, day));
  return value.getUTCFullYear() === year && value.getUTCMonth() === monthIndex && value.getUTCDate() === day
    ? value
    : null;
}

export function managedAttendanceRangeError(fromDate: string, toDate: string): string | null {
  const from = asUtcDate(fromDate);
  const to = asUtcDate(toDate);
  if (!from || !to) {
    return 'Enter a valid start and end date.';
  }
  if (from > to) {
    return 'End date must be on or after the start date.';
  }
  const inclusiveDays = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
  if (inclusiveDays > MAX_MANAGED_ATTENDANCE_RANGE_DAYS) {
    return 'Choose a date range of 92 calendar days or fewer.';
  }
  return null;
}

export function managedAttendanceEmployee(row: ManagedAttendanceRow): ManagedAttendanceEmployee {
  return {
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    employeeCode: row.employeeCode,
  };
}
