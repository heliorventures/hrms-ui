import { describe, expect, it } from 'vitest';

import {
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
});
