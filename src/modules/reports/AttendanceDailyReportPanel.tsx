import { useEffect, useRef, useState } from 'react';

import {
  AdminAttendanceDailyReportDocument,
  AdminAttendanceExportPageDocument,
  AdminAttendanceReportSummaryDocument,
  type AdminAttendanceDailyReportQuery,
  type AdminAttendanceExportPageQuery,
  type AdminAttendanceReportSummaryQuery,
} from '../../api/graphql/graphql';
import { PERMISSIONS } from '../../auth/permissions';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { formatMinutesAsHhMm } from '../../utils/attendanceDuration';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { formatTenantTime } from '../../utils/tenantTime';
import AttendanceReportDetails, {
  type AttendanceDailyRow,
} from '../admin/components/AttendanceReportDetails';

const PREVIEW_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 100;

const escapeCsv = (value: unknown) => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text.trimStart())) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename: string, rows: unknown[][]) => {
  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

// eslint-disable-next-line react-refresh/only-export-components
export function attendanceCsvRows(rows: AttendanceDailyRow[]): unknown[][] {
  return [
    [
      'Employee',
      'Employee Code',
      'Work Date',
      'Timezone',
      'First Punch In',
      'Last Punch Out',
      'Status',
      'Logged Minutes',
      'Expected Minutes',
      'Punch Segments',
    ],
    ...rows.map((row) => [
      row.employeeName,
      row.employeeCode,
      String(row.workDate),
      row.timezone,
      formatTenantTime(
        typeof row.firstCheckInAt === 'string' ? row.firstCheckInAt : null,
        row.timezone
      ),
      formatTenantTime(
        typeof row.lastCheckOutAt === 'string' ? row.lastCheckOutAt : null,
        row.timezone
      ),
      row.status,
      row.loggedMinutes,
      row.expectedMinutes ?? '',
      row.segmentCount,
    ]),
  ];
}

interface AttendanceDailyReportPanelProps {
  fromDate: string;
  toDate: string;
}

interface CursorState {
  ownerKey: string;
  stack: Array<string | null>;
}

// The state machine intentionally keeps preview, export, authorization, and ownership together.
// eslint-disable-next-line max-lines-per-function, max-statements, complexity
const AttendanceDailyReportPanel = ({ fromDate, toDate }: AttendanceDailyReportPanelProps) => {
  const client = useGraphClient('client');
  const { clientSession, tenantId } = useAuth();
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [cursorState, setCursorState] = useState<CursorState>({ ownerKey: '', stack: [null] });
  const [page, setPage] = useState<AdminAttendanceDailyReportQuery['attendanceDailyReport'] | null>(
    null
  );
  const [summary, setSummary] = useState<
    AdminAttendanceReportSummaryQuery['attendanceReportSummary'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const mountedRef = useRef(true);

  const authorizationKey = authorizationStateKey(clientSession);
  const canRead = createPermissionService(clientSession).canScopedPermission(
    PERMISSIONS.attendanceRead,
    ['ALL']
  );
  const normalizedSearch = employeeSearch.trim() || null;
  const dateRangeError = fromDate > toDate ? 'Start date must be on or before end date.' : null;
  const ownerKey = `${tenantId ?? 'no-tenant'}|${authorizationKey}|${fromDate}|${toDate}|${normalizedSearch ?? ''}`;
  const activeStack = cursorState.ownerKey === ownerKey ? cursorState.stack : [null];
  const after = activeStack[activeStack.length - 1] ?? null;
  const currentContextRef = useRef({ client, ownerKey, canRead });
  currentContextRef.current = { client, ownerKey, canRead };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setExporting(false);
  }, [client, ownerKey]);

  useEffect(() => {
    if (!canRead || dateRangeError) {
      setPage(null);
      setSummary(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(null);
    setSummary(null);
    const variables = {
      fromDate,
      toDate,
      employeeId: null,
      employeeSearch: normalizedSearch,
      first: PREVIEW_PAGE_SIZE,
      after,
    };

    void Promise.all([
      client.request(AdminAttendanceDailyReportDocument, variables),
      client.request(AdminAttendanceReportSummaryDocument, variables),
    ]).then(
      ([pageResult, summaryResult]) => {
        if (cancelled) return;
        setPage(pageResult.attendanceDailyReport);
        setSummary(summaryResult.attendanceReportSummary);
        setLoading(false);
      },
      (requestError: unknown) => {
        if (cancelled) return;
        setError(graphQlUserMessage(requestError));
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [
    after,
    canRead,
    client,
    dateRangeError,
    fromDate,
    normalizedSearch,
    ownerKey,
    retryVersion,
    toDate,
  ]);

  // eslint-disable-next-line complexity
  const exportAttendance = async () => {
    const exportOwner = currentContextRef.current;
    if (!exportOwner.canRead || dateRangeError) return;
    setExporting(true);
    setError(null);
    try {
      const rows: AttendanceDailyRow[] = [];
      const seenCursors = new Set<string>();
      let exportAfter: string | null = null;
      do {
        const result: AdminAttendanceExportPageQuery = await exportOwner.client.request(
          AdminAttendanceExportPageDocument,
          {
            fromDate,
            toDate,
            employeeId: null,
            employeeSearch: normalizedSearch,
            first: EXPORT_PAGE_SIZE,
            after: exportAfter,
          }
        );
        const { current } = currentContextRef;
        if (
          !mountedRef.current ||
          current.client !== exportOwner.client ||
          current.ownerKey !== exportOwner.ownerKey ||
          !current.canRead
        ) {
          return;
        }
        rows.push(...result.attendanceDailyReport.edges.map((edge) => edge.node));
        const { pageInfo } = result.attendanceDailyReport;
        if (!pageInfo.hasNextPage) break;
        const { endCursor: next } = pageInfo;
        if (!next || seenCursors.has(next)) {
          throw new Error('Attendance export pagination did not advance. Please retry.');
        }
        seenCursors.add(next);
        exportAfter = next;
      } while (exportAfter);

      downloadCsv(`attendance-report-${fromDate}-to-${toDate}.csv`, attendanceCsvRows(rows));
    } catch (requestError) {
      const { current } = currentContextRef;
      if (
        mountedRef.current &&
        current.client === exportOwner.client &&
        current.ownerKey === exportOwner.ownerKey
      ) {
        setError(graphQlUserMessage(requestError));
      }
    } finally {
      const { current } = currentContextRef;
      if (
        mountedRef.current &&
        current.client === exportOwner.client &&
        current.ownerKey === exportOwner.ownerKey
      ) {
        setExporting(false);
      }
    }
  };

  if (!canRead) {
    return (
      <Card title="Daily Attendance">
        <p className="text-sm text-content-secondary">
          You are not authorized to view company attendance reports.
        </p>
      </Card>
    );
  }

  const summaryItems = summary
    ? [
        ['Present', summary.presentDays],
        ['Absent', summary.absentDays],
        ['Half days', summary.halfDays],
        ['On leave', summary.onLeaveDays],
        ['Incomplete', summary.incompleteDays],
        ['Unscheduled', summary.unscheduledDays],
        ['Total logged', formatMinutesAsHhMm(summary.totalLoggedMinutes)],
      ]
    : [];
  let summaryContent = <p className="text-sm text-content-secondary">Summary unavailable.</p>;
  if (loading && !summary) {
    summaryContent = (
      <p className="text-sm text-content-secondary">Loading attendance summary...</p>
    );
  } else if (summary) {
    summaryContent = (
      <dl
        className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7"
        aria-label="Attendance report summary"
      >
        {summaryItems.map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-line p-3">
            <dt className="text-xs text-content-secondary">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-content-primary">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <section className="space-y-4" aria-label="Daily attendance report">
      <Card title="Daily Attendance">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <Input
            label="Employee search"
            name="attendanceEmployeeSearch"
            value={employeeSearch}
            onChange={(event) => setEmployeeSearch(event.target.value)}
            placeholder="Name or employee code"
            fullWidth
          />
          <Button
            onClick={() => void exportAttendance()}
            disabled={Boolean(dateRangeError) || loading || exporting}
            busy={exporting}
            busyLabel="Preparing complete attendance export"
          >
            {exporting ? 'Preparing CSV...' : 'Download CSV'}
          </Button>
        </div>
        {dateRangeError ? (
          <p className="mt-3 text-sm text-status-danger">{dateRangeError}</p>
        ) : null}
        <p className="mt-3 text-xs text-content-muted">
          Inclusive work dates. Expected and absent days follow tenant attendance policy; punch
          times use each row&apos;s tenant timezone.
        </p>
      </Card>

      {error ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="alert" className="text-sm text-status-danger">
              {error}
            </p>
            <Button variant="secondary" onClick={() => setRetryVersion((value) => value + 1)}>
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      <Card title="Attendance Summary">{summaryContent}</Card>

      <AttendanceReportDetails
        rows={page?.edges.map((edge) => edge.node) ?? []}
        loading={loading}
        canGoBack={activeStack.length > 1}
        canGoForward={page?.pageInfo.hasNextPage ?? false}
        onPrevious={() => setCursorState({ ownerKey, stack: activeStack.slice(0, -1) })}
        onNext={() => {
          const next = page?.pageInfo.endCursor;
          if (next) setCursorState({ ownerKey, stack: [...activeStack, next] });
        }}
      />
    </section>
  );
};

export default AttendanceDailyReportPanel;
