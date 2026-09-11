import { describe, expect, it } from 'vitest';

import type { AttendanceRow } from '../types';

import { attendanceSegmentRows } from './attendanceSegmentRows';

const row = (overrides: Partial<AttendanceRow> = {}): AttendanceRow => ({
  id: 'segment-1',
  employeeId: 'employee-1',
  workDate: '2026-10-31',
  checkInAt: '2026-11-01T03:00:00Z',
  checkOutAt: '2026-11-01T09:00:00Z',
  checkInTime: '23:00:00',
  checkOutTime: '04:00:00',
  status: 'PRESENT',
  source: 'WEB',
  ...overrides,
});

describe('attendanceSegmentRows canonical duration', () => {
  it('shows six actual hours across the New York DST fallback', () => {
    const [segment] = attendanceSegmentRows([row()], {
      start: '2026-10-01',
      end: '2026-10-31',
    });

    expect(segment.segmentMinutes).toBe(360);
  });

  it('keeps an incomplete canonical row incomplete despite a legacy checkout time', () => {
    const [segment] = attendanceSegmentRows([row({ checkOutAt: null })], {
      start: '2026-10-01',
      end: '2026-10-31',
    });

    expect(segment.segmentMinutes).toBeNull();
  });
});
