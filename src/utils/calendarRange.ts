/** First and last calendar day of month as ISO `YYYY-MM-DD` (local). */
export function monthBoundsIso(year: number, monthIndex0: number): { start: string; end: string } {
  const start = new Date(year, monthIndex0, 1);
  const end = new Date(year, monthIndex0 + 1, 0);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

/** Inclusive range length in days when both args are ISO dates. */
export function isoDateRangeContains(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end;
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDaysIso(iso: string, deltaDays: number): string {
  const dt = parseIsoDate(iso);
  dt.setDate(dt.getDate() + deltaDays);
  return toIsoDate(dt);
}
