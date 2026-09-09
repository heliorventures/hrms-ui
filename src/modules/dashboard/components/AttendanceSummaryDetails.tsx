import { formatBackendTime } from '../../../utils/timeFormat';

import type { AttendanceRow, Summary } from './attendanceSummaryTypes';

function formatCoord(lat?: string | null, lng?: string | null) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
  return `${lat}, ${lng}`;
}

interface AttendanceSegmentsProps {
  startIndex?: number;
  segments: AttendanceRow[];
}

const AttendanceSegments = ({ segments, startIndex = 0 }: AttendanceSegmentsProps) => (
  <ol
    aria-label="Recorded attendance sessions"
    className="ml-1 space-y-3 border-l-2 border-accent/25 pl-4 text-content-secondary"
  >
    {segments.map((segment, index) => {
      const checkInCoords = formatCoord(segment.checkInLat, segment.checkInLng);
      const checkOutCoords = formatCoord(segment.checkOutLat, segment.checkOutLng);
      const checkOutTime = segment.checkOutTime ? formatBackendTime(segment.checkOutTime) : 'open';
      return (
        <li key={segment.id} className="relative text-xs">
          <span
            aria-hidden="true"
            className="absolute -left-[1.4375rem] top-1 h-3 w-3 rounded-full border-2 border-surface bg-accent"
          />
          <div className="flex justify-between">
            <span>Session {index + startIndex + 1}</span>
            <span>
              {formatBackendTime(segment.checkInTime ?? null)} → {checkOutTime}
            </span>
          </div>
          {checkInCoords || checkOutCoords ? (
            <details className="mt-1">
              <summary className="cursor-pointer rounded text-xs text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Location details
              </summary>
              <p className="mt-1 break-words text-xs text-content-secondary">
                In: {checkInCoords ?? '—'} · Out: {checkOutCoords ?? '—'}
              </p>
            </details>
          ) : null}
        </li>
      );
    })}
  </ol>
);

interface AttendanceSummaryDetailsProps {
  summary: Summary;
}

const AttendanceSummaryDetails = ({ summary }: AttendanceSummaryDetailsProps) => (
  <div className="space-y-4 text-sm">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-900 dark:text-white">Worked today (completed)</span>
      <span className="text-2xl font-semibold tabular-nums tracking-tight text-accent">
        {Math.floor(summary.totalWorkedMinutes / 60)}h {summary.totalWorkedMinutes % 60}m
      </span>
    </div>
    {summary.segments.length > 0 ? (
      <AttendanceSegments segments={summary.segments.slice(0, 3)} />
    ) : null}
    {summary.segments.length > 3 ? (
      <details className="rounded-lg bg-surface-selected p-3">
        <summary className="cursor-pointer text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          View {summary.segments.length - 3} more sessions
        </summary>
        <div className="mt-3">
          <AttendanceSegments segments={summary.segments.slice(3)} startIndex={3} />
        </div>
      </details>
    ) : null}
    {summary.segments.length === 0 && !summary.openSegment ? (
      <p
        role="status"
        className="rounded-lg bg-surface-selected px-3 py-3 text-sm text-content-secondary"
      >
        No Attendance Recorded Today.
      </p>
    ) : null}
    {summary.openSegment ? (
      <p className="text-xs text-amber-800 dark:text-amber-200">
        Open: checked in at {formatBackendTime(summary.openSegment.checkInTime)} — Select “Punch
        Out” to close this block.
      </p>
    ) : null}
  </div>
);

export default AttendanceSummaryDetails;
