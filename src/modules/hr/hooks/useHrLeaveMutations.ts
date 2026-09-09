import { useCallback, useState } from 'react';

import {
  ApproveLeaveRequestDocument,
  CancelLeaveRequestDocument,
  type ApproveLeaveRequestMutationVariables,
} from '../../../api/graphql/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { LEAVE_APPROVAL_REFRESH_MESSAGE, leaveApprovalTarget } from '../../leave/leaveApproval';

type Client = ReturnType<typeof useGraphClient>;
type Failure = { message: string; operation: 'board' | 'mutation' };
interface MutationOptions {
  client: Client;
  clearWorkflowFailure: () => void;
  isCurrent: () => boolean;
  refresh: (preserveFailure?: boolean, removedRequestId?: string) => Promise<void>;
  setFailure: (failure: Failure | null) => void;
  showFlash: (message: string, tone: 'info' | 'success') => void;
}

export const useHrLeaveMutations = ({
  client,
  clearWorkflowFailure,
  isCurrent,
  refresh,
  setFailure,
  showFlash,
}: MutationOptions) => {
  const [approveBusyId, setApproveBusyId] = useState<string | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
  const [approveWorkflowNotice, setApproveWorkflowNotice] = useState<string | null>(null);

  const clearMutationState = useCallback(() => {
    setApproveBusyId(null);
    setCancelBusyId(null);
    setApproveWorkflowNotice(null);
  }, []);

  const approve = useCallback(
    async (leaveRequestId: string, pendingApprovalStepId?: string | null) => {
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
      clearWorkflowFailure();
      let approved = false;
      try {
        const result = await client.request(ApproveLeaveRequestDocument, variables);
        if (!isCurrent()) return;
        approved = true;
        const pending = result.approveLeaveRequest.status.toLowerCase() === 'pending';
        const pendingMessage =
          'Approval was recorded, but another workflow step may still be pending.';
        setApproveWorkflowNotice(pending ? pendingMessage : null);
        showFlash(
          pending ? pendingMessage : 'Leave request approved.',
          pending ? 'info' : 'success'
        );
      } catch (error) {
        setFailure({ message: graphQlUserMessage(error), operation: 'mutation' });
      } finally {
        if (isCurrent()) setApproveBusyId(null);
      }
      await refresh(true, approved ? leaveRequestId : undefined);
    },
    [client, clearWorkflowFailure, isCurrent, refresh, setFailure, showFlash]
  );

  const cancelOwn = useCallback(
    async (leaveRequestId: string) => {
      setCancelBusyId(leaveRequestId);
      setFailure(null);
      clearWorkflowFailure();
      let cancelled = false;
      try {
        await client.request(CancelLeaveRequestDocument, { leaveRequestId });
        if (!isCurrent()) return;
        cancelled = true;
        showFlash('Leave request cancelled.', 'success');
      } catch (error) {
        setFailure({ message: graphQlUserMessage(error), operation: 'mutation' });
      } finally {
        if (isCurrent()) setCancelBusyId(null);
      }
      await refresh(true, cancelled ? leaveRequestId : undefined);
    },
    [client, clearWorkflowFailure, isCurrent, refresh, setFailure, showFlash]
  );

  return {
    approve,
    approveBusyId,
    approveWorkflowNotice,
    cancelBusyId,
    cancelOwn,
    clearMutationState,
  };
};
