import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { LeaveBoardQuery } from '../../api/graphql/graphql';
import { canAccessTenantPath } from '../../auth/navAccess';
import { authorizationStateKey } from '../../auth/permissionService';
import FlashToastBar from '../../components/common/FlashToastBar';
import { useAuth } from '../../contexts/AuthContext';
import { useFlashToast } from '../../hooks/useFlashToast';
import { useGraphClient } from '../../hooks/useGraphClient';
import CompOffApprovalPanel from '../leave/components/CompOffApprovalPanel';
import { useLeaveWorkflowTrail } from '../leave/hooks/useLeaveWorkflowTrail';
import {
  LEAVE_APPROVAL_REFRESH_MESSAGE,
  leaveApprovalTarget,
  type LeaveApprovalTarget,
} from '../leave/leaveApproval';

import {
  HrLeavePageDialogs,
  HrLeavePageHeader,
  HrLeavePageNotices,
  HrLeaveWorkflowDialog,
} from './components/HrLeavePageSections';
import HrLeaveQueueSection from './components/HrLeaveQueueSection';
import LeaveTeamCalendar from './components/LeaveTeamCalendar';
import { useHrLeaveApplicationHolidays } from './hooks/useHrLeaveApplicationHolidays';
import { HR_LEAVE_LIMIT, useHrLeaveApprovalBoard } from './hooks/useHrLeaveApprovalBoard';
import { useHrLeaveMutations } from './hooks/useHrLeaveMutations';
import { useHrLeaveQueuePresentation } from './hooks/useHrLeaveQueuePresentation';
import { useHrLeaveQueueView } from './hooks/useHrLeaveQueueView';

const useHrLeavesPageModel = () => {
  const navigate = useNavigate();
  const { can, clientSession, user, tenantId } = useAuth();
  const client = useGraphClient('client');
  const flash = useFlashToast();
  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectLeaveTarget, setRejectLeaveTarget] = useState<LeaveApprovalTarget | null>(null);
  const workflowTrail = useLeaveWorkflowTrail(client);
  const { open: openTrail, retry: retryTrail } = workflowTrail;

  const canConfigureLeaveSettings = useMemo(
    () => canAccessTenantPath('/admin/leave-settings', { can, clientSession }),
    [can, clientSession]
  );
  const identity = `${tenantId ?? ''}:${user?.id ?? ''}:${authorizationStateKey(clientSession)}`;
  const { balanceYear, filter, requestPage, updateView, yearChoices } = useHrLeaveQueueView(
    client,
    identity
  );
  const applicationHolidays = useHrLeaveApplicationHolidays({ client, identity });
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
  const mutations = useHrLeaveMutations({
    client,
    clearWorkflowFailure: workflowTrail.clearFailure,
    isCurrent,
    refresh: reloadBoardAndLabels,
    setFailure,
    showFlash: flash.show,
  });
  const { clearMutationState } = mutations;
  useEffect(() => {
    clearMutationState();
    setRejectLeaveTarget(null);
    setApplyOpen(false);
  }, [clearMutationState, isCurrent]);
  const retryBoard = useCallback(() => {
    void reloadBoardAndLabels();
  }, [reloadBoardAndLabels]);

  const silentRefreshBoard = reloadBoardAndLabels;
  const presentation = useHrLeaveQueuePresentation(data, requestPage, queueRef, updateView);
  const {
    actionableCount,
    employeeLabel,
    filteredRows,
    leaveTypeNameById,
    pendingCount,
    showApprovalColumn,
    totalCount,
    viewerId,
  } = presentation;

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

  return {
    activeFailure,
    applicationHolidays,
    balanceYear,
    canConfigureLeaveSettings,
    clientSession,
    data,
    employeeLabel,
    failure,
    filter,
    flash,
    filteredRows,
    isCurrent,
    leaveTypeNameById,
    loading,
    mutations,
    navigate,
    openWorkflowTrail,
    pendingCount,
    actionableCount,
    queueRef,
    rejectLeaveTarget,
    reloadBoardAndLabels,
    requestPage,
    retryBoard,
    retryWorkflowTrail,
    setApplyOpen,
    setFailure,
    setRejectLeaveTarget,
    showApprovalColumn,
    silentRefreshBoard,
    totalCount,
    updateView,
    viewerId,
    workflowTrail,
    yearChoices,
    applyOpen,
  };
};

type PageModel = ReturnType<typeof useHrLeavesPageModel>;

const HrLeavePageTop = ({ model: m }: { model: PageModel }) => (
  <>
    <HrLeavePageHeader
      canConfigure={m.canConfigureLeaveSettings}
      loading={m.loading}
      onApply={() => {
        m.setApplyOpen(true);
        void m.applicationHolidays.load();
      }}
      onConfigure={() => void m.navigate('/admin/leave-settings')}
      onRefresh={() => void m.reloadBoardAndLabels()}
    />
    <HrLeavePageDialogs
      apply={{
        isOpen: m.applyOpen,
        leaveBalances: m.data?.leaveBalances ?? [],
        leavePolicies: m.data?.leavePolicies ?? [],
        leaveTypes: m.data?.leaveTypes ?? [],
        onClose: () => m.isCurrent() && m.setApplyOpen(false),
        onRetryUpcomingHolidays: () => void m.applicationHolidays.retry(),
        onSubmitted: () => {
          if (!m.isCurrent()) return;
          m.setFailure(null);
          m.workflowTrail.clearFailure();
          void m.silentRefreshBoard();
        },
        upcomingHolidays: m.applicationHolidays.rows,
        upcomingHolidaysFailure: m.applicationHolidays.failure,
        upcomingHolidaysLoading: m.applicationHolidays.loading,
      }}
      reject={{
        expectedWorkflowStepId: m.rejectLeaveTarget?.expectedWorkflowStepId ?? null,
        isOpen: m.rejectLeaveTarget !== null,
        leaveRequestId: m.rejectLeaveTarget?.leaveRequestId ?? null,
        onClose: () => m.isCurrent() && m.setRejectLeaveTarget(null),
        onRejected: () => {
          if (!m.isCurrent()) return;
          m.setFailure(null);
          m.workflowTrail.clearFailure();
          m.flash.show('Leave request rejected.', 'success');
          void m.reloadBoardAndLabels(false, m.rejectLeaveTarget?.leaveRequestId);
        },
      }}
    />
    <HrLeavePageNotices
      approvalMessage={m.mutations.approveWorkflowNotice}
      recovery={
        m.activeFailure
          ? {
              message: m.activeFailure.message,
              onRefreshBoard: m.retryBoard,
              onRetryWorkflowTrail: m.retryWorkflowTrail,
              operation: m.activeFailure.operation,
              refreshing: m.loading || m.workflowTrail.loading,
            }
          : null
      }
    />
  </>
);

const HrLeavePageBottom = ({ model: m }: { model: PageModel }) => (
  <>
    <HrLeaveQueueSection
      dataPresent={m.data !== null}
      loading={m.loading}
      queueRef={m.queueRef}
      unavailable={m.data === null && m.failure?.operation === 'board'}
      filters={{
        actionable: m.actionableCount,
        filter: m.filter,
        loading: m.loading,
        onChange: m.updateView,
        pending: m.pendingCount,
        total: m.totalCount,
        year: m.balanceYear,
        years: m.yearChoices,
      }}
      pager={{
        loading: m.loading,
        onChange: m.updateView,
        page: m.requestPage,
        size: HR_LEAVE_LIMIT,
        total: m.totalCount,
      }}
      table={{
        approveBusyId: m.mutations.approveBusyId,
        cancelBusyId: m.mutations.cancelBusyId,
        employeeLabel: m.employeeLabel,
        emptyLabel: 'No Requests In This Tab.',
        leaveTypeNameById: m.leaveTypeNameById,
        onApprove: (id, step) => void m.mutations.approve(id, step),
        onCancelOwn: (id) => void m.mutations.cancelOwn(id),
        onOpenTrail: m.openWorkflowTrail,
        onRejectClick: (leaveRequestId, pendingApprovalStepId) => {
          const target = leaveApprovalTarget(leaveRequestId, pendingApprovalStepId);
          if (!target) {
            m.setFailure({ message: LEAVE_APPROVAL_REFRESH_MESSAGE, operation: 'mutation' });
            return;
          }
          m.setRejectLeaveTarget(target);
        },
        rows: m.filteredRows,
        showApprovalColumn: m.showApprovalColumn,
        viewerId: m.viewerId,
      }}
    />

    <CompOffApprovalPanel key={authorizationStateKey(m.clientSession)} />
    <LeaveTeamCalendar />

    <HrLeaveWorkflowDialog
      trail={{
        employeeLabel: m.employeeLabel,
        isOpen: m.workflowTrail.summaryRow !== null,
        leaveTypeNameById: m.leaveTypeNameById,
        loading: m.workflowTrail.loading,
        onClose: m.workflowTrail.close,
        rows: m.workflowTrail.rows,
        summaryRow: m.workflowTrail.summaryRow,
      }}
    />
    <FlashToastBar toast={m.flash.flash} onDismiss={m.flash.clear} />
  </>
);

const HrLeavesPage = () => {
  const model = useHrLeavesPageModel();
  return (
    <div className="space-y-4">
      <HrLeavePageTop model={model} />
      <HrLeavePageBottom model={model} />
    </div>
  );
};

export default HrLeavesPage;
