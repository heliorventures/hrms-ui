import { tenantDateKey } from './tenantTime';

export interface TenantCalendarPeriod {
  month: number;
  year: number;
}

const calendarFormatters = new Map<string, Intl.DateTimeFormat>();

function calendarFormatter(timezone: string): Intl.DateTimeFormat {
  const normalized = timezone.trim();
  if (!normalized) throw new RangeError('Tenant timezone is required.');

  const cached = calendarFormatters.get(normalized);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    timeZone: normalized,
    year: 'numeric',
  });
  calendarFormatters.set(normalized, formatter);
  return formatter;
}

export function normalizeTenantTimezone(value: unknown): string {
  if (typeof value !== 'string') throw new RangeError('Tenant timezone is required.');
  const normalized = value.trim();
  calendarFormatter(normalized);
  return normalized;
}

export function tenantCalendarPeriod(instant: Date, timezone: string): TenantCalendarPeriod {
  const parts = calendarFormatter(timezone).formatToParts(instant);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const year = Number(parts.find((part) => part.type === 'year')?.value);

  if (!Number.isInteger(month) || !Number.isInteger(year)) {
    throw new RangeError('Tenant calendar period could not be determined.');
  }
  return { month, year };
}

export function millisecondsUntilNextMinute(instant: Date): number {
  const elapsed = instant.getUTCSeconds() * 1_000 + instant.getUTCMilliseconds();
  return 60_000 - elapsed + 100;
}

/** Finds the first instant belonging to the tenant's next calendar date. */
export function millisecondsUntilTenantDateChange(instant: Date, timezone: string): number {
  const start = instant.getTime();
  if (!Number.isFinite(start)) throw new RangeError('A valid instant is required.');

  const currentDate = tenantDateKey(instant, timezone);
  let lowerBound = start;
  let upperBound = start + 48 * 60 * 60 * 1_000;
  if (tenantDateKey(new Date(upperBound), timezone) === currentDate) {
    throw new RangeError('The next tenant calendar date could not be determined.');
  }

  while (lowerBound + 1 < upperBound) {
    const midpoint = lowerBound + Math.floor((upperBound - lowerBound) / 2);
    if (tenantDateKey(new Date(midpoint), timezone) === currentDate) {
      lowerBound = midpoint;
    } else {
      upperBound = midpoint;
    }
  }
  return upperBound - start;
}
