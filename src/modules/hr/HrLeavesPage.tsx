import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  canApproveLeaveRequestRow,
  showLeaveApprovalColumn,
} from '../../auth/leaveApprovalUi';
import { canAccessTenantPath } from '../../auth/navAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import ApplyLeaveModal from '../leave/components/ApplyLeaveModal';
import LeaveRejectModal from '../leave/components/LeaveRejectModal';
import LeaveRequestsTableSection from '../leave/components/LeaveRequestsTableSection';
import Modal from '../../components/common/Modal';
import LeaveTeamCalendar from './components/LeaveTeamCalendar';
import {
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  LeaveBoardDocument,
  LeaveWorkflowTrailQueryDocument,
  OrgChartDocument,
  type LeaveBoardQuery,
  type LeaveWorkflowTrailQueryQuery,
  type OrgChartQuery,
} from '../../api/graphql/graphql';

type LeaveFilter = 'pending' | 'all' | 'approved' | 'rejected' | 'cancelled';

/** Mutation payload shape for `ApproveLeaveRequestDocument` (codegen types optional). */
type ApproveLeaveRequestMutation = {
  approveLeaveRequest: { status: string };
};

const HR_LEAVE_LIMIT = 120;

const HrLeavesPage = () => {
  const navigate = useNavigate();
  const { can, clientSession } = useAuth();
  const client = useGraphClient('client');

  const canConfigureLeaveSettings = useMemo(
    () =>
      canAccessTenantPath('/admin/leave-settings', {
        can,
        clientSession,
      }),
    [can, clientSession]
  );

  const [data, setData] = useState<LeaveBoardQuery | null>(null);
  const [orgChartRows, setOrgChartRows] = useState<OrgChartQuery['orgChart']>([]);
  const [orgLabels, setOrgLabels] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeaveFilter>('pending');
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

  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [balanceYear, setBalanceYear] = useState(defaultYear);
  const yearChoices = useMemo(() => {
    const ys: number[] = [];
    for (let y = defaultYear - 2; y <= defaultYear + 1; y++) ys.push(y);
    return ys;
  }, [defaultYear]);

  const loadBoard = useCallback(async () => {
    return client.request<LeaveBoardQuery>(LeaveBoardDocument, {
      limit: HR_LEAVE_LIMIT,
      balanceYear,
    });
  }, [client, balanceYear]);

  const loadOrgChart = useCallback(async () => {
    const r = await client.request<OrgChartQuery>(OrgChartDocument, { limit: 500 });
    const m = new Map<string, string>();
    for (const row of r.orgChart ?? []) {
      const label = `${row.fullName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`;
      m.set(row.employeeId, label);
    }
    return { labels: m, rows: r.orgChart ?? [] };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [board, orgData] = await Promise.all([loadBoard(), loadOrgChart()]);
        if (!cancelled) {
          setData(board);
          setOrgLabels(orgData.labels);
          setOrgChartRows(orgData.rows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load leave queue');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard, loadOrgChart]);

  const silentRefreshBoard = useCallback(async () => {
    try {
      setError(null);
      const board = await loadBoard();
      setData(board);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh');
    }
  }, [loadBoard]);

  const reloadBoardAndLabels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [board, orgData] = await Promise.all([loadBoard(), loadOrgChart()]);
      setData(board);
      setOrgLabels(orgData.labels);
      setOrgChartRows(orgData.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }, [loadBoard, loadOrgChart]);

  const handleApprove = async (leaveRequestId: string) => {
    setApproveBusyId(leaveRequestId);
    setApproveWorkflowNotice(null);
    try {
      const res = await client.request<ApproveLeaveRequestMutation>(ApproveLeaveRequestDocument, {
        leaveRequestId,
      });
      await silentRefreshBoard();
      const st = res.approveLeaveRequest?.status?.toLowerCase() ?? '';
      setApproveWorkflowNotice(
        st === 'pending'
          ? 'Approval was accepted; if this row still shows Pending, choose Refresh.'
          : null
      );
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

  const pendingCount = useMemo(() => {
    return (data?.leaveRequests ?? []).filter((r) => r.status.toLowerCase() === 'pending').length;
  }, [data?.leaveRequests]);

  const filteredRows = useMemo(() => {
    const rows = data?.leaveRequests ?? [];
    const norm = (s: string) => s.toLowerCase();
    if (filter === 'all') {
      return [...rows].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }
    const subset = rows.filter((r) => norm(r.status) === filter);
    return [...subset].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [data?.leaveRequests, filter]);

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

  const filterTabs: { id: LeaveFilter; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'all', label: 'All' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave approvals</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            HR queue over visible leave requests (respects your{' '}
            <span className="font-mono text-xs">leave</span> data scope). Use{' '}
            <Link className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400" to="/leave">
              Leave
            </Link>{' '}
            for self-service apply and the standard employee board.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => void reloadBoardAndLabels()}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          {canConfigureLeaveSettings ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => void navigate('/admin/leave-settings')}
            >
              Leave & holidays setup
            </Button>
          ) : null}
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
          await silentRefreshBoard();
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

      {approveWorkflowNotice && (
        <Card>
          <p className="text-sm text-sky-800 dark:text-sky-200">{approveWorkflowNotice}</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Pending approvals">
          {loading ? (
            <p className="text-sm text-gray-500">…</p>
          ) : (
            <p className="text-3xl font-semibold tabular-nums text-amber-700 dark:text-amber-300">
              {pendingCount}
            </p>
          )}
        </Card>
        <Card title="In queue">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing up to <span className="font-mono">{HR_LEAVE_LIMIT}</span> requests in your scope.
          </p>
        </Card>
        <Card
          title={
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span>My balances ({balanceYear})</span>
              <select
                value={balanceYear}
                onChange={(e) => setBalanceYear(Number(e.target.value))}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </span>
          }
        >
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : data?.leaveBalances?.length ? (
            <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              {data.leaveBalances.map((b) => (
                <li key={b.id} className="flex justify-between gap-2">
                  <span>{leaveTypeNameById.get(b.leaveTypeId) ?? 'Leave'}</span>
                  <span className="font-mono">{b.balanceDays} d</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No rows for this year.</p>
          )}
        </Card>
      </div>

      <LeaveTeamCalendar />

      <Card title="Requests">
        <div className="mb-4 flex flex-wrap gap-2">
          {filterTabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant={filter === t.id ? 'primary' : 'outline'}
              className="!py-1.5 !text-xs"
              onClick={() => setFilter(t.id)}
            >
              {t.label}
              {t.id === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </Button>
          ))}
        </div>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading requests…</p>
        ) : (
          <LeaveRequestsTableSection
            rows={filteredRows}
            leaveTypeNameById={leaveTypeNameById}
            employeeLabel={employeeLabel}
            showApprovalColumn={showApprovalColumn}
            canApproveRow={canApproveRowForTable}
            viewerId={viewerId}
            approveBusyId={approveBusyId}
            cancelBusyId={cancelBusyId}
            onApprove={handleApprove}
            onRejectClick={setRejectLeaveId}
            onCancelOwn={handleCancelOwn}
            onOpenTrail={openWorkflowTrail}
            emptyLabel="No requests in this tab."
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
                No workflow instance on this request (single-step approval or legacy).
              </p>
            )}
          </div>
        )}
        {trailLoading ? (
          <p className="text-sm text-gray-500">Loading workflow steps…</p>
        ) : trailRows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No workflow step actions recorded yet.
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
    </div>
  );
};

export default HrLeavesPage;
