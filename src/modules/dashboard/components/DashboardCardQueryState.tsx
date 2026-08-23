import AsyncState from '../../../components/common/AsyncState';
import Button from '../../../components/common/Button';
import PageNotice from '../../../components/common/PageNotice';
import { type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';

interface DashboardCardInitialStateProps {
  error: string | null;
  errorTitle: string;
  loadingTitle: string;
  onRetry: () => void;
  phase: Extract<RetainedQueryPhase, 'initial-error' | 'initial-loading'>;
}

export const DashboardCardInitialState = ({
  error,
  errorTitle,
  loadingTitle,
  onRetry,
  phase,
}: DashboardCardInitialStateProps) => {
  if (phase === 'initial-loading') {
    return <AsyncState kind="loading" title={loadingTitle} />;
  }

  return (
    <AsyncState
      kind="error"
      title={errorTitle}
      description={error ?? 'Try again.'}
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      }
    />
  );
};

interface DashboardCardRefreshNoticeProps {
  error: string | null;
  loadingDescription: string;
  loadingTitle: string;
  onRetry: () => void;
  phase: RetainedQueryPhase;
  staleDescription: string;
  staleTitle: string;
}

export const DashboardCardRefreshNotice = ({
  error,
  loadingDescription,
  loadingTitle,
  onRetry,
  phase,
  staleDescription,
  staleTitle,
}: DashboardCardRefreshNoticeProps) => {
  if (phase === 'refreshing') {
    return (
      <PageNotice variant="info" title={loadingTitle} className="mb-4">
        {loadingDescription}
      </PageNotice>
    );
  }

  if (phase !== 'stale-error') return null;

  return (
    <PageNotice
      variant="warning"
      title={staleTitle}
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      }
      className="mb-4"
    >
      {staleDescription} {error}
    </PageNotice>
  );
};
