import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import { useFlashToast } from '../../../hooks/useFlashToast';

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
  canManageLeave: boolean;
};
export function usePersonalLeaveModel(options: PersonalLeaveOptions) {
  const { client, balanceYear, requestPage, canSubmitLeave } = options;
  const flash = useFlashToast();
  const workflowTrail = useLeaveWorkflowTrail(client);
  const allHolidays = useAllCompanyHolidays(client, 450);
  const board = usePersonalLeaveBoard(client, balanceYear, requestPage);
  const navigation = usePersonalLeaveNavigation(canSubmitLeave, board.loading);
  const labels = usePersonalLeaveLabels(board.data, requestPage);
  const actions = usePersonalLeaveActions({
    client,
    board,
    canSubmitLeave,
    flash,
    clearWorkflowFailure: workflowTrail.clearFailure,
  });
  const refreshBoard = async () => {
    if (!board.isCurrent()) return;
    workflowTrail.clearFailure();
    await board.refresh();
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
    refreshBoard,
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
