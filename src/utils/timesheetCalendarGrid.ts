import { addDaysIso, parseIsoDate } from './calendarRange';
import { timesheetWeekRangeIso } from './timesheetWeek';

export type TimesheetCalendarDayCell = {
  iso: string;
  /** True when this day belongs to the viewed period (month/custom/week inner range). */
  inPrimaryRange: boolean;
};

/** Single Mon–Sun row; every cell is in range. */
export function buildWeekRowCells(weekMondayIso: string): TimesheetCalendarDayCell[][] {
  const row: TimesheetCalendarDayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDaysIso(weekMondayIso, i);
    row.push({ iso, inPrimaryRange: true });
  }
  return [row];
}

/** Month grid: leading/trailing days outside the month have `inPrimaryRange: false`. */
export function buildMonthGridCells(monthStartIso: string, monthEndIso: string): TimesheetCalendarDayCell[][] {
  let curMonday = timesheetWeekRangeIso(parseIsoDate(monthStartIso)).start;
  const gridEndSunday = timesheetWeekRangeIso(parseIsoDate(monthEndIso)).end;
  const weeks: TimesheetCalendarDayCell[][] = [];
  while (curMonday <= gridEndSunday) {
    const row: TimesheetCalendarDayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = addDaysIso(curMonday, i);
      row.push({
        iso,
        inPrimaryRange: iso >= monthStartIso && iso <= monthEndIso,
      });
    }
    weeks.push(row);
    curMonday = addDaysIso(curMonday, 7);
  }
  return weeks;
}

/** Custom inclusive range padded to full weeks (Mon–Sun). */
export function buildCustomRangeGridCells(rangeStartIso: string, rangeEndIso: string): TimesheetCalendarDayCell[][] {
  let curMonday = timesheetWeekRangeIso(parseIsoDate(rangeStartIso)).start;
  const gridEndSunday = timesheetWeekRangeIso(parseIsoDate(rangeEndIso)).end;
  const weeks: TimesheetCalendarDayCell[][] = [];
  while (curMonday <= gridEndSunday) {
    const row: TimesheetCalendarDayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = addDaysIso(curMonday, i);
      row.push({
        iso,
        inPrimaryRange: iso >= rangeStartIso && iso <= rangeEndIso,
      });
    }
    weeks.push(row);
    curMonday = addDaysIso(curMonday, 7);
  }
  return weeks;
}
