export interface AttendanceDayWindowMetadata {
  workDate: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  boundaryMinutes: number;
}

const localPartsFormatter = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string) {
  const cached = localPartsFormatter.get(timezone);
  if (cached) return cached;
  const value = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  localPartsFormatter.set(timezone, value);
  return value;
}

function partsAt(instant: Date, timezone: string) {
  const parts = formatter(timezone).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

export function boundaryTime(boundaryMinutes: number): string {
  const hours = Math.floor(boundaryMinutes / 60);
  const minutes = boundaryMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function localDateAt(value: string | null | undefined, timezone: string): string | null {
  if (!value) return null;
  const instant = new Date(value);
  if (!Number.isFinite(instant.getTime())) return null;
  const parts = partsAt(instant, timezone);
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(
    parts.day
  ).padStart(2, '0')}`;
}

export function formatAttendanceWindow(window: AttendanceDayWindowMetadata): string {
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: window.timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${format.format(new Date(window.startsAt))} – ${format.format(new Date(window.endsAt))} (${window.timezone})`;
}

interface LocalDateTimeResult {
  instant: number | null;
  ambiguous: boolean;
}

type LocalDateTimeParts = ReturnType<typeof partsAt>;

function validLocalParts(parts: LocalDateTimeParts): boolean {
  return (
    parts.month >= 1 &&
    parts.month <= 12 &&
    parts.day >= 1 &&
    parts.day <= 31 &&
    parts.hour <= 23 &&
    parts.minute <= 59 &&
    parts.second <= 59
  );
}

function parseLocalDateTime(date: string, time: string): LocalDateTimeParts | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  if (!dateMatch || !timeMatch) return null;
  const parts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: Number(timeMatch[3] || 0),
  };
  return validLocalParts(parts) ? parts : null;
}

function partsKey(parts: LocalDateTimeParts): string {
  return [parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second].join(':');
}

function matchingInstants(wanted: LocalDateTimeParts, timezone: string): number[] {
  const localAsUtc = Date.UTC(
    wanted.year,
    wanted.month - 1,
    wanted.day,
    wanted.hour,
    wanted.minute,
    wanted.second
  );
  const wantedKey = partsKey(wanted);
  return Array.from({ length: 113 }, (_, index) => {
    const offsetMinutes = -14 * 60 + index * 15;
    return localAsUtc - offsetMinutes * 60_000;
  }).filter((candidate) => partsKey(partsAt(new Date(candidate), timezone)) === wantedKey);
}

export function tenantLocalDateTimeToInstant(
  date: string,
  time: string,
  timezone: string
): LocalDateTimeResult {
  const wanted = parseLocalDateTime(date, time);
  if (!wanted) return { instant: null, ambiguous: false };
  const candidates = matchingInstants(wanted, timezone);
  return {
    instant: candidates.length === 1 ? candidates[0] : null,
    ambiguous: candidates.length > 1,
  };
}
