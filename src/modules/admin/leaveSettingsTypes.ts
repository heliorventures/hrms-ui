import type { AdminLeaveConsoleQuery, HolidaysInCalendarQuery } from '../../api/graphql/graphql';

export type LeaveSettingsTabKey = 'types' | 'policies' | 'balances' | 'holidays';
export type LeaveTypeRow = AdminLeaveConsoleQuery['leaveTypes'][number];
export type LeavePolicyRow = AdminLeaveConsoleQuery['leavePolicies'][number];
export type HolidayCalendarRow = AdminLeaveConsoleQuery['holidayCalendars'][number];
export type HolidayDayRow = HolidaysInCalendarQuery['holidaysInCalendar'][number];

export interface LeaveTypeForm {
  name: string;
  code: string;
  isPaid: boolean;
  carryForward: boolean;
  maxCf: string;
  sandwich: boolean;
  halfDay: boolean;
  reqDoc: boolean;
}

export interface LeavePolicyForm {
  leaveTypeId: string;
  applicableTo: string;
  annual: string;
  freq: string;
  accrualDays: string;
  maxCons: string;
  minNotice: string;
}

export interface LeaveBalanceForm {
  employeeId: string;
  leaveTypeId: string;
  year: string;
  entitled: string;
  used: string;
  pending: string;
  carried: string;
}

export interface LeaveBalanceAdjustmentForm {
  employeeId: string;
  leaveTypeId: string;
  year: string;
  delta: string;
  alsoCredit: boolean;
}

export interface HolidayCalendarForm {
  name: string;
  year: string;
  locationId: string;
}

export interface HolidayDayForm {
  holidayDate: string;
  name: string;
  holidayType: string;
}
