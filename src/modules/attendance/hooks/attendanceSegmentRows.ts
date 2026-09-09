import { segmentWorkedMinutes } from '../../../utils/attendanceDuration';
import { isoDateRangeContains } from '../../../utils/calendarRange';
import { formatBackendTime } from '../../../utils/timeFormat';
import type { AttendanceRow, FlatSegmentRow } from '../types';

export function attendanceSegmentRows(
  attendance: AttendanceRow[],
  monthBounds: { start: string; end: string }
): FlatSegmentRow[] {
  const rows = attendance;
  const out: FlatSegmentRow[] = [];
  for (const r of rows) {
    if (!isoDateRangeContains(r.workDate, monthBounds.start, monthBounds.end)) continue;
    out.push({
      ...r,
      segmentMinutes: segmentWorkedMinutes(r.checkInTime, r.checkOutTime),
    });
  }
  out.sort((a, b) => {
    const d = b.workDate.localeCompare(a.workDate);
    if (d !== 0) return d;
    const ta = formatBackendTime(a.checkInTime ?? null);
    const tb = formatBackendTime(b.checkInTime ?? null);
    return tb.localeCompare(ta);
  });
  return out;
}
