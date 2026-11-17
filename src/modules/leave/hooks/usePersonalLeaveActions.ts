import { useRef, useState } from 'react';

import { CancelLeaveRequestDocument } from '../../../api/graphql/graphql';
import type { useFlashToast } from '../../../hooks/useFlashToast';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import type { PersonalLeaveClient, usePersonalLeaveBoard } from './usePersonalLeaveBoard';

type Options = {
  client: PersonalLeaveClient;
  board: ReturnType<typeof usePersonalLeaveBoard>;
  canSubmitLeave: boolean;
  flash: ReturnType<typeof useFlashToast>;
  clearWorkflowFailure: () => void;
};
export function usePersonalLeaveActions({
  client,
  board,
  canSubmitLeave,
  flash,
  clearWorkflowFailure,
}: Options) {
  const { setFailure } = board;
  const busy = useRef(false);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);

  const ownsPendingRequest = (leaveRequestId: string) =>
    board.data?.leaveRequests.some(
      (request) =>
        request.id === leaveRequestId &&
        request.employeeId === board.data?.viewerEmployeeId &&
        request.status.toLowerCase() === 'pending'
    ) === true;

  const handleCancelOwn = async (leaveRequestId: string) => {
    if (
      !canSubmitLeave ||
      !board.isCurrent() ||
      busy.current ||
      !ownsPendingRequest(leaveRequestId)
    )
      return;
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
    cancelBusyId,
    handleCancelOwn: (id: string) => {
      void handleCancelOwn(id);
    },
  };
}
