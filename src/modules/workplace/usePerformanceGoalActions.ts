import { useCallback, useRef, useState } from 'react';

import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

interface ActionResult {
  participantId: string;
  kind: 'error' | 'notice';
  message: string;
}

interface RunGoalActionOptions {
  participantId: string;
  operation: () => Promise<void>;
  successMessage: string;
  isCurrent: () => boolean;
}

/**
 * Serializes mutations that change a participant's goal set, including approval.
 * A completion is only presented while the participant that initiated it is active.
 */
export const usePerformanceGoalActions = () => {
  const pendingParticipantIds = useRef(new Set<string>());
  const [busyParticipantIds, setBusyParticipantIds] = useState<ReadonlySet<string>>(new Set());
  const [result, setResult] = useState<ActionResult | null>(null);

  const runGoalAction = useCallback(
    async ({
      participantId,
      operation,
      successMessage,
      isCurrent,
    }: RunGoalActionOptions): Promise<boolean> => {
      if (pendingParticipantIds.current.has(participantId)) return false;

      pendingParticipantIds.current.add(participantId);
      setBusyParticipantIds(new Set(pendingParticipantIds.current));
      setResult(null);

      try {
        await operation();
        if (isCurrent()) {
          setResult({ participantId, kind: 'notice', message: successMessage });
        }
        return true;
      } catch (cause) {
        if (isCurrent()) {
          setResult({ participantId, kind: 'error', message: graphQlUserMessage(cause) });
        }
        return false;
      } finally {
        pendingParticipantIds.current.delete(participantId);
        setBusyParticipantIds(new Set(pendingParticipantIds.current));
      }
    },
    []
  );

  const clearResult = useCallback(() => setResult(null), []);

  return {
    busyParticipantIds,
    clearResult,
    isBusy: (participantId: string) => busyParticipantIds.has(participantId),
    result,
    runGoalAction,
  };
};
