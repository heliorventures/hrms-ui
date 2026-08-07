import { parseIsoDate, toIsoDate } from '../../utils/calendarRange';
import { timesheetWeekRangeIso } from '../../utils/timesheetWeek';

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

export const downloadTextFile = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
