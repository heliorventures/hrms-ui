import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FlashToastBar from '../../components/common/FlashToastBar';
import {
  canApproveLeaveRequestRow,
  showLeaveApprovalColumn,
} from '../../auth/leaveApprovalUi';
import { canAccessTenantPath } from '../../auth/navAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useFlashToast } from '../../hooks/useFlashToast';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import ApplyLeaveModal from '../leave/components/ApplyLeaveModal';
import LeaveRejectModal from '../leave/components/LeaveRejectModal';
import LeaveRequestsTableSection from '../leave/components/LeaveRequestsTableSection';
import LeaveWorkflowTrailModal from '../leave/components/LeaveWorkflowTrailModal';
import HrLeaveFilterTabs, { type HrLeaveFilter } from './components/HrLeaveFilterTabs';
import HrLeaveSummaryCards from './components/HrLeaveSummaryCards';
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

type ApproveLeaveRequestMutation = {
  approveLeaveRequest: { status: string };
};

const HR_LEAVE_LIMIT = 120;
const ORG_CHART_LIMIT = 500;

const HrLeavesPage = () => {
  const navigate = useNavigate();
  const { can, clientSession } = useAuth();
  const client = useGraphClient('client');
  const flash = useFlashToast();
  const [data, setData] = useState<LeaveBoardQuery | null>(null);
  const [orgChartRows, setOrgChartRows] = useState<OrgChartQuery['orgChart']>([]);
  const [orgLabels, setOrgLabels] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<HrLeaveFilter>('pending');
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | null>(null);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const [trailSummaryRow, setTrailSummaryRow] = useState<LeaveBoardQuery['leaveRequests'][number] | null>(null);
  const [trailLoading, setTrailLoading] = useState(false);
  const [trailRows, setTrailRows] =
    useState<LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail']>([]);

  const canConfigureLeaveSettings = useMemo(
    () => canAccessTenantPath('/admin/leave-settings', { can, clientSession }),
    [can, clientSession]
  );
  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [balanceYear, setBalanceYear] = useState(defaultYear);
  const yearChoices = useMemo(() => {
    const years: number[] = [];
    for (let year = defaultYear - 2; year <= defaultYear + 1; year += 1) years.push(year);
    return years;
  }, [defaultYear]);

  const loadBoard = useCallback(
    () => client.request<LeaveBoardQuery>(LeaveBoardDocument, { limit: HR_LEAVE_LIMIT, balanceYear }),
    [client, balanceYear]
  );

  const loadOrgChart = useCallback(async () => {
    const response = await client.request<OrgChartQuery>(OrgChartDocument, { limit: ORG_CHART_LIMIT });
    return {
      labels: new Map(
        (response.orgChart ?? []).map((row) => [
          row.employeeId,
          `${row.fullName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`,
        ])
      ),
      rows: response.orgChart ?? [],
    };
  }, [client]);

  const reloadBoardAndLabels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [board, orgData] = await Promise.all([loadBoard(), loadOrgChart()]);
      setData(board);
      setOrgLabels(orgData.labels);
      setOrgChartRows(orgData.rows);
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loadBoard, loadOrgChart]);

  useEffect(() => {
    void reloadBoardAndLabels();
  }, [reloadBoardAndLabels]);

  const silentRefreshBoard = useCallback(async () => {
    try {
      setData(await loadBoard());
    } catch (err) {
      const message = graphQlUserMessage(err);
      setError(message);
      flash.show(message, 'error');
    }
  }, [loadBoard, flash.show]);

  const refreshAfterMutation = async () => {
    try {
      setData(await loadBoard());
    } catch (err) {
      const message = graphQlUserMessage(err);
      setError(message);
      flash.show(`Could not refresh leave list: ${message}`, 'error');
    }
  };

  const handleApprove = async (leaveRequestId: string) => {
    setApproveBusyId(leaveRequestId);
    setApproveWorkflowNotice(null);
    setError(null);
    try {
      const result = await client.request<ApproveLeaveRequestMutation>(ApproveLeaveRequestDocument, {
        leaveRequestId,
      });
      const status = result.approveLeaveRequest?.status?.toLowerCase() ?? '';
      const pendingMessage =
        'Approval was recorded, but another workflow step may still be pending.';
      setApproveWorkflowNotice(status === 'pending' ? pendingMessage : null);
      flash.show(status === 'pending' ? pendingMessage : 'Leave request approved.', status === 'pending' ? 'info' : 'success');
    } catch (err) {
      const message = graphQlUserMessage(err);
      setError(message);
      flash.show(message, 'error');
    } finally {
      setApproveBusyId(null);
    }
    await refreshAfterMutation();
  };

  const handleCancelOwn = async (leaveRequestId: string) => {
    setCancelBusyId(leaveRequestId);
    setError(null);
    try {
      await client.request(CancelLeaveRequestDocument, { leaveRequestId });
      flash.show('Leave request cancelled.', 'success');
    } catch (err) {
      const message = graphQlUserMessage(err);
      setError(message);
      flash.show(message, 'error');
    } finally {
      setCancelBusyId(null);
    }
    await refreshAfterMutation();
  };

  const leaveTypeNameById = useMemo(
    () => new Map((data?.leaveTypes ?? []).map((leaveType) => [leaveType.id, leaveType.name])),
    [data?.leaveTypes]
  );

  const viewerId = data?.viewerEmployeeId;
  const directReportIds = useMemo(() => {
    if (!viewerId) return new Set<string>();
    return new Set(
      orgChartRows
        .filter((row) => row.reportingManagerId === viewerId)
        .map((row) => row.employeeId)
    );
  }, [viewerId, orgChartRows]);

  const showApprovalColumn = useMemo(
    () => showLeaveApprovalColumn({ can, clientSession, managesDirectReports: directReportIds.size > 0 }),
    [can, clientSession, directReportIds]
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

  const pendingCount = useMemo(
    () => (data?.leaveRequests ?? []).filter((row) => row.status.toLowerCase() === 'pending').length,
    [data?.leaveRequests]
  );

  const filteredRows = useMemo(() => {
    const rows = data?.leaveRequests ?? [];
    const visibleRows = filter === 'all' ? rows : rows.filter((row) => row.status.toLowerCase() === filter);
    return [...visibleRows].sort(
      (first, second) => new Date(second.appliedAt).getTime() - new Date(first.appliedAt).getTime()
    );
  }, [data?.leaveRequests, filter]);

  const employeeLabel = useCallback(
    (employeeId: string) => orgLabels.get(employeeId) ?? `${employeeId.slice(0, 8)}...`,
    [orgLabels]
  );

  const openWorkflowTrail = async (row: LeaveBoardQuery['leaveRequests'][number]) => {
    setTrailSummaryRow(row);
    setTrailLoading(true);
    setTrailRows([]);
    setError(null);
    try {
      const response = await client.request<LeaveWorkflowTrailQueryQuery>(
        LeaveWorkflowTrailQueryDocument,
        { leaveRequestId: row.id }
      );
      setTrailRows(response.leaveRequestWorkflowTrail);
    } catch (err) {
      setError(graphQlUserMessage(err));
      setTrailSummaryRow(null);
    } finally {
      setTrailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave approvals</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            HR queue over visible leave requests. Use{' '}
            <Link className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400" to="/leave">
              Leave
            </Link>{' '}
            for self-service apply and the standard employee board.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => void reloadBoardAndLabels()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {canConfigureLeaveSettings ? (
            <Button variant="outline" type="button" onClick={() => void navigate('/admin/leave-settings')}>
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
        leaveBalances={data?.leaveBalances ?? []}
        leavePolicies={data?.leavePolicies ?? []}
        leaveTypes={data?.leaveTypes ?? []}
        upcomingHolidays={data?.upcomingHolidays ?? []}
        onClose={() => setApplyOpen(false)}
        onSubmitted={async () => {
          setError(null);
          await silentRefreshBoard();
        }}
      />
      <LeaveRejectModal
        isOpen={rejectLeaveId != null}
        leaveRequestId={rejectLeaveId}
        onClose={() => setRejectLeaveId(null)}
        onRejected={async () => {
          setError(null);
          flash.show('Leave request rejected.', 'success');
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

      <HrLeaveSummaryCards
        balanceYear={balanceYear}
        balances={data?.leaveBalances ?? []}
        leaveTypeNameById={leaveTypeNameById}
        limit={HR_LEAVE_LIMIT}
        loading={loading}
        pendingCount={pendingCount}
        yearChoices={yearChoices}
        onYearChange={setBalanceYear}
      />

      <LeaveTeamCalendar />

      <Card title="Requests">
        <HrLeaveFilterTabs activeFilter={filter} pendingCount={pendingCount} onChange={setFilter} />
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading requests...</p>
        ) : (
          <LeaveRequestsTableSection
            approveBusyId={approveBusyId}
            canApproveRow={canApproveRowForTable}
            cancelBusyId={cancelBusyId}
            employeeLabel={employeeLabel}
            emptyLabel="No requests in this tab."
            leaveTypeNameById={leaveTypeNameById}
            rows={filteredRows}
            showApprovalColumn={showApprovalColumn}
            viewerId={viewerId}
            onApprove={handleApprove}
            onCancelOwn={handleCancelOwn}
            onOpenTrail={openWorkflowTrail}
            onRejectClick={setRejectLeaveId}
          />
        )}
      </Card>

      <LeaveWorkflowTrailModal
        employeeLabel={employeeLabel}
        isOpen={trailSummaryRow != null}
        leaveTypeNameById={leaveTypeNameById}
        loading={trailLoading}
        rows={trailRows}
        summaryRow={trailSummaryRow}
        onClose={() => {
          setTrailSummaryRow(null);
          setTrailRows([]);
        }}
      />
      <FlashToastBar toast={flash.flash} onDismiss={flash.clear} />
    </div>
  );
};

export default HrLeavesPage;
