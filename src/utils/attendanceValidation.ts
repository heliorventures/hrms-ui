import { naiveTimeToMinutes } from './attendanceDuration';
import { toIsoDate } from './calendarRange';

export const MAX_ATTENDANCE_MINUTES_PER_DAY = 24 * 60;

export interface AttendanceSegmentInterval {
  id?: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  source?: string | null;
}

export interface ExistingSegmentsCoverage {
  fromDate: string;
  toDate: string;
}

export interface ManualAttendanceValidationInput {
  workDate: string;
  checkIn: string;
  checkOut: string;
  existingSegments: AttendanceSegmentInterval[];
  /** False when cursor paging means this is not the complete day/month list. */
  existingSegmentsComplete?: boolean;
  /** Omit only when existingSegments is complete for every date the caller can submit. */
  existingSegmentsCoverage?: ExistingSegmentsCoverage;
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

function existingTimeToMinutes(value: string | null | undefined, source: string | null | undefined) {
  const minutes = naiveTimeToMinutes(value);
  return source?.trim().toUpperCase() === 'WEB+MANUAL' ? Math.floor(minutes) : minutes;
}

export function validateManualAttendanceSegment({
  workDate,
  checkIn,
  checkOut,
  existingSegments,
  existingSegmentsComplete = true,
  existingSegmentsCoverage,
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
  const isWithinLoadedCoverage =
    existingSegmentsCoverage === undefined ||
    (workDate >= existingSegmentsCoverage.fromDate && workDate <= existingSegmentsCoverage.toDate);
  if (!existingSegmentsComplete || !isWithinLoadedCoverage) return null;

  const sameDaySegments = existingSegments.filter(
    (segment) => segment.workDate === workDate && segment.id !== excludedSegmentId
  );
  let existingMinutes = 0;

  for (const segment of sameDaySegments) {
    const existingStart = existingTimeToMinutes(segment.checkInTime, segment.source);
    const existingEnd = existingTimeToMinutes(segment.checkOutTime, segment.source);
    const hasValidInterval = !Number.isNaN(existingStart) && !Number.isNaN(existingEnd);
    const worked =
      hasValidInterval && existingStart !== existingEnd
        ? existingEnd > existingStart
          ? existingEnd - existingStart
          : existingEnd + MAX_ATTENDANCE_MINUTES_PER_DAY - existingStart
        : 0;
    existingMinutes += worked;

    const existingInterval =
      hasValidInterval
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

  if (existingMinutes + newMinutes >= MAX_ATTENDANCE_MINUTES_PER_DAY) {
    return { field: 'form', message: 'Total attendance for a day must be less than 24 hours.' };
  }

  return null;
}
