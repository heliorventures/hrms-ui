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

export function tenantCalendarPeriod(
  instant: Date,
  timezone: string
): TenantCalendarPeriod {
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
