const DEFAULT_DATE_LOCALE = 'en-IN';
const EMPTY_DATE_DISPLAY = '—';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isDateOnlyValue(value: string): boolean {
  return DATE_ONLY_PATTERN.test(value);
}

function parseCalendarDate(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function parseInstant(value: string | Date | null | undefined): Date | null {
  if (!value || (typeof value === 'string' && isDateOnlyValue(value))) {
    return null;
  }

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCalendarDate(
  value: string | null | undefined,
  locale = DEFAULT_DATE_LOCALE
): string {
  if (!value) {
    return EMPTY_DATE_DISPLAY;
  }

  const date = parseCalendarDate(value);
  if (!date) {
    return EMPTY_DATE_DISPLAY;
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatInstant(
  value: string | Date | null | undefined,
  locale = DEFAULT_DATE_LOCALE
): string {
  const date = parseInstant(value);
  if (!date) {
    return EMPTY_DATE_DISPLAY;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export const formatDisplayDate = (value: string | Date, locale = DEFAULT_DATE_LOCALE) => {
  if (typeof value === 'string' && isDateOnlyValue(value)) {
    return formatCalendarDate(value, locale);
  }

  const date = parseInstant(value);
  return date
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
    : EMPTY_DATE_DISPLAY;
};

export const formatDisplayDateTime = (value: string | Date, locale = DEFAULT_DATE_LOCALE) =>
  formatInstant(value, locale);
