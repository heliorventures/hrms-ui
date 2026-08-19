import { naiveTimeToMinutes, segmentWorkedMinutes } from './attendanceDuration';
import { toIsoDate } from './calendarRange';

export const MAX_ATTENDANCE_MINUTES_PER_DAY = 24 * 60;

export interface AttendanceSegmentInterval {
  id?: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

export interface ManualAttendanceValidationInput {
  workDate: string;
  checkIn: string;
  checkOut: string;
  existingSegments: AttendanceSegmentInterval[];
  excludedSegmentId?: string | null;
}

export type ManualAttendanceField = 'workDate' | 'checkIn' | 'checkOut' | 'form';

export interface ManualAttendanceValidationError {
  field: ManualAttendanceField;
  message: string;
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function intervalsOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number
) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

export function validateManualAttendanceSegment({
  workDate,
  checkIn,
  checkOut,
  existingSegments,
  excludedSegmentId,
}: ManualAttendanceValidationInput): ManualAttendanceValidationError | null {
  const requiredMessage = 'Enter work date, punch in, and punch out.';
  if (!workDate) return { field: 'workDate', message: requiredMessage };
  if (workDate > toIsoDate(new Date())) {
    return { field: 'workDate', message: 'Future attendance cannot be regularized.' };
  }
  if (!checkIn) return { field: 'checkIn', message: requiredMessage };
  if (!checkOut) return { field: 'checkOut', message: requiredMessage };

  const start = naiveTimeToMinutes(normalizeTime(checkIn));
  const end = naiveTimeToMinutes(normalizeTime(checkOut));
  if (Number.isNaN(start)) return { field: 'checkIn', message: 'Enter valid punch times.' };
  if (Number.isNaN(end)) return { field: 'checkOut', message: 'Enter valid punch times.' };
  if (start >= end) {
    return {
      field: 'checkOut',
      message: 'Punch In must be before Punch Out for the same calendar day.',
    };
  }

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

    const existingInterval =
      !Number.isNaN(existingStart) && !Number.isNaN(existingEnd)
        ? { start: existingStart, end: existingEnd }
        : null;

    if (
      existingInterval &&
      intervalsOverlap(start, end, existingInterval.start, existingInterval.end)
    ) {
      return {
        field: 'form',
        message: 'This punch range overlaps an existing attendance segment for the day.',
      };
    }
  }

  if (existingMinutes + newMinutes > MAX_ATTENDANCE_MINUTES_PER_DAY) {
    return { field: 'form', message: 'Total attendance for a day cannot exceed 24 hours.' };
  }

  return null;
}
