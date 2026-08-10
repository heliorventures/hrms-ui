import { parseIsoDate, toIsoDate } from '../../utils/calendarRange';
import { timesheetWeekRangeIso } from '../../utils/timesheetWeek';

export const MAX_TIMESHEET_ENTRY_HOURS = 24;
export const MAX_TIMESHEET_WEEK_HOURS = 40;

export const statusUpper = (status: string) => status.trim().toUpperCase();

export const timesheetEntryCanDelete = (status: string) => {
  const normalized = statusUpper(status);
  return normalized === 'DRAFT' || normalized === 'REJECTED';
};

export const earliestEditableMondayIso = (editableWeekSpan: number) => {
  const today = new Date();
  const { start: currentMonday } = timesheetWeekRangeIso(today);
  const cursor = parseIsoDate(currentMonday);
  const span = Math.max(1, Math.floor(editableWeekSpan));
  cursor.setDate(cursor.getDate() - 7 * (span - 1));
  return toIsoDate(cursor);
};

export const weekMondayOfWorkDateIso = (workIso: string) =>
  timesheetWeekRangeIso(parseIsoDate(workIso)).start;

export const timesheetEntryCanEdit = (status: string, workDate: string, earliestMonday: string) =>
  statusUpper(status) === 'DRAFT' && weekMondayOfWorkDateIso(workDate) >= earliestMonday;

export const timesheetEntryLocksDay = (status: string) => {
  const normalized = statusUpper(status);
  return normalized === 'PENDING' || normalized === 'SUBMITTED' || normalized === 'APPROVED';
};

export const formatTimesheetHours = (hours: number | string) => {
  const value = typeof hours === 'number' ? hours : parseFloat(hours);
  if (!Number.isFinite(value)) return String(hours);
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, '');
};

export const validateTimesheetEntryHours = (hours: string): string | null => {
  const value = parseFloat(hours);
  if (!Number.isFinite(value) || value <= 0) return 'Enter valid hours greater than 0.';
  if (value > MAX_TIMESHEET_ENTRY_HOURS) {
    return `A single timesheet entry cannot exceed ${MAX_TIMESHEET_ENTRY_HOURS} hours.`;
  }
  return null;
};

export const validateTimesheetWeekHours = (hours: number): string | null => {
  if (hours > MAX_TIMESHEET_WEEK_HOURS) {
    return `Weekly timesheet total cannot exceed ${MAX_TIMESHEET_WEEK_HOURS} hours.`;
  }
  return null;
};

export const downloadTextFile = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
