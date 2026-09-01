import { describe, expect, it } from 'vitest';

import {
  parseTimesheetHours,
  timesheetEntryCanEdit,
  validateTimesheetDayHours,
  validateTimesheetWeekHours,
} from './timesheetRules';

describe('timesheetRules', () => {
  it('rejects daily totals above 24 hours', () => {
    expect(validateTimesheetDayHours(24.01)).toBe(
      'Daily timesheet total cannot exceed 24 hours.'
    );
  });

  it('rejects weekly totals above 40 hours', () => {
    expect(validateTimesheetWeekHours(40.01)).toBe(
      'Weekly timesheet total cannot exceed 40 hours.'
    );
  });

  it('allows approved row edits only when approved-row locking is disabled', () => {
    expect(timesheetEntryCanEdit('APPROVED', '2026-08-10', '2026-08-03', false)).toBe(true);
    expect(timesheetEntryCanEdit('APPROVED', '2026-08-10', '2026-08-03', true)).toBe(false);
    expect(timesheetEntryCanEdit('SUBMITTED', '2026-08-10', '2026-08-03', false)).toBe(false);
  });

  it('accepts at most two decimal places for hours', () => {
    expect(parseTimesheetHours('1')).toBe(1);
    expect(parseTimesheetHours('1.2')).toBe(1.2);
    expect(parseTimesheetHours('1.23')).toBe(1.23);
    expect(parseTimesheetHours('.5')).toBe(0.5);
    expect(parseTimesheetHours('1.234')).toBeNaN();
  });
});
