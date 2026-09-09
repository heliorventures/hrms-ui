import { useState } from 'react';

import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import { useFlashToast } from '../../../hooks/useFlashToast';
import {
  LEAVE_APPROVAL_REFRESH_MESSAGE,
  leaveApprovalTarget,
  type LeaveApprovalTarget,
} from '../leaveApproval';

import { useAllCompanyHolidays } from './useAllCompanyHolidays';
import { useLeaveWorkflowTrail } from './useLeaveWorkflowTrail';
import { usePersonalLeaveActions } from './usePersonalLeaveActions';
import { usePersonalLeaveBoard, type PersonalLeaveClient } from './usePersonalLeaveBoard';
import { usePersonalLeaveLabels } from './usePersonalLeaveLabels';
import { usePersonalLeaveNavigation } from './usePersonalLeaveNavigation';

export type PersonalLeaveOptions = {
  client: PersonalLeaveClient;
  balanceYear: number;
  requestPage: number;
  yearChoices: number[];
  updateView: (change: Partial<{ year: string; page: string }>) => void;
  canSubmitLeave: boolean;
  canApproveLeave: boolean;
  canManageLeave: boolean;
};
export function usePersonalLeaveModel(options: PersonalLeaveOptions) {
  const { client, balanceYear, requestPage, canSubmitLeave, canApproveLeave } = options;
  const flash = useFlashToast();
  const workflowTrail = useLeaveWorkflowTrail(client);
  const allHolidays = useAllCompanyHolidays(client, 450);
  const board = usePersonalLeaveBoard(client, balanceYear, requestPage);
  const navigation = usePersonalLeaveNavigation(canSubmitLeave, board.loading);
  const labels = usePersonalLeaveLabels(board.data, canApproveLeave, requestPage);
  const actions = usePersonalLeaveActions({
    client,
    board,
    canApproveLeave,
    canSubmitLeave,
    flash,
    clearWorkflowFailure: workflowTrail.clearFailure,
  });
  const [rejectLeaveTarget, setRejectLeaveTarget] = useState<LeaveApprovalTarget | null>(null);
  const refreshBoard = async () => {
    if (!board.isCurrent()) return;
    workflowTrail.clearFailure();
    await board.refresh();
  };
  const onRejected = () => {
    if (!board.isCurrent()) return;
    board.setFailure(null);
    workflowTrail.clearFailure();
    flash.show('Leave request rejected.', 'success');
    void board.refresh(true);
  };
  const onRejectClick = (id: string, step?: string | null) => {
    if (!canApproveLeave || !board.isCurrent()) return;
    const target = leaveApprovalTarget(id, step);
    if (!target) {
      board.setFailure({ message: LEAVE_APPROVAL_REFRESH_MESSAGE, operation: 'mutation' });
      return;
    }
    setRejectLeaveTarget(target);
  };
  const openWorkflowTrail = (row: LeaveBoardQuery['leaveRequests'][number]) => {
    if (!board.isCurrent()) return;
    board.setFailure(null);
    void workflowTrail.open(row);
  };
  return {
    ...options,
    ...board,
    ...navigation,
    ...labels,
    ...actions,
    flash,
    workflowTrail,
    allHolidays,
    rejectLeaveTarget,
    setRejectLeaveTarget,
    refreshBoard,
    onRejected,
    onRejectClick,
    openWorkflowTrail,
    retryBoard: () => {
      void refreshBoard();
    },
    retryWorkflowTrail: () => {
      void workflowTrail.retry();
    },
    activeFailure: workflowTrail.failure ?? board.failure,
  };
}
export type PersonalLeaveModel = ReturnType<typeof usePersonalLeaveModel>;
