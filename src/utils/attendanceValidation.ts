import { naiveTimeToMinutes, segmentWorkedMinutes } from './attendanceDuration';
import { toIsoDate } from './calendarRange';

export const MAX_ATTENDANCE_MINUTES_PER_DAY = 24 * 60;

export interface AttendanceSegmentInterval {
  id?: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

interface ManualAttendanceValidationInput {
  workDate: string;
  checkIn: string;
  checkOut: string;
  existingSegments: AttendanceSegmentInterval[];
  excludedSegmentId?: string | null;
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function intervalsOverlap(firstStart: number, firstEnd: number, secondStart: number, secondEnd: number) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

export function validateManualAttendanceSegment({
  workDate,
  checkIn,
  checkOut,
  existingSegments,
  excludedSegmentId,
}: ManualAttendanceValidationInput): string | null {
  if (!workDate || !checkIn || !checkOut) return 'Enter work date, punch in, and punch out.';
  if (workDate > toIsoDate(new Date())) return 'Future attendance cannot be regularized.';

  const start = naiveTimeToMinutes(normalizeTime(checkIn));
  const end = naiveTimeToMinutes(normalizeTime(checkOut));
  if (Number.isNaN(start) || Number.isNaN(end)) return 'Enter valid punch times.';
  if (end <= start) return 'Punch out must be later than punch in.';

  const newMinutes = end - start;
  const sameDaySegments = existingSegments.filter(
    (segment) => segment.workDate === workDate && segment.id !== excludedSegmentId
  );
  let existingMinutes = 0;

  for (const segment of sameDaySegments) {
    const existingStart = naiveTimeToMinutes(segment.checkInTime);
    const existingEnd = naiveTimeToMinutes(segment.checkOutTime);
    const worked = segmentWorkedMinutes(segment.checkInTime, segment.checkOutTime) ?? 0;
    existingMinutes += worked;

    if (
      !Number.isNaN(existingStart) &&
      !Number.isNaN(existingEnd) &&
      intervalsOverlap(start, end, existingStart, existingEnd)
    ) {
      return 'This punch range overlaps an existing attendance segment for the day.';
    }
  }

  if (existingMinutes + newMinutes > MAX_ATTENDANCE_MINUTES_PER_DAY) {
    return 'Total attendance for a day cannot exceed 24 hours.';
  }

  return null;
}
