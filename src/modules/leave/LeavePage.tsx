import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  canApproveLeaveRequestRow,
  showLeaveApprovalColumn,
} from '../../auth/leaveApprovalUi';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import ApplyLeaveModal from './components/ApplyLeaveModal';
import LeaveRejectModal from './components/LeaveRejectModal';
import LeaveRequestsTableSection from './components/LeaveRequestsTableSection';
import Modal from '../../components/common/Modal';
import {
  AllCompanyHolidaysDocument,
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  LeaveBoardDocument,
  LeaveWorkflowTrailQueryDocument,
  OrgChartDocument,
  type AllCompanyHolidaysQuery,
  type LeaveBoardQuery,
  type LeaveWorkflowTrailQueryQuery,
  type OrgChartQuery,
} from '../../api/graphql/graphql';

const LeavePage = () => {
  const { can, clientSession } = useAuth();
  const client = useGraphClient('client');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [orgChartRows, setOrgChartRows] = useState<OrgChartQuery['orgChart']>([]);
  const [data, setData] = useState<LeaveBoardQuery | null>(null);
  const [orgLabels, setOrgLabels] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | null>(null);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const [trailForId, setTrailForId] = useState<string | null>(null);
  const [trailSummaryRow, setTrailSummaryRow] = useState<LeaveBoardQuery['leaveRequests'][number] | null>(
    null
  );
  const [trailLoading, setTrailLoading] = useState(false);
  const [trailRows, setTrailRows] =
    useState<LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail']>([]);
  const [allHolOpen, setAllHolOpen] = useState(false);
  const [allHolLoading, setAllHolLoading] = useState(false);
  const [allHolRows, setAllHolRows] = useState<AllCompanyHolidaysQuery['upcomingHolidays']>([]);

  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [balanceYear, setBalanceYear] = useState(defaultYear);

  const yearChoices = useMemo(() => {
    const ys: number[] = [];
    for (let y = defaultYear - 2; y <= defaultYear + 1; y++) ys.push(y);
    return ys;
  }, [defaultYear]);

  const loadBoard = useCallback(async () => {
    return client.request<LeaveBoardQuery>(LeaveBoardDocument, {
      limit: 20,
      balanceYear,
    });
  }, [client, balanceYear]);

  const loadOrgChart = useCallback(async () => {
    const r = await client.request<OrgChartQuery>(OrgChartDocument, { limit: 500 });
    const m = new Map<string, string>();
    for (const row of r.orgChart ?? []) {
      m.set(
        row.employeeId,
        `${row.fullName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`
      );
    }
    return { labels: m, rows: r.orgChart ?? [] };
  }, [client]);

  useEffect(() => {
    if (searchParams.get('apply') === '1') {
      setApplyOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('apply');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!loading && location.hash === '#leave-requests') {
      window.requestAnimationFrame(() => {
        document.getElementById('leave-requests-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [loading, location.hash]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [result, orgData] = await Promise.all([loadBoard(), loadOrgChart()]);
        if (!cancelled) {
          setData(result);
          setOrgLabels(orgData.labels);
          setOrgChartRows(orgData.rows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load leave data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard, loadOrgChart]);

  useEffect(() => {
    if (!allHolOpen) return;
    let cancelled = false;
    (async () => {
      try {
        setAllHolLoading(true);
        const y = new Date().getFullYear();
        const r = await client.request<AllCompanyHolidaysQuery>(AllCompanyHolidaysDocument, {
          fromDate: `${y}-01-01`,
          limit: 450,
        });
        if (!cancelled) setAllHolRows(r.upcomingHolidays ?? []);
      } catch {
        if (!cancelled) setAllHolRows([]);
      } finally {
        if (!cancelled) setAllHolLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allHolOpen, client]);

  const refreshBoard = async () => {
    setLoading(true);
    try {
      const [result, orgData] = await Promise.all([loadBoard(), loadOrgChart()]);
      setData(result);
      setOrgLabels(orgData.labels);
      setOrgChartRows(orgData.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const silentRefreshBoard = useCallback(async () => {
    try {
      setError(null);
      setData(await loadBoard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh');
    }
  }, [loadBoard]);

  const handleApprove = async (leaveRequestId: string) => {
    setApproveBusyId(leaveRequestId);
    try {
      await client.request(ApproveLeaveRequestDocument, { leaveRequestId });
      await silentRefreshBoard();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    } finally {
      setApproveBusyId(null);
    }
  };

  const handleCancelOwn = async (leaveRequestId: string) => {
    setCancelBusyId(leaveRequestId);
    try {
      await client.request(CancelLeaveRequestDocument, { leaveRequestId });
      await silentRefreshBoard();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setCancelBusyId(null);
    }
  };

  const leaveTypeNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of data?.leaveTypes ?? []) {
      m.set(t.id, t.name);
    }
    return m;
  }, [data?.leaveTypes]);

  const viewerId = data?.viewerEmployeeId;

  const directReportIds = useMemo(() => {
    if (!viewerId) return new Set<string>();
    const s = new Set<string>();
    for (const row of orgChartRows) {
      if (row.reportingManagerId === viewerId) s.add(row.employeeId);
    }
    return s;
  }, [viewerId, orgChartRows]);

  const managesDirectReports = directReportIds.size > 0;

  const showApprovalColumn = useMemo(
    () =>
      showLeaveApprovalColumn({
        can,
        clientSession,
        managesDirectReports,
      }),
    [can, clientSession, managesDirectReports]
  );

  const canApproveRowForTable = useCallback(
    (row: LeaveBoardQuery['leaveRequests'][number]) =>
      canApproveLeaveRequestRow({
        rowEmployeeId: row.employeeId,
        viewerEmployeeId: viewerId,
        can,
        clientSession,
        directReportIds,
      }),
    [viewerId, can, clientSession, directReportIds]
  );

  const hideEmployeeColumn = useMemo(() => {
    const reqs = data?.leaveRequests ?? [];
    const vid = data?.viewerEmployeeId;
    if (!vid || reqs.length === 0) return false;
    if (showApprovalColumn) return false;
    return reqs.every((r) => r.employeeId === vid);
  }, [data?.leaveRequests, data?.viewerEmployeeId, showApprovalColumn]);

  const employeeLabel = useCallback(
    (employeeId: string) => orgLabels.get(employeeId) ?? `${employeeId.slice(0, 8)}…`,
    [orgLabels]
  );

  const openWorkflowTrail = async (row: LeaveBoardQuery['leaveRequests'][number]) => {
    setTrailSummaryRow(row);
    setTrailForId(row.id);
    setTrailLoading(true);
    setTrailRows([]);
    setError(null);
    try {
      const r = await client.request<LeaveWorkflowTrailQueryQuery>(LeaveWorkflowTrailQueryDocument, {
        leaveRequestId: row.id,
      });
      setTrailRows(r.leaveRequestWorkflowTrail);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workflow history');
      setTrailForId(null);
      setTrailSummaryRow(null);
    } finally {
      setTrailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live data from the leave subgraph through the gateway. When a workflow is configured,
            only the <strong>reporting manager</strong> can act at the first step;{' '}
            <strong>HR</strong> (role on the next step) completes approval — the API enforces this.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => void refreshBoard()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button variant="primary" type="button" onClick={() => setApplyOpen(true)} disabled={loading}>
            Apply for leave
          </Button>
        </div>
      </div>

      <ApplyLeaveModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        leaveTypes={data?.leaveTypes ?? []}
        leavePolicies={data?.leavePolicies ?? []}
        upcomingHolidays={data?.upcomingHolidays ?? []}
        leaveBalances={data?.leaveBalances ?? []}
        onSubmitted={async () => {
          await refreshBoard();
        }}
      />

      <LeaveRejectModal
        isOpen={rejectLeaveId != null}
        leaveRequestId={rejectLeaveId}
        onClose={() => setRejectLeaveId(null)}
        onRejected={async () => {
          await silentRefreshBoard();
        }}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card
        title={
          <span className="flex flex-wrap items-center justify-between gap-3">
            <span>Leave balances ({balanceYear})</span>
            <label className="flex items-center gap-2 text-xs font-normal text-gray-600 dark:text-gray-400">
              Year
              <select
                value={balanceYear}
                onChange={(e) => setBalanceYear(Number(e.target.value))}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </span>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading balances…</p>
        ) : data?.leaveBalances?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Available</th>
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Pending</th>
                  <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Used</th>
                  <th className="py-2 font-medium text-gray-700 dark:text-gray-300">Entitled</th>
                </tr>
              </thead>
              <tbody>
                {data.leaveBalances.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">
                      {leaveTypeNameById.get(b.leaveTypeId) ?? b.leaveTypeId.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{b.balanceDays}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{b.pendingDays}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{b.usedDays}</td>
                    <td className="py-2 font-mono text-xs">{b.entitledDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No leave balances for this year — HR may need to provision balances.
          </p>
        )}
      </Card>

      <Card
        title={
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>Upcoming public holidays</span>
            <Button variant="outline" type="button" className="!py-1 !text-xs" onClick={() => setAllHolOpen(true)}>
              View all (this year)
            </Button>
          </span>
        }
      >
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : data?.upcomingHolidays?.length ? (
          <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
            {data.upcomingHolidays.slice(0, 14).map((h) => (
              <li key={h.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-medium text-gray-900 dark:text-white">{h.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(h.holidayDate).toLocaleDateString('en-IN')} · {h.calendarName}
                  {h.holidayType ? ` · ${h.holidayType}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No holidays scheduled ahead — admins can add calendars under{' '}
            <span className="font-mono text-xs">Admin → Leave settings</span>
            {can('leave:manage') ? (
              <>
                {' '}
                (<span className="font-mono text-xs">/admin/leave-settings</span>)
              </>
            ) : null}
            .
          </p>
        )}
      </Card>

      <Card title="Leave Types">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading leave types…</p>
        ) : data?.leaveTypes?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.leaveTypes.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {item.code}
                    </p>
                  </div>
                  <Badge variant={item.isPaid ? 'success' : 'neutral'}>
                    {item.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant={item.carryForward ? 'info' : 'neutral'}>
                    {item.carryForward ? 'Carry forward' : 'No carry forward'}
                  </Badge>
                  <Badge variant={item.requiresDocument ? 'warning' : 'neutral'}>
                    {item.requiresDocument ? 'Document required' : 'No document'}
                  </Badge>
                  <Badge variant={item.halfDayAllowed ? 'info' : 'neutral'}>
                    {item.halfDayAllowed ? 'Half-day allowed' : 'Full days only'}
                  </Badge>
                  {item.sandwichRule ? <Badge variant="warning">Sandwich rule</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No leave types found.</p>
        )}
      </Card>

      <Card id="leave-requests-section" title="Recent Leave Requests">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading leave requests…</p>
        ) : (
          <LeaveRequestsTableSection
            rows={data?.leaveRequests ?? []}
            leaveTypeNameById={leaveTypeNameById}
            employeeLabel={hideEmployeeColumn ? undefined : employeeLabel}
            hideEmployeeColumn={hideEmployeeColumn}
            showApprovalColumn={showApprovalColumn}
            canApproveRow={canApproveRowForTable}
            viewerId={viewerId}
            approveBusyId={approveBusyId}
            cancelBusyId={cancelBusyId}
            onApprove={handleApprove}
            onRejectClick={setRejectLeaveId}
            onCancelOwn={handleCancelOwn}
            onOpenTrail={openWorkflowTrail}
            emptyLabel="No leave requests found."
          />
        )}
      </Card>

      <Modal
        isOpen={trailForId != null}
        onClose={() => {
          setTrailForId(null);
          setTrailSummaryRow(null);
          setTrailRows([]);
        }}
        title="Leave request history"
        size="lg"
      >
        {trailSummaryRow && (
          <div className="mb-4 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white">
              {employeeLabel(trailSummaryRow.employeeId)} ·{' '}
              {leaveTypeNameById.get(trailSummaryRow.leaveTypeId) ?? 'Leave'}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {new Date(trailSummaryRow.fromDate).toLocaleDateString('en-IN')} →{' '}
              {new Date(trailSummaryRow.toDate).toLocaleDateString('en-IN')} · {trailSummaryRow.daysRequested}{' '}
              day(s) · <span className="capitalize">{trailSummaryRow.status}</span>
            </p>
            {trailSummaryRow.reason ? (
              <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Reason:</span> {trailSummaryRow.reason}
              </p>
            ) : null}
            {trailSummaryRow.rejectionReason ? (
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                <span className="font-semibold">Rejection:</span> {trailSummaryRow.rejectionReason}
              </p>
            ) : null}
            {trailSummaryRow.workflowInstanceId ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Workflow instance attached — steps appear below when recorded.
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                No workflow instance on this request (single-step approval or legacy). Approval/rejection is still enforced
                by the server.
              </p>
            )}
          </div>
        )}
        {trailLoading ? (
          <p className="text-sm text-gray-500">Loading workflow steps…</p>
        ) : trailRows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No workflow step actions recorded yet. If this request is pending inside a workflow, actions appear here after
            each step.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {trailRows.map((step, i) => (
              <li
                key={`${step.actedAt}-${i}`}
                className="rounded border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white">{step.workflowStepName}</div>
                <div className="text-xs text-gray-500">
                  {step.action}
                  {step.performedByUserId ? ` · user ${step.performedByUserId.slice(0, 8)}…` : ''}
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {new Date(step.actedAt).toLocaleString()}
                </div>
                {step.remarks ? (
                  <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">{step.remarks}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        isOpen={allHolOpen}
        onClose={() => setAllHolOpen(false)}
        title="Company holidays (this calendar year)"
      >
        {allHolLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : allHolRows.length === 0 ? (
          <p className="text-sm text-gray-500">No holidays returned for this year.</p>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto text-sm dark:divide-gray-800">
            {allHolRows.map((h) => (
              <li key={h.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-medium text-gray-900 dark:text-white">{h.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(h.holidayDate).toLocaleDateString('en-IN')} · {h.calendarName}
                  {h.holidayType ? ` · ${h.holidayType}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};

export default LeavePage;
