import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FlashToastBar from '../../components/common/FlashToastBar';
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
import LeaveRequestsTableSection, {
  type LeaveRequestRow,
} from './components/LeaveRequestsTableSection';
import LeaveRecoveryNotice from './components/LeaveRecoveryNotice';
import LeaveTypesCard from './components/LeaveTypesCard';
import LeaveWorkflowTrailModal from './components/LeaveWorkflowTrailModal';
import { useAllCompanyHolidays } from './hooks/useAllCompanyHolidays';
import { useLeaveWorkflowTrail } from './hooks/useLeaveWorkflowTrail';
import {
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  type LeaveBoardQuery,
} from '../../api/graphql/graphql';
import { LeaveBoardRangeDocument } from './leaveBoardQuery';
type ApproveLeaveRequestMutation = {
  approveLeaveRequest: { status: string };
};
type LeaveBoardData = Omit<LeaveBoardQuery, 'leaveRequests'> & {
  leaveRequests: LeaveRequestRow[];
};
type LeavePageFailure = {
  message: string;
  operation: 'board' | 'mutation';
};
const BOARD_LIMIT = 20, HOLIDAY_LIMIT = 450;
const LeavePage = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const client = useGraphClient('client');
  const flash = useFlashToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [data, setData] = useState<LeaveBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<LeavePageFailure | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | null>(null);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const workflowTrail = useLeaveWorkflowTrail(client);
  const allHolidays = useAllCompanyHolidays(client, HOLIDAY_LIMIT);

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
      client.request<LeaveBoardData>(LeaveBoardRangeDocument, {
        limit: BOARD_LIMIT,
        balanceYear,
        fromDate: requestYearRange.fromDate,
        toDate: requestYearRange.toDate,
      }),
    [balanceYear, client, requestYearRange.fromDate, requestYearRange.toDate]
  );

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
    setFailure(null);
    workflowTrail.clearFailure();
    try {
      setData(await loadBoard());
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'board' });
    } finally {
      setLoading(false);
    }
  }, [loadBoard, workflowTrail.clearFailure]);

  const retryBoard = useCallback(() => {
    void refreshBoard();
  }, [refreshBoard]);

  useEffect(() => {
    void refreshBoard();
  }, [refreshBoard]);

  const silentRefreshBoard = useCallback(async () => {
    try {
      setData(await loadBoard());
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'board' });
    }
  }, [loadBoard]);

  const refreshAfterMutation = async () => {
    try {
      setData(await loadBoard());
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'board' });
    }
  };

  const handleApprove = async (leaveRequestId: string) => {
    setApproveBusyId(leaveRequestId);
    setApproveWorkflowNotice(null);
    setFailure(null);
    workflowTrail.clearFailure();
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
      setFailure({ message: graphQlUserMessage(err), operation: 'mutation' });
    } finally {
      setApproveBusyId(null);
    }
    await refreshAfterMutation();
  };

  const handleCancelOwn = async (leaveRequestId: string) => {
    setCancelBusyId(leaveRequestId);
    setFailure(null);
    workflowTrail.clearFailure();
    try {
      await client.request(CancelLeaveRequestDocument, { leaveRequestId });
      flash.show('Leave request cancelled.', 'success');
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'mutation' });
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

  const showApprovalColumn = useMemo(
    () => (data?.leaveRequests ?? []).some((row) => row.viewerMayApprove === true),
    [data?.leaveRequests]
  );

  const hideEmployeeColumn = useMemo(() => {
    const requests = data?.leaveRequests ?? [];
    if (!viewerId || requests.length === 0 || showApprovalColumn) return false;
    return requests.every((request) => request.employeeId === viewerId);
  }, [data?.leaveRequests, viewerId, showApprovalColumn]);

  const leaveRequestLimitReached = (data?.leaveRequests?.length ?? 0) >= BOARD_LIMIT;

  const employeeLabelById = useMemo(() => {
    const labels = new Map<string, string>();
    for (const row of data?.leaveRequests ?? []) {
      if (!row.employeeName) continue;
      labels.set(
        row.employeeId,
        `${row.employeeName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`
      );
    }
    return labels;
  }, [data?.leaveRequests]);

  const employeeLabel = useCallback(
    (employeeId: string) => employeeLabelById.get(employeeId) ?? 'Employee details unavailable',
    [employeeLabelById]
  );

  const openWorkflowTrail = useCallback(
    (row: LeaveBoardQuery['leaveRequests'][number]) => {
      setFailure(null);
      void workflowTrail.open(row);
    },
    [workflowTrail.open]
  );

  const retryWorkflowTrail = useCallback(() => {
    void workflowTrail.retry();
  }, [workflowTrail.retry]);

  const activeFailure = workflowTrail.failure ?? failure;

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
          setFailure(null);
          workflowTrail.clearFailure();
          flash.show('Leave request rejected.', 'success');
          await silentRefreshBoard();
        }}
      />

      {activeFailure && (
        <LeaveRecoveryNotice
          message={activeFailure.message}
          operation={activeFailure.operation}
          onRefreshBoard={retryBoard}
          onRetryWorkflowTrail={retryWorkflowTrail}
          refreshing={loading || workflowTrail.loading}
        />
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
        onViewAll={() => void allHolidays.open()}
      />
      <LeaveTypesCard leaveTypes={data?.leaveTypes ?? []} loading={loading} />

      <Card id="leave-requests-section" title="Recent Leave Requests">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Leave Requests...</p>
        ) : (
          <LeaveRequestsTableSection
            approveBusyId={approveBusyId}
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
        isOpen={workflowTrail.summaryRow != null}
        leaveTypeNameById={leaveTypeNameById}
        loading={workflowTrail.loading}
        rows={workflowTrail.rows}
        summaryRow={workflowTrail.summaryRow}
        onClose={workflowTrail.close}
      />
      <AllHolidaysModal
        holidays={allHolidays.rows}
        failure={allHolidays.failure}
        isOpen={allHolidays.isOpen}
        loading={allHolidays.loading}
        onClose={allHolidays.close}
        onRetry={() => void allHolidays.retry()}
      />
      <FlashToastBar toast={flash.flash} onDismiss={flash.clear} />
    </div>
  );
};

export default LeavePage;
