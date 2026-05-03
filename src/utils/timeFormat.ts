/**
 * Format backend time strings for display (no fractional seconds).
 * Accepts time-only (`10:34:56` or `10:34:56.289912`), ISO datetimes, or null/empty.
 */
export function formatBackendTime(value: string | null | undefined): string {
  if (value == null || value === '') return '—';

  const isoMatch = value.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
  );
  if (isoMatch) {
    return isoMatch[2];
  }

  const timeOnly = value.match(/^(\d{2}:\d{2}:\d{2})(\.\d+)?$/);
  if (timeOnly) {
    return timeOnly[1];
  }

  const hm = value.match(/^(\d{2}:\d{2})(\.\d+)?$/);
  if (hm) {
    return `${hm[1]}:00`;
  }

  return value;
}
