import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FlashToastBar from '../../components/common/FlashToastBar';
import { canAccessTenantPath } from '../../auth/navAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useFlashToast } from '../../hooks/useFlashToast';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import ApplyLeaveModal from '../leave/components/ApplyLeaveModal';
import LeaveRejectModal from '../leave/components/LeaveRejectModal';
import LeaveRequestsTableSection, {
  type LeaveRequestRow,
} from '../leave/components/LeaveRequestsTableSection';
import LeaveRecoveryNotice from '../leave/components/LeaveRecoveryNotice';
import LeaveWorkflowTrailModal from '../leave/components/LeaveWorkflowTrailModal';
import { useLeaveWorkflowTrail } from '../leave/hooks/useLeaveWorkflowTrail';
import HrLeaveFilterTabs, { type HrLeaveFilter } from './components/HrLeaveFilterTabs';
import HrLeaveSummaryCards from './components/HrLeaveSummaryCards';
import LeaveTeamCalendar from './components/LeaveTeamCalendar';
import {
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  type LeaveBoardQuery,
} from '../../api/graphql/graphql';
import { LeaveBoardRangeDocument } from '../leave/leaveBoardQuery';

type ApproveLeaveRequestMutation = {
  approveLeaveRequest: { status: string };
};

type HrLeaveFailure = {
  message: string;
  operation: 'board' | 'mutation';
};

type LeaveBoardData = Omit<LeaveBoardQuery, 'leaveRequests'> & {
  leaveRequests: LeaveRequestRow[];
};

const HR_LEAVE_LIMIT = 120;

const HrLeavesPage = () => {
  const navigate = useNavigate();
  const { can, clientSession } = useAuth();
  const client = useGraphClient('client');
  const flash = useFlashToast();
  const [data, setData] = useState<LeaveBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<HrLeaveFailure | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<HrLeaveFilter>('pending');
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | null>(null);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const workflowTrail = useLeaveWorkflowTrail(client);

  const canConfigureLeaveSettings = useMemo(
    () => canAccessTenantPath('/admin/leave-settings', { can, clientSession }),
    [can, clientSession]
  );
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
        limit: HR_LEAVE_LIMIT,
        balanceYear,
        fromDate: requestYearRange.fromDate,
        toDate: requestYearRange.toDate,
      }),
    [balanceYear, client, requestYearRange.fromDate, requestYearRange.toDate]
  );

  const reloadBoardAndLabels = useCallback(async () => {
    try {
      setLoading(true);
      setFailure(null);
      workflowTrail.clearFailure();
      setData(await loadBoard());
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'board' });
    } finally {
      setLoading(false);
    }
  }, [loadBoard, workflowTrail.clearFailure]);

  const retryBoard = useCallback(() => {
    void reloadBoardAndLabels();
  }, [reloadBoardAndLabels]);

  useEffect(() => {
    void reloadBoardAndLabels();
  }, [reloadBoardAndLabels]);

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

  const employeeLabelById = useMemo(
    () =>
      new Map(
        (data?.leaveRequests ?? []).flatMap((row) =>
          row.employeeName
            ? [[row.employeeId, `${row.employeeName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`] as const]
            : []
        )
      ),
    [data?.leaveRequests]
  );

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Approvals</h1>
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
          setFailure(null);
          workflowTrail.clearFailure();
          await silentRefreshBoard();
        }}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Requests...</p>
        ) : (
          <LeaveRequestsTableSection
            approveBusyId={approveBusyId}
            cancelBusyId={cancelBusyId}
            employeeLabel={employeeLabel}
            emptyLabel="No Requests In This Tab."
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
        isOpen={workflowTrail.summaryRow != null}
        leaveTypeNameById={leaveTypeNameById}
        loading={workflowTrail.loading}
        rows={workflowTrail.rows}
        summaryRow={workflowTrail.summaryRow}
        onClose={workflowTrail.close}
      />
      <FlashToastBar toast={flash.flash} onDismiss={flash.clear} />
    </div>
  );
};

export default HrLeavesPage;
