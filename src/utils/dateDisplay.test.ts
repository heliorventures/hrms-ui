import { describe, expect, it } from 'vitest';

import { formatCalendarDate, formatDisplayDate, formatInstant } from './dateDisplay';

describe('formatCalendarDate', () => {
  it('formats a date-only value as the same local calendar day', () => {
    expect(formatCalendarDate('2026-08-20', 'en-IN')).toBe('20 Aug 2026');
  });

  it('returns a placeholder for absent or invalid calendar dates', () => {
    expect(formatCalendarDate(null, 'en-IN')).toBe('—');
    expect(formatCalendarDate('2026-02-30', 'en-IN')).toBe('—');
  });
});

describe('formatInstant', () => {
  it('formats a Date instant with both date and time', () => {
    expect(formatInstant(new Date(2026, 7, 20, 0, 15), 'en-IN')).toBe('20 Aug 2026, 12:15 am');
  });

  it('returns a placeholder for an invalid instant', () => {
    expect(formatInstant('not-a-date', 'en-IN')).toBe('—');
  });

  it('rejects date-only input at the instant boundary', () => {
    expect(formatInstant('2026-08-20', 'en-IN')).toBe('—');
  });
});

describe('formatDisplayDate', () => {
  it('formats an ISO instant string as a date without a time component', () => {
    const instant = new Date('2026-08-20T00:30:00.000Z');
    const expectedDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(instant);
    const result = formatDisplayDate('2026-08-20T00:30:00.000Z', 'en-IN');

    expect(result).toBe(expectedDate);
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });
});
