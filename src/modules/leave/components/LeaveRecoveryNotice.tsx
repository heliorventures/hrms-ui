import Button from '../../../components/common/Button';
import PageNotice from '../../../components/common/PageNotice';

export interface LeaveRecoveryNoticeProps {
  message: string;
  operation: 'board' | 'mutation' | 'workflowTrail';
  onRefreshBoard: () => void;
  onRetryWorkflowTrail?: () => void;
  refreshing?: boolean;
}

const LeaveRecoveryNotice = ({
  message,
  operation,
  onRefreshBoard,
  onRetryWorkflowTrail,
  refreshing = false,
}: LeaveRecoveryNoticeProps) => {
  const isWorkflowTrailFailure = operation === 'workflowTrail';
  const title = isWorkflowTrailFailure
    ? 'Leave request history is unavailable'
    : operation === 'mutation'
      ? 'Leave request action was not completed'
      : 'Leave requests need attention';
  const actionLabel = isWorkflowTrailFailure
    ? 'Retry request history'
    : 'Refresh leave requests';
  const onRecovery = isWorkflowTrailFailure ? onRetryWorkflowTrail : onRefreshBoard;

  return (
    <PageNotice
      variant="error"
      title={title}
      focusOnMount
      action={
        <Button
          type="button"
          variant="outline"
          onClick={onRecovery}
          disabled={refreshing || !onRecovery}
        >
          {actionLabel}
        </Button>
      }
    >
      {message}
    </PageNotice>
  );
};

export default LeaveRecoveryNotice;
