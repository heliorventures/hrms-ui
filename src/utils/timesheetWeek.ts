/** Monday-start ISO week window `YYYY-MM-DD` (local calendar). */
export function timesheetWeekRangeIso(reference: Date): { start: string; end: string } {
  const local = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const dow = local.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  local.setDate(local.getDate() + mondayOffset);
  const start = toIsoDate(local);
  const endDate = new Date(local.getFullYear(), local.getMonth(), local.getDate() + 6);
  const end = toIsoDate(endDate);
  return { start, end };
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function clampIsoDateToRange(iso: string, min: string, max: string): string {
  if (iso < min) return min;
  if (iso > max) return max;
  return iso;
}
