import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FlashToastBar from '../../components/common/FlashToastBar';
import {
  canApproveLeaveRequestRow,
  showLeaveApprovalColumn,
} from '../../auth/leaveApprovalUi';
import { createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useFlashToast } from '../../hooks/useFlashToast';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import AllHolidaysModal from './components/AllHolidaysModal';
import ApplyLeaveModal from './components/ApplyLeaveModal';
import HolidaySummaryCard from './components/HolidaySummaryCard';
import LeaveBalancesCard from './components/LeaveBalancesCard';
import LeaveRejectModal from './components/LeaveRejectModal';
import LeaveRequestsTableSection from './components/LeaveRequestsTableSection';
import LeaveTypesCard from './components/LeaveTypesCard';
import LeaveWorkflowTrailModal from './components/LeaveWorkflowTrailModal';
import {
  AllCompanyHolidaysDocument,
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  LeaveWorkflowTrailQueryDocument,
  OrgChartDocument,
  type AllCompanyHolidaysQuery,
  type LeaveBoardQuery,
  type LeaveWorkflowTrailQueryQuery,
  type OrgChartQuery,
} from '../../api/graphql/graphql';
import { LeaveBoardRangeDocument } from './leaveBoardQuery';

type ApproveLeaveRequestMutation = {
  approveLeaveRequest: { status: string };
};

const BOARD_LIMIT = 20;
const ORG_CHART_LIMIT = 500;
const HOLIDAY_LIMIT = 450;

const LeavePage = () => {
  const { can, clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const client = useGraphClient('client');
  const flash = useFlashToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [orgChartRows, setOrgChartRows] = useState<OrgChartQuery['orgChart']>([]);
  const [data, setData] = useState<LeaveBoardQuery | null>(null);
  const [orgLabels, setOrgLabels] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | null>(null);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const [trailSummaryRow, setTrailSummaryRow] = useState<LeaveBoardQuery['leaveRequests'][number] | null>(null);
  const [trailLoading, setTrailLoading] = useState(false);
  const [trailRows, setTrailRows] =
    useState<LeaveWorkflowTrailQueryQuery['leaveRequestWorkflowTrail']>([]);
  const [allHolOpen, setAllHolOpen] = useState(false);
  const [allHolLoading, setAllHolLoading] = useState(false);
  const [allHolRows, setAllHolRows] = useState<AllCompanyHolidaysQuery['upcomingHolidays']>([]);

  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [balanceYear, setBalanceYear] = useState(defaultYear);
  const requestYearRange = useMemo(
    () => ({
      fromDate: `${balanceYear}-01-01`,
      toDate: `${balanceYear}-12-31`,
    }),
    [balanceYear]
  );

  const yearChoices = useMemo(() => {
    const years: number[] = [];
    for (let year = defaultYear - 2; year <= defaultYear + 1; year += 1) years.push(year);
    return years;
  }, [defaultYear]);

  const loadBoard = useCallback(
    () =>
      client.request<LeaveBoardQuery>(LeaveBoardRangeDocument, {
        limit: BOARD_LIMIT,
        balanceYear,
        fromDate: requestYearRange.fromDate,
        toDate: requestYearRange.toDate,
      }),
    [balanceYear, client, requestYearRange.fromDate, requestYearRange.toDate]
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

  const refreshBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, orgData] = await Promise.all([loadBoard(), loadOrgChart()]);
      setData(result);
      setOrgLabels(orgData.labels);
      setOrgChartRows(orgData.rows);
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loadBoard, loadOrgChart]);

  useEffect(() => {
    void refreshBoard();
  }, [refreshBoard]);

  useEffect(() => {
    if (!allHolOpen) return;
    let cancelled = false;
    void (async () => {
      try {
        setAllHolLoading(true);
        const year = new Date().getFullYear();
        const response = await client.request<AllCompanyHolidaysQuery>(AllCompanyHolidaysDocument, {
          fromDate: `${year}-01-01`,
          limit: HOLIDAY_LIMIT,
        });
        if (!cancelled) setAllHolRows(response.upcomingHolidays ?? []);
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

  const hideEmployeeColumn = useMemo(() => {
    const requests = data?.leaveRequests ?? [];
    if (!viewerId || requests.length === 0 || showApprovalColumn) return false;
    return requests.every((request) => request.employeeId === viewerId);
  }, [data?.leaveRequests, viewerId, showApprovalColumn]);

  const leaveRequestLimitReached = (data?.leaveRequests?.length ?? 0) >= BOARD_LIMIT;

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live leave balances, policies, holidays, requests, and approval workflow actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => void refreshBoard()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
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
        onSubmitted={refreshBoard}
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
      {leaveRequestLimitReached && (
        <Card>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Leave requests reached the {BOARD_LIMIT}-row load limit. Use workflow trail or backend
            reports before treating this screen as a complete approval history.
          </p>
        </Card>
      )}

      <LeaveBalancesCard
        balanceYear={balanceYear}
        balances={data?.leaveBalances ?? []}
        leaveTypes={data?.leaveTypes ?? []}
        leaveTypeNameById={leaveTypeNameById}
        loading={loading}
        yearChoices={yearChoices}
        onYearChange={setBalanceYear}
      />
      <HolidaySummaryCard
        canManageLeave={permissions.canCapability('action.leave.manage')}
        holidays={data?.upcomingHolidays ?? []}
        loading={loading}
        onViewAll={() => setAllHolOpen(true)}
      />
      <LeaveTypesCard leaveTypes={data?.leaveTypes ?? []} loading={loading} />

      <Card id="leave-requests-section" title="Recent Leave Requests">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Leave Requests...</p>
        ) : (
          <LeaveRequestsTableSection
            approveBusyId={approveBusyId}
            canApproveRow={canApproveRowForTable}
            cancelBusyId={cancelBusyId}
            employeeLabel={hideEmployeeColumn ? undefined : employeeLabel}
            emptyLabel="No Leave Requests Found."
            hideEmployeeColumn={hideEmployeeColumn}
            leaveTypeNameById={leaveTypeNameById}
            rows={data?.leaveRequests ?? []}
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
      <AllHolidaysModal
        holidays={allHolRows}
        isOpen={allHolOpen}
        loading={allHolLoading}
        onClose={() => setAllHolOpen(false)}
      />
      <FlashToastBar toast={flash.flash} onDismiss={flash.clear} />
    </div>
  );
};

export default LeavePage;
