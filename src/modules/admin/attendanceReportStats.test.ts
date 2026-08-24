import { describe, expect, it } from 'vitest';

import { buildAttendanceReportStats } from './attendanceReportStats';

describe('buildAttendanceReportStats', () => {
  it('derives attendance summary from completed punch segments instead of raw status labels', () => {
    const stats = buildAttendanceReportStats([
      {
        id: 'attendance-1',
        employeeId: 'employee-1',
        workDate: '2026-08-22',
        status: 'COMPLETE',
        checkInTime: '09:00:00',
        checkOutTime: '18:04:00',
      },
      {
        id: 'attendance-2',
        employeeId: 'employee-2',
        workDate: '2026-08-22',
        status: 'COMPLETE',
        checkInTime: '00:00:00',
        checkOutTime: '23:59:00',
      },
      {
        id: 'attendance-3',
        employeeId: 'employee-3',
        workDate: '2026-08-22',
        status: 'COMPLETE',
        checkInTime: '09:00:00',
        checkOutTime: '14:00:00',
      },
    ]);

    expect(stats).toStrictEqual({
      totalPresent: 2,
      totalAbsent: 0,
      totalHalfDay: 1,
      totalLoggedMinutes: 2283,
      trackedCoverage: 1,
    });
  });
});
