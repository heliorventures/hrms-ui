/**
 * India FY anchor calendar year (April–March) for a payroll period month/year.
 * E.g. Jan 2027 pay → FY anchored at 2026.
 */
export function indiaFyAnchorYear(month: number, calendarYear: number): number {
  return month >= 4 ? calendarYear : calendarYear - 1;
}

/** Same FY anchor logic from a calendar date’s month/year parts. */
export function indiaFyStartYearFromDate(d = new Date()): number {
  return indiaFyAnchorYear(d.getMonth() + 1, d.getFullYear());
}
