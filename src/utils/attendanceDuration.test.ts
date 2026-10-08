import { describe, expect, it } from 'vitest';

import { attendanceSegmentMinutes, formatMinutesAsHhMm } from './attendanceDuration';

describe('formatMinutesAsHhMm', () => {
  it('rounds the total before splitting hours and minutes', () => {
    expect(formatMinutesAsHhMm(59 + 59 / 60)).toBe('1h 00m');
    expect(formatMinutesAsHhMm(59)).toBe('0h 59m');
    expect(formatMinutesAsHhMm(59.99)).not.toContain('60m');
  });
});

describe('attendanceSegmentMinutes', () => {
  it('uses canonical instants across the New York DST fallback', () => {
    expect(
      attendanceSegmentMinutes({
        checkInAt: '2026-11-01T03:00:00Z',
        checkOutAt: '2026-11-01T09:00:00Z',
        checkInTime: '23:00:00',
        checkOutTime: '04:00:00',
      })
    ).toBe(360);
  });

  it('does not fall back to wall times for an incomplete canonical segment', () => {
    expect(
      attendanceSegmentMinutes({
        checkInAt: '2026-09-11T17:30:00Z',
        checkOutAt: null,
        checkInTime: '23:00:00',
        checkOutTime: '04:00:00',
      })
    ).toBeNull();
  });

  it('retains the legacy overnight fallback only when canonical timestamps are absent', () => {
    expect(
      attendanceSegmentMinutes({
        checkInTime: '23:00:00',
        checkOutTime: '04:00:00',
      })
    ).toBe(300);
  });
});
