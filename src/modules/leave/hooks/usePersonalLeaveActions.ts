import { useRef, useState } from 'react';

import {
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  type ApproveLeaveRequestMutationVariables,
} from '../../../api/graphql/graphql';
import type { useFlashToast } from '../../../hooks/useFlashToast';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { LEAVE_APPROVAL_REFRESH_MESSAGE, leaveApprovalTarget } from '../leaveApproval';

import type { PersonalLeaveClient, usePersonalLeaveBoard } from './usePersonalLeaveBoard';

type Options = {
  client: PersonalLeaveClient;
  board: ReturnType<typeof usePersonalLeaveBoard>;
  canApproveLeave: boolean;
  canSubmitLeave: boolean;
  flash: ReturnType<typeof useFlashToast>;
  clearWorkflowFailure: () => void;
};
export function usePersonalLeaveActions({
  client,
  board,
  canApproveLeave,
  canSubmitLeave,
  flash,
  clearWorkflowFailure,
}: Options) {
  const { setFailure } = board;
  const busy = useRef(false);
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);
  const recordApproval = (status: string) => {
    const pending = status.toLowerCase() === 'pending';
    const pendingMessage = 'Approval was recorded, but another workflow step may still be pending.';
    setApproveWorkflowNotice(pending ? pendingMessage : null);
    flash.show(pending ? pendingMessage : 'Leave request approved.', pending ? 'info' : 'success');
  };
  const handleApprove = async (leaveRequestId: string, pendingApprovalStepId?: string | null) => {
    if (!canApproveLeave || !board.isCurrent() || busy.current) return;
    const target = leaveApprovalTarget(leaveRequestId, pendingApprovalStepId);
    if (!target) {
      setFailure({ message: LEAVE_APPROVAL_REFRESH_MESSAGE, operation: 'mutation' });
      return;
    }
    const variables: ApproveLeaveRequestMutationVariables = {
      leaveRequestId: target.leaveRequestId,
      expectedWorkflowStepId: target.expectedWorkflowStepId,
    };
    busy.current = true;
    setApproveBusyId(leaveRequestId);
    setApproveWorkflowNotice(null);
    setFailure(null);
    clearWorkflowFailure();
    try {
      const result = await client.request(ApproveLeaveRequestDocument, variables);
      if (!board.isCurrent()) return;
      recordApproval(result.approveLeaveRequest.status);
    } catch (err) {
      if (!board.isCurrent()) return;
      setFailure({ message: graphQlUserMessage(err), operation: 'mutation' });
    } finally {
      busy.current = false;
      if (board.isCurrent()) setApproveBusyId(null);
    }
    await board.refresh(true);
  };

  const handleCancelOwn = async (leaveRequestId: string) => {
    if (!canSubmitLeave || !board.isCurrent() || busy.current) return;
    busy.current = true;
    setCancelBusyId(leaveRequestId);
    setFailure(null);
    clearWorkflowFailure();
    try {
      await client.request(CancelLeaveRequestDocument, { leaveRequestId });
      if (!board.isCurrent()) return;
      flash.show('Leave request cancelled.', 'success');
    } catch (err) {
      if (!board.isCurrent()) return;
      setFailure({ message: graphQlUserMessage(err), operation: 'mutation' });
    } finally {
      busy.current = false;
      if (board.isCurrent()) setCancelBusyId(null);
    }
    await board.refresh(true);
  };

  return {
    approveBusyId,
    cancelBusyId,
    approveWorkflowNotice,
    handleApprove: (id: string, step?: string | null) => {
      void handleApprove(id, step);
    },
    handleCancelOwn: (id: string) => {
      void handleCancelOwn(id);
    },
  };
}
