import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AttendanceAdjustmentPolicyDocument, MyAttendanceBoardDocument } from '../../api/graphql/graphql';
import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageNotice from '../../components/common/PageNotice';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { formatMinutesAsHhMm, segmentWorkedMinutes } from '../../utils/attendanceDuration';
import { attendancePolicyMessage } from '../../utils/attendancePolicyMessage';
import {
  isoDateRangeContains,
  monthBoundsIso,
  parseIsoDate,
  toIsoDate,
} from '../../utils/calendarRange';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { formatBackendTime } from '../../utils/timeFormat';

import AttendanceSegmentsTable from './components/AttendanceSegmentsTable';
import ManualAttendanceModal from './components/ManualAttendanceModal';
import AttendanceCursorPager from './components/AttendanceCursorPager';
import type { AttendanceBoardData, FlatSegmentRow } from './types';
import { mapMyAttendanceBoard } from './types';

const ATTENDANCE_PAGE_SIZE = 50;
type AdjustmentPolicyStatus = 'loading' | 'ready';
type CursorOwnerIdentity = {
  client: ReturnType<typeof useGraphClient>;
  employeeId: string | undefined;
  fromDate: string;
  toDate: string;
};
type BoardRequestIdentity = {
  client: ReturnType<typeof useGraphClient>;
  employeeId: string | undefined;
  queryKey: string;
};
type RefreshIntent = { identity: BoardRequestIdentity; revision: number };

function cursorOwnerIdentityMatches(
  left: CursorOwnerIdentity | null,
  right: CursorOwnerIdentity
): boolean {
  return (
    left !== null &&
    left.client === right.client &&
    left.employeeId === right.employeeId &&
    left.fromDate === right.fromDate &&
    left.toDate === right.toDate
  );
}

function boardRequestIdentityMatches(
  left: BoardRequestIdentity | null,
  right: BoardRequestIdentity
): boolean {
  return (
    left !== null &&
    left.client === right.client &&
    left.employeeId === right.employeeId &&
    left.queryKey === right.queryKey
  );
}

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
  const permissions = createPermissionService(clientSession);
  const canPunchAttendance = permissions.canCapability('action.attendance.punch');
  const canRegularize = permissions.canCapability('action.attendance.regularize');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [cursorStackOwner, setCursorStackOwner] = useState<CursorOwnerIdentity | null>(null);

  const [board, setBoard] = useState<AttendanceBoardData | null>(null);
  const [boardSnapshotIdentity, setBoardSnapshotIdentity] = useState<BoardRequestIdentity | null>(
    null
  );
  const [adjustPolicyDays, setAdjustPolicyDays] = useState<number>(14);
  const [policyStatus, setPolicyStatus] = useState<AdjustmentPolicyStatus>('loading');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshRevision, setRefreshRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustDefaultDate, setAdjustDefaultDate] = useState(toIsoDate(now));
  const [adjustDefaultSegment, setAdjustDefaultSegment] = useState<FlatSegmentRow | null>(null);
  const boardRequestGeneration = useRef(0);
  const committedRequestIdentityRef = useRef<BoardRequestIdentity | null>(null);
  const refreshRevisionRef = useRef(0);
  const refreshIntentRef = useRef<RefreshIntent | null>(null);

  const monthBounds = useMemo(() => monthBoundsIso(year, monthIndex), [year, monthIndex]);
  const employeeId = clientSession?.employeeId;
  const cursorOwnerIdentity = useMemo(
    () => ({ client, employeeId, fromDate: monthBounds.start, toDate: monthBounds.end }),
    [client, employeeId, monthBounds.end, monthBounds.start]
  );
  const cursorStackIsCurrent = cursorOwnerIdentityMatches(cursorStackOwner, cursorOwnerIdentity);
  const effectiveCursorStack = cursorStackIsCurrent ? cursorStack : [];
  const activeCursor = effectiveCursorStack.length
    ? effectiveCursorStack[effectiveCursorStack.length - 1]
    : undefined;
  const queryKey = `${monthBounds.start}:${monthBounds.end}:${activeCursor ?? ''}`;
  const requestIdentity = useMemo(
    () => ({ client, employeeId, queryKey }),
    [client, employeeId, queryKey]
  );
  const policyReady = policyStatus === 'ready';
  const policyMessage = useMemo(
    () => attendancePolicyMessage(adjustPolicyDays, canRegularize),
    [adjustPolicyDays, canRegularize]
  );

  const loadPolicy = useCallback(async () => {
    try {
      const r = await client.request(AttendanceAdjustmentPolicyDocument);
      const raw = r.attendanceAdjustmentPolicy.maxSelfAdjustDays;
      const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? '14'), 10);
      return Number.isFinite(n) ? n : 14;
    } catch {
      return 14;
    }
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setPolicyStatus('loading');
    void loadPolicy().then((days) => {
      if (!cancelled) {
        setAdjustPolicyDays(days);
        setPolicyStatus('ready');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadPolicy]);

  useLayoutEffect(() => {
    if (cursorStackIsCurrent) return;
    setCursorStack((current) => (current.length === 0 ? current : []));
    setCursorStackOwner(cursorOwnerIdentity);
  }, [cursorOwnerIdentity, cursorStackIsCurrent]);

  useLayoutEffect(() => {
    committedRequestIdentityRef.current = requestIdentity;
    if (
      refreshIntentRef.current &&
      !boardRequestIdentityMatches(refreshIntentRef.current.identity, requestIdentity)
    ) {
      refreshIntentRef.current = null;
    }
  }, [requestIdentity]);

  useEffect(() => {
    let cancelled = false;
    const requestGeneration = ++boardRequestGeneration.current;
    const refreshIntent = refreshIntentRef.current;
    const isRefreshForThisRequest =
      refreshIntent?.revision === refreshRevision &&
      boardRequestIdentityMatches(refreshIntent.identity, requestIdentity);
    const requestIsCurrent = () =>
      !cancelled &&
      requestGeneration === boardRequestGeneration.current &&
      boardRequestIdentityMatches(committedRequestIdentityRef.current, requestIdentity);
    setLoading(true);
    setError(null);

    void client
      .request(MyAttendanceBoardDocument, {
        fromDate: monthBounds.start,
        toDate: monthBounds.end,
        first: ATTENDANCE_PAGE_SIZE,
        after: activeCursor,
      })
      .then((response) => {
        if (!requestIsCurrent()) return;
        setBoard(mapMyAttendanceBoard(response, employeeId));
        setBoardSnapshotIdentity(requestIdentity);
        if (
          isRefreshForThisRequest &&
          refreshIntentRef.current?.revision === refreshIntent.revision &&
          boardRequestIdentityMatches(refreshIntentRef.current.identity, requestIdentity)
        ) {
          refreshIntentRef.current = null;
          setSuccess('Attendance refreshed.');
        }
      })
      .catch((error) => {
        if (!requestIsCurrent()) return;
        if (
          isRefreshForThisRequest &&
          refreshIntentRef.current?.revision === refreshIntent?.revision &&
          boardRequestIdentityMatches(refreshIntentRef.current.identity, requestIdentity)
        ) {
          refreshIntentRef.current = null;
        }
        setError(graphQlUserMessage(error));
      })
      .finally(() => {
        if (!requestIsCurrent()) return;
        setLoading(false);
        setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    activeCursor,
    client,
    employeeId,
    monthBounds.end,
    monthBounds.start,
    queryKey,
    requestIdentity,
    refreshRevision,
  ]);

  const refreshBoard = useCallback(() => {
    setError(null);
    setSuccess(null);
    setRefreshing(true);
    const nextRevision = refreshRevisionRef.current + 1;
    refreshRevisionRef.current = nextRevision;
    refreshIntentRef.current = { identity: requestIdentity, revision: nextRevision };
    setRefreshRevision(nextRevision);
  }, [requestIdentity]);

  const boardIsCurrent = boardRequestIdentityMatches(boardSnapshotIdentity, requestIdentity);
  const currentBoard = boardIsCurrent ? board : null;
  const filteredSegments = useMemo(() => {
    const rows = currentBoard?.attendance ?? [];
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
  }, [currentBoard?.attendance, monthBounds.start, monthBounds.end]);

  const pageStats = useMemo(() => {
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
  const existingSegmentsComplete =
    boardIsCurrent &&
    currentBoard !== null &&
    effectiveCursorStack.length === 0 &&
    !currentBoard.pageInfo.hasNextPage;

  const changeCursor = useCallback((nextCursor: string | undefined) => {
    setCursorStack((current) => {
      if (!nextCursor) return [];
      if (current[current.length - 1] === nextCursor) return current;
      if (current.length > 1 && current[current.length - 2] === nextCursor) {
        return current.slice(0, -1);
      }
      return [...current, nextCursor];
    });
  }, []);

  const resetCursorStack = useCallback(() => {
    setCursorStack([]);
  }, []);

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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        {canPunchAttendance ? (
          <Button
            variant="primary"
            type="button"
            disabled={!policyReady}
            title={policyReady ? undefined : 'Loading adjustment policy'}
            onClick={() => openAdjust(toIsoDate(new Date()))}
          >
            {policyReady ? 'Add Missed Punches' : 'Loading adjustment policy…'}
          </Button>
        ) : null}
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
              resetCursorStack();
            }}
          >
            Previous
          </Button>
          <select
            aria-label="Month"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={monthIndex}
            onChange={(e) => {
              setMonthIndex(parseInt(e.target.value, 10));
              resetCursorStack();
            }}
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
            onChange={(e) => {
              setYear(parseInt(e.target.value, 10));
              resetCursorStack();
            }}
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
              resetCursorStack();
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
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Avg. Hours / Worked Day on This Page">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {pageStats.avgDisplay}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Current page data only. Completed segments; denominator = days with at least one punch
            or open segment on this page.
          </p>
        </Card>
        <Card title="Worked Days on This Page">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {pageStats.workedDays}
          </p>
        </Card>
        <Card title="Total Time on This Page">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {pageStats.totalDisplay}
          </p>
        </Card>
      </div>

      <Card title="Self-Service Adjustment Policy">
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {policyReady ? (
            <>
              <p>{policyMessage.employee}</p>
              {policyMessage.regularizer ? <p>{policyMessage.regularizer}</p> : null}
            </>
          ) : (
            <p role="status">Loading adjustment policy…</p>
          )}
        </div>
      </Card>

      {error && (
        <PageNotice
          variant="error"
          title="Attendance could not be refreshed"
          focusOnMount
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() => void refreshBoard()}
            >
              {refreshing ? 'Trying again…' : 'Try again'}
            </Button>
          }
        >
          {error}
        </PageNotice>
      )}
      {success && (
        <PageNotice variant="success" onDismiss={() => setSuccess(null)}>
          {success}
        </PageNotice>
      )}
      <Card title="Shift Templates">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : currentBoard?.shifts.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {currentBoard.shifts.slice(0, shiftLimit).map((shift) => (
              <div
                key={shift.id}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{shift.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatBackendTime(shift.startTime ?? null)} -{' '}
                  {formatBackendTime(shift.endTime ?? null)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Nominal Hours: {shift.workHours ?? '-'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Shifts Configured.</p>
        )}
      </Card>

      <AttendanceSegmentsTable
        adjustPolicyDays={adjustPolicyDays}
        canAdjust={canPunchAttendance && policyReady}
        canRegularize={canRegularize}
        loading={loading}
        rows={filteredSegments}
        title={`Attendance - current page - ${monthBounds.start} to ${monthBounds.end}`}
        selfAdjustAllowedForDate={selfAdjustAllowedForDate}
        onAdjust={(row) => openAdjust(row.workDate, row)}
      />
      <AttendanceCursorPager
        cursorStack={effectiveCursorStack}
        endCursor={currentBoard?.pageInfo.endCursor}
        hasNextPage={currentBoard?.pageInfo.hasNextPage ?? false}
        loading={loading || refreshing}
        onCursorChange={changeCursor}
      />
      {canPunchAttendance && policyReady ? (
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
          existingSegments={currentBoard?.attendance ?? []}
          existingSegmentsComplete={existingSegmentsComplete}
          existingSegmentsCoverage={{ fromDate: monthBounds.start, toDate: monthBounds.end }}
          selfServiceDays={adjustPolicyDays}
          canRegularize={canRegularize}
          onSaved={() => void refreshBoard()}
        />
      ) : null}
    </div>
  );
};

export default AttendancePage;
