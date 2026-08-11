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
  const diff = b - a;
  return diff > 0 ? diff : null;
}

export function formatMinutesAsHhMm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function formatLatLng(lat?: string | null, lng?: string | null): string {
  if ((lat == null || lat === '') && (lng == null || lng === '')) return '-';
  const la = lat?.trim() || '-';
  const ln = lng?.trim() || '-';
  return `${la}, ${ln}`;
}
