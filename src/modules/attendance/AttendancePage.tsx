import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { createPermissionService } from '../../auth/permissionService';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  AttendanceAdjustmentPolicyDocument,
  AttendanceBoardDocument,
} from '../../api/graphql/graphql';
import { formatBackendTime } from '../../utils/timeFormat';
import {
  formatMinutesAsHhMm,
  segmentWorkedMinutes,
} from '../../utils/attendanceDuration';
import { isoDateRangeContains, monthBoundsIso, parseIsoDate, toIsoDate } from '../../utils/calendarRange';
import AttendanceSegmentsTable from './components/AttendanceSegmentsTable';
import ManualAttendanceModal from './components/ManualAttendanceModal';
import type { AttendanceBoardData, FlatSegmentRow } from './types';

function calendarDaysBetweenWorkAndToday(workIso: string): number {
  const a = parseIsoDate(workIso);
  a.setHours(0, 0, 0, 0);
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

const AttendancePage = () => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const canRegularize = createPermissionService(clientSession).canCapability(
    'action.attendance.regularize'
  );

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const [board, setBoard] = useState<AttendanceBoardData | null>(null);
  const [adjustPolicyDays, setAdjustPolicyDays] = useState<number>(14);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustDefaultDate, setAdjustDefaultDate] = useState(toIsoDate(now));
  const [adjustDefaultSegment, setAdjustDefaultSegment] = useState<FlatSegmentRow | null>(null);

  const monthBounds = useMemo(() => monthBoundsIso(year, monthIndex), [year, monthIndex]);

  const loadBoard = useCallback(async () => {
    return client.request<AttendanceBoardData>(AttendanceBoardDocument, { limit: 800 });
  }, [client]);

  const loadPolicy = useCallback(async () => {
    try {
      const r = await client.request(AttendanceAdjustmentPolicyDocument);
      const raw = r.attendanceAdjustmentPolicy?.maxSelfAdjustDays;
      const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? '14'), 10);
      setAdjustPolicyDays(Number.isFinite(n) ? n : 14);
    } catch {
      setAdjustPolicyDays(14);
    }
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [b] = await Promise.all([loadBoard(), loadPolicy()]);
        if (!cancelled) setBoard(b);
      } catch (e) {
        if (!cancelled) {
          setError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard, loadPolicy]);

  const refreshBoard = useCallback(async () => {
    try {
      setRefreshing(true);
      setSuccess(null);
      const b = await loadBoard();
      setBoard(b);
      setSuccess('Attendance refreshed.');
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, [loadBoard]);

  const filteredSegments = useMemo(() => {
    const rows = board?.attendance ?? [];
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
  }, [board?.attendance, monthBounds.start, monthBounds.end]);

  const monthlyStats = useMemo(() => {
    let completedMinutes = 0;
    const workedDays = new Set<string>();
    for (const r of filteredSegments) {
      if (r.segmentMinutes != null && r.segmentMinutes > 0) {
        completedMinutes += r.segmentMinutes;
        workedDays.add(r.workDate);
      } else if (r.checkInTime && !r.checkOutTime) {
        workedDays.add(r.workDate);
      }
    }
    const denom = workedDays.size || 0;
    const avgMinutes = denom > 0 ? completedMinutes / denom : 0;
    return {
      workedDays: denom,
      completedMinutes,
      avgMinutes,
      totalDisplay: formatMinutesAsHhMm(completedMinutes),
      avgDisplay: denom > 0 ? formatMinutesAsHhMm(avgMinutes) : '-',
    };
  }, [filteredSegments]);

  const shiftLimit = 12;

  const openAdjust = (iso: string, segment: FlatSegmentRow | null = null) => {
    setAdjustDefaultDate(iso);
    setAdjustDefaultSegment(segment);
    setAdjustOpen(true);
  };

  const selfAdjustAllowedForDate = (workIso: string) => {
    const delta = calendarDaysBetweenWorkAndToday(workIso);
    if (delta < 0) return false;
    return delta <= adjustPolicyDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Punch history, locations, and corrections for your employee record.{' '}
            <Link to="/dashboard" className="text-primary-600 underline dark:text-primary-400">
              Punch in/out from the dashboard.
            </Link>{' '}
            Weekly hour logging lives under{' '}
            <Link to="/timesheet" className="text-primary-600 underline dark:text-primary-400">
              Timesheet
            </Link>
            .
          </p>
        </div>
        <Button variant="primary" type="button" onClick={() => openAdjust(toIsoDate(new Date()))}>
          Add Missed Punches
        </Button>
      </div>

      <Card title="Month">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              if (monthIndex === 0) {
                setYear((y) => y - 1);
                setMonthIndex(11);
              } else setMonthIndex((m) => m - 1);
            }}
          >
            Previous
          </Button>
          <select
            aria-label="Month"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={monthIndex}
            onChange={(e) => setMonthIndex(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 12 }, (_, m) => (
              <option key={m} value={m}>
                {new Date(year, m, 1).toLocaleString('en-IN', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              if (monthIndex === 11) {
                setYear((y) => y + 1);
                setMonthIndex(0);
              } else setMonthIndex((m) => m + 1);
            }}
          >
            Next
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={refreshing}
            onClick={() => void refreshBoard()}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Avg. Hours / Worked Day">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {monthlyStats.avgDisplay}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Completed segments only; denominator = days with at least one punch or open segment.
          </p>
        </Card>
        <Card title="Worked Days This Month">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {monthlyStats.workedDays}
          </p>
        </Card>
        <Card title="Total Time (Completed Segments)">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {monthlyStats.totalDisplay}
          </p>
        </Card>
      </div>

      <Card title="Self-Service Adjustment Policy">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You can normally add missed punch segments for dates within the last{' '}
          <span className="font-medium">{adjustPolicyDays}</span> calendar days. Beyond that window,
          the API rejects self-service updates unless an administrator uses attendance regularization
          {canRegularize ? ' (your account has regularization access).' : '.'}
        </p>
      </Card>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      {success && (
        <Card>
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </Card>
      )}

      <Card title="Shift Templates">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : board?.shifts?.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {board.shifts.slice(0, shiftLimit).map((shift) => (
              <div
                key={shift.id}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{shift.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatBackendTime(shift.startTime ?? null)} -{' '}
                  {formatBackendTime(shift.endTime ?? null)}
                </p>
                <p className="mt-1 text-xs text-gray-500">Nominal Hours: {shift.workHours ?? '-'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Shifts Configured.</p>
        )}
      </Card>

      <AttendanceSegmentsTable
        adjustPolicyDays={adjustPolicyDays}
        canRegularize={canRegularize}
        loading={loading}
        rows={filteredSegments}
        title={`Attendance - ${monthBounds.start} to ${monthBounds.end}`}
        selfAdjustAllowedForDate={selfAdjustAllowedForDate}
        onAdjust={(row) => openAdjust(row.workDate, row)}
      />
      <ManualAttendanceModal
        isOpen={adjustOpen}
        onClose={() => {
          setAdjustOpen(false);
          setAdjustDefaultSegment(null);
        }}
        defaultWorkDate={adjustDefaultDate}
        editingSegmentId={adjustDefaultSegment?.id}
        defaultCheckIn={adjustDefaultSegment?.checkInTime}
        defaultCheckOut={adjustDefaultSegment?.checkOutTime}
        existingSegments={board?.attendance ?? []}
        onSaved={() => void refreshBoard()}
      />
    </div>
  );
};

export default AttendancePage;
