import { useRef, useState } from 'react';

import {
  ApproveSeparationWithFinanceDocument,
  CancelExitFinanceApprovalDocument,
  type ExitApprovalOperationQuery,
} from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import FinanceMessage from './FinanceMessage';

interface Props {
  separationId: string;
  operation: NonNullable<ExitApprovalOperationQuery['exitApprovalOperation']>;
  onSaved: () => Promise<void>;
  reload: () => Promise<void>;
}
const ExitApprovalRecovery = ({ separationId, operation, onSaved, reload }: Props) => {
  const client = useGraphClient();
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const act = async (cancel: boolean) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      if (cancel) {
        await client.request(CancelExitFinanceApprovalDocument, { operationId: operation.id });
        await reload();
      } else {
        if (operation.state === 'REGISTERED')
          await client.request(ApproveSeparationWithFinanceDocument, {
            separationId,
            financeReviewId: operation.reviewId,
          });
        await onSaved();
      }
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <FinanceMessage messages={[error]} />
      <p>A saved financial approval already exists. Review reference: {operation.reviewId}.</p>
      {operation.state === 'COMMITTED' ? (
        <>
          <p>The resignation approval is recorded. Refresh the exit records to see the result.</p>
          <Button disabled={busy} onClick={() => void act(false)}>
            Refresh exit records
          </Button>
        </>
      ) : (
        <>
          <p>
            Resume the previously reviewed approval. To change the financial decision, cancel this
            pending operation first. Financial holds remain until cancellation is reconciled.
          </p>
          {!operation.canResume && <p>The HR user who started this approval must resume it.</p>}
          <Button disabled={busy || !operation.canResume} onClick={() => void act(false)}>
            Resume saved approval
          </Button>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={busy}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            Cancel this pending approval so HR can prepare a new financial decision.
          </label>
          <Button
            variant="secondary"
            disabled={busy || !acknowledged}
            onClick={() => void act(true)}
          >
            Cancel pending approval
          </Button>
        </>
      )}
    </div>
  );
};
export default ExitApprovalRecovery;
