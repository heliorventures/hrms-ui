import { formatBackendTime } from './timeFormat';

/** Parse backend time string to minutes since midnight; unsupported values return NaN. */
export function naiveTimeToMinutes(value: string | null | undefined): number {
  if (value == null || value === '') return NaN;
  const v = formatBackendTime(value);
  const m = v.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return NaN;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + parseInt(m[3], 10) / 60;
}

export function segmentWorkedMinutes(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined
): number | null {
  const a = naiveTimeToMinutes(checkIn);
  const b = naiveTimeToMinutes(checkOut);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  if (a === b) return null;
  const diff = b > a ? b - a : b + 24 * 60 - a;
  return diff > 0 ? diff : null;
}

export interface AttendanceSegmentDurationInput {
  checkInAt?: unknown;
  checkOutAt?: unknown;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

/**
 * Returns undefined only for legacy rows where both canonical timestamps are absent.
 * A partial or malformed canonical pair is intentionally incomplete and must not fall
 * back to wall-clock values, which can be ambiguous around overnight and DST boundaries.
 */
export function canonicalSegmentMinutes({
  checkInAt,
  checkOutAt,
}: Pick<AttendanceSegmentDurationInput, 'checkInAt' | 'checkOutAt'>): number | null | undefined {
  const checkInAbsent = checkInAt === null || checkInAt === undefined;
  const checkOutAbsent = checkOutAt === null || checkOutAt === undefined;
  if (checkInAbsent && checkOutAbsent) return undefined;
  if (typeof checkInAt !== 'string' || typeof checkOutAt !== 'string') return null;

  const checkInMillis = Date.parse(checkInAt);
  const checkOutMillis = Date.parse(checkOutAt);
  if (!Number.isFinite(checkInMillis) || !Number.isFinite(checkOutMillis)) return null;

  const durationMinutes = (checkOutMillis - checkInMillis) / 60_000;
  return durationMinutes > 0 ? durationMinutes : null;
}

export function attendanceSegmentMinutes(input: AttendanceSegmentDurationInput): number | null {
  const canonicalMinutes = canonicalSegmentMinutes(input);
  return canonicalMinutes === undefined
    ? segmentWorkedMinutes(input.checkInTime, input.checkOutTime)
    : canonicalMinutes;
}

export function formatMinutesAsHhMm(totalMinutes: number): string {
  const roundedMinutes = Math.round(totalMinutes);
  const h = Math.floor(roundedMinutes / 60);
  const m = roundedMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function formatLatLng(lat?: string | null, lng?: string | null): string {
  if ((lat == null || lat === '') && (lng == null || lng === '')) return '-';
  const la = lat?.trim() || '-';
  const ln = lng?.trim() || '-';
  return `${la}, ${ln}`;
}
