import type { AttendanceDayWindowMetadata } from './attendanceDay';
import { tenantLocalDateTimeToInstant } from './attendanceDay';
import { naiveTimeToMinutes } from './attendanceDuration';

export const MAX_ATTENDANCE_MINUTES_PER_DAY = 24 * 60;

export interface AttendanceSegmentInterval {
  id?: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  source?: string | null;
}

export interface ExistingSegmentsCoverage {
  fromDate: string;
  toDate: string;
}

export interface ManualAttendanceValidationInput {
  workDate: string;
  checkInDate: string;
  checkOutDate: string;
  checkIn: string;
  checkOut: string;
  currentWorkDate: string;
  window: AttendanceDayWindowMetadata;
  existingSegments: AttendanceSegmentInterval[];
  /** False when cursor paging means this is not the complete day/month list. */
  existingSegmentsComplete?: boolean;
  /** Omit only when existingSegments is complete for every date the caller can submit. */
  existingSegmentsCoverage?: ExistingSegmentsCoverage;
  excludedSegmentId?: string | null;
}

export type ManualAttendanceField =
  | 'workDate'
  | 'checkInDate'
  | 'checkOutDate'
  | 'checkIn'
  | 'checkOut'
  | 'form';

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

function existingTimeToMinutes(
  value: string | null | undefined,
  source: string | null | undefined
) {
  const minutes = naiveTimeToMinutes(value);
  return source?.trim().toUpperCase() === 'WEB+MANUAL' ? Math.floor(minutes) : minutes;
}

interface ValidatedInterval {
  end: number;
  start: number;
  wallEnd: number;
  wallStart: number;
}

interface IntervalResult {
  error: ManualAttendanceValidationError | null;
  interval: ValidatedInterval | null;
}

function requiredInputError(
  input: ManualAttendanceValidationInput
): ManualAttendanceValidationError | null {
  const requiredMessage = 'Enter work date, punch in, and punch out.';
  if (!input.workDate) return { field: 'workDate', message: requiredMessage };
  if (input.workDate > input.currentWorkDate) {
    return { field: 'workDate', message: 'Future attendance cannot be regularized.' };
  }
  if (!input.checkIn) return { field: 'checkIn', message: requiredMessage };
  if (!input.checkOut) return { field: 'checkOut', message: requiredMessage };
  if (!input.checkInDate) {
    return { field: 'checkInDate', message: 'Enter the actual punch in and punch out dates.' };
  }
  if (!input.checkOutDate) {
    return { field: 'checkOutDate', message: 'Enter the actual punch in and punch out dates.' };
  }
  return input.window.workDate === input.workDate
    ? null
    : { field: 'form', message: 'Reload the attendance day window before saving.' };
}

function canonicalRangeError(
  start: number,
  end: number,
  window: AttendanceDayWindowMetadata
): ManualAttendanceValidationError | null {
  const windowStart = Date.parse(window.startsAt);
  const windowEnd = Date.parse(window.endsAt);
  if (start < windowStart || start >= windowEnd) {
    return { field: 'checkInDate', message: 'Punch In must be inside the attendance day window.' };
  }
  if (end <= windowStart || end > windowEnd) {
    return {
      field: 'checkOutDate',
      message: 'Punch Out must be inside the attendance day window.',
    };
  }
  return start < end ? null : { field: 'checkOut', message: 'Punch In must be before Punch Out.' };
}

function requestedInterval(input: ManualAttendanceValidationInput): IntervalResult {
  const wallStart = naiveTimeToMinutes(normalizeTime(input.checkIn));
  const wallEnd = naiveTimeToMinutes(normalizeTime(input.checkOut));
  if (Number.isNaN(wallStart)) {
    return { error: { field: 'checkIn', message: 'Enter valid punch times.' }, interval: null };
  }
  if (Number.isNaN(wallEnd)) {
    return { error: { field: 'checkOut', message: 'Enter valid punch times.' }, interval: null };
  }
  const start = tenantLocalDateTimeToInstant(
    input.checkInDate,
    normalizeTime(input.checkIn),
    input.window.timezone
  );
  const end = tenantLocalDateTimeToInstant(
    input.checkOutDate,
    normalizeTime(input.checkOut),
    input.window.timezone
  );
  if (start.ambiguous || end.ambiguous) {
    return {
      error: {
        field: 'form',
        message:
          'These local times are ambiguous in the attendance timezone. Choose unambiguous times.',
      },
      interval: null,
    };
  }
  if (start.instant === null) {
    return {
      error: { field: 'checkIn', message: 'Enter a valid punch date and time.' },
      interval: null,
    };
  }
  if (end.instant === null) {
    return {
      error: { field: 'checkOut', message: 'Enter a valid punch date and time.' },
      interval: null,
    };
  }
  const error = canonicalRangeError(start.instant, end.instant, input.window);
  return {
    error,
    interval: error ? null : { start: start.instant, end: end.instant, wallStart, wallEnd },
  };
}

interface ExistingSegmentResult {
  error: ManualAttendanceValidationError | null;
  minutes: number;
}

const overlapError = (): ManualAttendanceValidationError => ({
  field: 'form',
  message: 'This punch range overlaps an existing attendance segment for the day.',
});

const durationCapError = (): ManualAttendanceValidationError => ({
  field: 'form',
  message: 'Total attendance for a day must be less than 24 hours.',
});

function canonicalExistingSegment(
  segment: AttendanceSegmentInterval,
  requested: ValidatedInterval
): ExistingSegmentResult | null {
  const start = segment.checkInAt ? Date.parse(segment.checkInAt) : NaN;
  const end = segment.checkOutAt ? Date.parse(segment.checkOutAt) : NaN;
  if (Number.isFinite(start) && !segment.checkOutAt) {
    return {
      error: {
        field: 'form',
        message: 'Complete or correct the existing incomplete segment before adding another.',
      },
      minutes: 0,
    };
  }
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return {
    error: intervalsOverlap(requested.start, requested.end, start, end) ? overlapError() : null,
    minutes: (end - start) / 60_000,
  };
}

function legacyExistingSegment(
  segment: AttendanceSegmentInterval,
  input: ManualAttendanceValidationInput,
  requested: ValidatedInterval
): ExistingSegmentResult {
  const start = existingTimeToMinutes(segment.checkInTime, segment.source);
  const end = existingTimeToMinutes(segment.checkOutTime, segment.source);
  const valid = !Number.isNaN(start) && !Number.isNaN(end);
  let minutes = 0;
  if (valid && start !== end) {
    minutes = end > start ? end - start : end + MAX_ATTENDANCE_MINUTES_PER_DAY - start;
  }
  const comparableDates =
    input.checkInDate === input.workDate && input.checkOutDate === input.workDate;
  const overlaps =
    valid &&
    comparableDates &&
    intervalsOverlap(requested.wallStart, requested.wallEnd, start, end);
  return { error: overlaps ? overlapError() : null, minutes };
}

function validateExistingSegments(
  input: ManualAttendanceValidationInput,
  requested: ValidatedInterval
): ManualAttendanceValidationError | null {
  const sameDaySegments = input.existingSegments.filter(
    (segment) => segment.workDate === input.workDate && segment.id !== input.excludedSegmentId
  );
  let existingMinutes = 0;
  for (const segment of sameDaySegments) {
    const result =
      canonicalExistingSegment(segment, requested) ??
      legacyExistingSegment(segment, input, requested);
    if (result.error) return result.error;
    existingMinutes += result.minutes;
  }
  const requestedMinutes = (requested.end - requested.start) / 60_000;
  return existingMinutes + requestedMinutes < MAX_ATTENDANCE_MINUTES_PER_DAY
    ? null
    : durationCapError();
}

export function validateManualAttendanceSegment(
  input: ManualAttendanceValidationInput
): ManualAttendanceValidationError | null {
  const requiredError = requiredInputError(input);
  if (requiredError) return requiredError;
  const { error, interval } = requestedInterval(input);
  if (error || !interval) return error;
  const requestedMinutes = (interval.end - interval.start) / 60_000;
  if (requestedMinutes >= MAX_ATTENDANCE_MINUTES_PER_DAY) return durationCapError();
  const isWithinLoadedCoverage =
    input.existingSegmentsCoverage === undefined ||
    (input.workDate >= input.existingSegmentsCoverage.fromDate &&
      input.workDate <= input.existingSegmentsCoverage.toDate);
  if (input.existingSegmentsComplete === false || !isWithinLoadedCoverage) return null;
  return validateExistingSegments(input, interval);
}
