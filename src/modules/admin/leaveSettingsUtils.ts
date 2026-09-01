import type {
  HolidayCalendarForm,
  HolidayDayForm,
  LeaveBalanceAdjustmentForm,
  LeaveBalanceForm,
  LeavePolicyForm,
  LeavePolicyRow,
  LeaveTypeForm,
  LeaveTypeRow,
} from './leaveSettingsTypes';

export const selectFieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export const HOLIDAY_LIMIT = 200;

export const LEAVE_SETTINGS_TABS = [
  { key: 'types', label: 'Leave Types' },
  { key: 'policies', label: 'Policies' },
  { key: 'balances', label: 'Balances' },
  { key: 'holidays', label: 'Holidays' },
] as const;

export const ACCRUAL_FREQUENCY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
];

export const HOLIDAY_TYPE_OPTIONS = [
  { value: '', label: 'Not Specified' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'NATIONAL', label: 'National' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'OPTIONAL', label: 'Optional' },
  { value: 'COMPANY', label: 'Company' },
];

export const DEFAULT_LEAVE_TYPE_FORM: LeaveTypeForm = {
  name: '',
  code: '',
  isPaid: true,
  carryForward: false,
  maxCf: '',
  sandwich: false,
  halfDay: true,
  reqDoc: false,
};

export const DELETE_LEAVE_TYPE_DIALOG = {
  title: 'Delete Leave Type?',
  message: 'This will soft-delete the leave type for your tenant.',
  variant: 'danger' as const,
  confirmLabel: 'Delete',
};

export const DELETE_LEAVE_POLICY_DIALOG = {
  title: 'Delete Policy?',
  message: 'Remove this leave policy row?',
  variant: 'danger' as const,
  confirmLabel: 'Delete',
};

export const DELETE_HOLIDAY_CALENDAR_DIALOG = {
  title: 'Delete Calendar?',
  message: 'This deletes the holiday calendar and all holidays on it.',
  variant: 'danger' as const,
  confirmLabel: 'Delete',
};

export const DELETE_HOLIDAY_DIALOG = {
  title: 'Remove Holiday?',
  message: 'Remove this holiday from the calendar?',
  variant: 'danger' as const,
  confirmLabel: 'Remove',
};

export function provisionBalancesDialog(year: number) {
  return {
    title: 'Provision Balances From Policies?',
    message: `This upserts leave balances for every active employee for calendar year ${year} using each leave type's policy. Existing used and pending values are kept where possible.`,
    confirmLabel: 'Provision',
  };
}

export function createEmptyPolicyForm(leaveTypeId = ''): LeavePolicyForm {
  return {
    leaveTypeId,
    applicableTo: '',
    annual: '',
    freq: '',
    accrualDays: '',
    maxCons: '',
    minNotice: '',
  };
}

export function createBalanceForm(year: number): LeaveBalanceForm {
  return {
    employeeId: '',
    leaveTypeId: '',
    year: String(year),
    entitled: '0',
    used: '0',
    pending: '0',
    carried: '0',
  };
}

export function createAdjustmentForm(year: number): LeaveBalanceAdjustmentForm {
  return {
    employeeId: '',
    leaveTypeId: '',
    year: String(year),
    delta: '1',
  };
}

export function createCalendarForm(year: number): HolidayCalendarForm {
  return { name: '', year: String(year), locationId: '' };
}

export function createHolidayForm(): HolidayDayForm {
  return { holidayDate: '', name: '', holidayType: '' };
}

export function numberOrNull(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function createLeaveTypeForm(row: LeaveTypeRow): LeaveTypeForm {
  return {
    name: row.name,
    code: row.code,
    isPaid: row.isPaid,
    carryForward: row.carryForward,
    maxCf: row.maxCarryForwardDays != null ? String(row.maxCarryForwardDays) : '',
    sandwich: row.sandwichRule,
    halfDay: row.halfDayAllowed,
    reqDoc: row.requiresDocument,
  };
}

export function formatLeaveTypeFlags(row: LeaveTypeRow): string {
  const pay = row.isPaid ? 'Paid' : 'Unpaid';
  const day = row.halfDayAllowed ? 'Half day' : 'Full day';
  const document = row.requiresDocument ? 'Document Required' : 'No Document';
  return `${pay} - ${day} - ${document}`;
}

export function formatLeavePolicyAccrual(row: LeavePolicyRow): string {
  const empty = [row.accrualFrequency, row.accrualDays].every((value) => value == null || value === '');
  return empty ? '-' : `${row.accrualFrequency ?? '-'} - ${row.accrualDays ?? '-'} d`;
}

export function formatDateForTenant(value: string): string {
  return new Date(value).toLocaleDateString('en-IN');
}
