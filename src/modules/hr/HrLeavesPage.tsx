import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  type ApproveLeaveRequestMutationVariables,
  type LeaveBoardQuery,
} from '../../api/graphql/graphql';
import { canAccessTenantPath } from '../../auth/navAccess';
import { authorizationStateKey } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FlashToastBar from '../../components/common/FlashToastBar';
import PageActions from '../../components/common/PageActions';
import { useAuth } from '../../contexts/AuthContext';
import { useFlashToast } from '../../hooks/useFlashToast';
import { useGraphClient } from '../../hooks/useGraphClient';
import { boundedInteger, useRememberedRouteView } from '../../hooks/useRememberedRouteView';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import ApplyLeaveModal from '../leave/components/ApplyLeaveModal';
import CompOffApprovalPanel from '../leave/components/CompOffApprovalPanel';
import LeaveRecoveryNotice from '../leave/components/LeaveRecoveryNotice';
import LeaveRejectModal from '../leave/components/LeaveRejectModal';
import LeaveRequestsTableSection from '../leave/components/LeaveRequestsTableSection';
import LeaveWorkflowTrailModal from '../leave/components/LeaveWorkflowTrailModal';
import { useLeaveWorkflowTrail } from '../leave/hooks/useLeaveWorkflowTrail';
import {
  LEAVE_APPROVAL_REFRESH_MESSAGE,
  leaveApprovalTarget,
  type LeaveApprovalTarget,
} from '../leave/leaveApproval';

import { type HrLeaveFilter } from './components/HrLeaveFilterTabs';
import { HrLeaveQueueFilters, HrLeaveQueuePager } from './components/HrLeaveQueueControls';
import LeaveTeamCalendar from './components/LeaveTeamCalendar';
import {
  HR_LEAVE_LIMIT,
  recoverQueueFocus,
  useHrLeaveApprovalBoard,
} from './hooks/useHrLeaveApprovalBoard';

const HrLeavesPage = () => {
  const navigate = useNavigate();
  const { can, clientSession, user, tenantId } = useAuth();
  const client = useGraphClient('client');
  const flash = useFlashToast();
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveTarget, setRejectLeaveTarget] = useState<LeaveApprovalTarget | null>(null);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const workflowTrail = useLeaveWorkflowTrail(client);
  const { open: openTrail, retry: retryTrail } = workflowTrail;

  const canConfigureLeaveSettings = useMemo(
    () => canAccessTenantPath('/admin/leave-settings', { can, clientSession }),
    [can, clientSession]
  );
  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const identity = `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`;
  const [view, updateView] = useRememberedRouteView(
    client,
    identity,
    'hr-leaves',
    { year: String(defaultYear), page: '0', status: 'actionable' },
    (params) => ({
      year: String(
        boundedInteger(params.get('year'), defaultYear, defaultYear - 2, defaultYear + 1)
      ),
      page: String(boundedInteger(params.get('page'), 0, 0, 100000)),
      status: ['actionable', 'pending', 'all', 'approved', 'rejected', 'cancelled'].includes(
        params.get('status') ?? ''
      )
        ? (params.get('status') ?? 'actionable')
        : 'actionable',
    })
  );
  const balanceYear = Number(view.year);
  const requestPage = Number(view.page);
  const filter = view.status as HrLeaveFilter;
  const {
    data,
    loading,
    failure,
    setFailure,
    reload: reloadBoardAndLabels,
    isCurrent,
    queueRef,
  } = useHrLeaveApprovalBoard({
    client,
    identity,
    balanceYear,
    requestPage,
    filter,
    clearWorkflowFailure: workflowTrail.clearFailure,
  });
  useEffect(() => {
    setApproveBusyId(null);
    setCancelBusyId(null);
    setApproveWorkflowNotice(null);
    setRejectLeaveTarget(null);
    setApplyOpen(false);
  }, [isCurrent]);
  const yearChoices = useMemo(() => {
    const years: number[] = [];
    for (let year = defaultYear - 2; year <= defaultYear + 1; year += 1) years.push(year);
    return years;
  }, [defaultYear]);

  const retryBoard = useCallback(() => {
    void reloadBoardAndLabels();
  }, [reloadBoardAndLabels]);

  const silentRefreshBoard = reloadBoardAndLabels;
  const refreshAfterMutation = (removedRequestId?: string) =>
    reloadBoardAndLabels(true, removedRequestId);

  const handleApprove = async (leaveRequestId: string, pendingApprovalStepId?: string | null) => {
    const target = leaveApprovalTarget(leaveRequestId, pendingApprovalStepId);
    if (!target) {
      setFailure({ message: LEAVE_APPROVAL_REFRESH_MESSAGE, operation: 'mutation' });
      return;
    }
    const variables: ApproveLeaveRequestMutationVariables = {
      leaveRequestId: target.leaveRequestId,
      expectedWorkflowStepId: target.expectedWorkflowStepId,
    };
    setApproveBusyId(leaveRequestId);
    setApproveWorkflowNotice(null);
    setFailure(null);
    workflowTrail.clearFailure();
    let approved = false;
    try {
      const result = await client.request(ApproveLeaveRequestDocument, variables);
      if (!isCurrent()) return;
      approved = true;
      const status = result.approveLeaveRequest.status.toLowerCase();
      const pendingMessage =
        'Approval was recorded, but another workflow step may still be pending.';
      setApproveWorkflowNotice(status === 'pending' ? pendingMessage : null);
      flash.show(
        status === 'pending' ? pendingMessage : 'Leave request approved.',
        status === 'pending' ? 'info' : 'success'
      );
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'mutation' });
    } finally {
      if (isCurrent()) setApproveBusyId(null);
    }
    await refreshAfterMutation(approved ? leaveRequestId : undefined);
  };

  const handleCancelOwn = async (leaveRequestId: string) => {
    setCancelBusyId(leaveRequestId);
    setFailure(null);
    workflowTrail.clearFailure();
    let cancelled = false;
    try {
      await client.request(CancelLeaveRequestDocument, { leaveRequestId });
      if (!isCurrent()) return;
      cancelled = true;
      flash.show('Leave request cancelled.', 'success');
    } catch (err) {
      setFailure({ message: graphQlUserMessage(err), operation: 'mutation' });
    } finally {
      if (isCurrent()) setCancelBusyId(null);
    }
    await refreshAfterMutation(cancelled ? leaveRequestId : undefined);
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

  const pendingCount = data?.leaveApprovalQueue.pendingCount ?? 0;
  const actionableCount = data?.leaveApprovalQueue.actionableCount ?? 0;
  const filteredRows = data?.leaveRequests ?? [];
  const totalCount = data?.leaveRequestCount ?? 0;
  useEffect(() => {
    if (data && requestPage > 0 && requestPage * HR_LEAVE_LIMIT >= totalCount) {
      // Page correction changes query ownership and cancels its pending animation frame.
      recoverQueueFocus(queueRef.current);
      updateView({ page: String(Math.max(0, Math.ceil(totalCount / HR_LEAVE_LIMIT) - 1)) });
    }
  }, [data, queueRef, requestPage, totalCount, updateView]);

  const employeeLabelById = useMemo(
    () =>
      new Map(
        (data?.leaveRequests ?? []).flatMap((row) =>
          row.employeeName
            ? [
                [
                  row.employeeId,
                  `${row.employeeName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`,
                ] as const,
              ]
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
      void openTrail(row);
    },
    [setFailure, openTrail]
  );

  const retryWorkflowTrail = useCallback(() => {
    void retryTrail();
  }, [retryTrail]);

  const activeFailure = workflowTrail.failure ?? failure;

  return (
    <div className="space-y-4">
      <PageActions>
        <h1 className="sr-only">Leave Approvals</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => void reloadBoardAndLabels()}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
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
          <Button
            variant="primary"
            type="button"
            onClick={() => setApplyOpen(true)}
            disabled={loading}
          >
            Apply for leave
          </Button>
        </div>
      </PageActions>

      <ApplyLeaveModal
        isOpen={applyOpen}
        leaveBalances={data?.leaveBalances ?? []}
        leavePolicies={data?.leavePolicies ?? []}
        leaveTypes={data?.leaveTypes ?? []}
        upcomingHolidays={data?.upcomingHolidays ?? []}
        onClose={() => {
          if (isCurrent()) setApplyOpen(false);
        }}
        onSubmitted={() => {
          if (!isCurrent()) return;
          setFailure(null);
          workflowTrail.clearFailure();
          void silentRefreshBoard();
        }}
      />
      <LeaveRejectModal
        isOpen={rejectLeaveTarget !== null}
        leaveRequestId={rejectLeaveTarget?.leaveRequestId ?? null}
        expectedWorkflowStepId={rejectLeaveTarget?.expectedWorkflowStepId ?? null}
        onClose={() => {
          if (isCurrent()) setRejectLeaveTarget(null);
        }}
        onRejected={() => {
          if (!isCurrent()) return;
          setFailure(null);
          workflowTrail.clearFailure();
          flash.show('Leave request rejected.', 'success');
          void reloadBoardAndLabels(false, rejectLeaveTarget?.leaveRequestId);
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

      <section ref={queueRef} tabIndex={-1} aria-label="Leave approval queue">
        <Card title="Requests">
          <HrLeaveQueueFilters
            year={balanceYear}
            years={yearChoices}
            filter={filter}
            total={totalCount}
            pending={pendingCount}
            actionable={actionableCount}
            loading={loading}
            onChange={updateView}
          />
          {loading && !data ? (
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
              onApprove={(id, step) => void handleApprove(id, step)}
              onCancelOwn={(id) => void handleCancelOwn(id)}
              onOpenTrail={openWorkflowTrail}
              onRejectClick={(leaveRequestId, pendingApprovalStepId) => {
                const target = leaveApprovalTarget(leaveRequestId, pendingApprovalStepId);
                if (!target) {
                  setFailure({ message: LEAVE_APPROVAL_REFRESH_MESSAGE, operation: 'mutation' });
                  return;
                }
                setRejectLeaveTarget(target);
              }}
            />
          )}
          <HrLeaveQueuePager
            page={requestPage}
            size={HR_LEAVE_LIMIT}
            total={totalCount}
            loading={loading}
            onChange={updateView}
          />
        </Card>
      </section>

      <CompOffApprovalPanel key={authorizationStateKey(clientSession)} />
      <LeaveTeamCalendar />

      <LeaveWorkflowTrailModal
        employeeLabel={employeeLabel}
        isOpen={workflowTrail.summaryRow !== null}
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
