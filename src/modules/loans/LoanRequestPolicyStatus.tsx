import Button from '../../components/common/Button';
import FeedbackToast from '../../components/common/FeedbackToast';
import type { RetainedQueryPhase } from '../../hooks/useRetainedQuery';

interface Props {
  phase: RetainedQueryPhase;
  error: string | null;
  count: number;
  onRetry: () => void;
}
const LoanRequestPolicyStatus = ({ phase, error, count, onRetry }: Props) => {
  if (error)
    return (
      <FeedbackToast
        action={
          <Button variant="secondary" onClick={onRetry}>
            Reload policies
          </Button>
        }
      >
        {error}
      </FeedbackToast>
    );
  if (phase === 'initial-loading')
    return (
      <p role="status" className="text-sm text-content-secondary">
        Loading eligible company policies…
      </p>
    );
  if (count === 0)
    return (
      <p className="mt-2 text-sm text-content-secondary">
        HR must publish an eligible company loan policy before a request can be placed.
      </p>
    );
  return null;
};
export default LoanRequestPolicyStatus;
