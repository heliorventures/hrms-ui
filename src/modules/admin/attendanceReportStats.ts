import { segmentWorkedMinutes } from '../../utils/attendanceDuration';

export interface AttendanceReportStatsRow {
  id?: string;
  employeeId: string;
  workDate: string;
  status?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

export interface AttendanceReportStats {
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalLoggedMinutes: number;
  trackedCoverage: number;
}

const FULL_DAY_MINUTES = 8 * 60;
const HALF_DAY_MINUTES = 4 * 60;

function normalizedStatus(status: string | null | undefined) {
  return status?.trim().toLowerCase().replace('-', '_') ?? '';
}

export function buildAttendanceReportStats(
  rows: readonly AttendanceReportStatsRow[]
): AttendanceReportStats {
  const employeeDays = new Map<
    string,
    {
      minutes: number;
      tracked: boolean;
      explicitPresent: boolean;
      explicitAbsent: boolean;
      explicitHalfDay: boolean;
    }
  >();

  for (const row of rows) {
    const key = `${row.employeeId}:${row.workDate}`;
    const aggregate =
      employeeDays.get(key) ??
      {
        minutes: 0,
        tracked: false,
        explicitPresent: false,
        explicitAbsent: false,
        explicitHalfDay: false,
      };

    const segmentMinutes = segmentWorkedMinutes(row.checkInTime, row.checkOutTime);
    if (segmentMinutes != null) {
      aggregate.minutes += segmentMinutes;
      aggregate.tracked = true;
    }

    const status = normalizedStatus(row.status);
    aggregate.explicitPresent ||= status === 'present';
    aggregate.explicitAbsent ||= status === 'absent';
    aggregate.explicitHalfDay ||= status === 'half_day';

    employeeDays.set(key, aggregate);
  }

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDay = 0;
  let trackedDays = 0;
  let totalLoggedMinutes = 0;

  for (const aggregate of employeeDays.values()) {
    totalLoggedMinutes += aggregate.minutes;
    if (aggregate.tracked) trackedDays += 1;

    if (aggregate.minutes >= FULL_DAY_MINUTES || aggregate.explicitPresent) {
      totalPresent += 1;
    } else if (aggregate.minutes >= HALF_DAY_MINUTES || aggregate.explicitHalfDay) {
      totalHalfDay += 1;
    } else if (aggregate.explicitAbsent) {
      totalAbsent += 1;
    }
  }

  return {
    totalPresent,
    totalAbsent,
    totalHalfDay,
    totalLoggedMinutes,
    trackedCoverage: employeeDays.size > 0 ? trackedDays / employeeDays.size : 0,
  };
}
