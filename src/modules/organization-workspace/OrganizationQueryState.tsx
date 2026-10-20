import type { ReactNode } from 'react';

import Button from '../../components/common/Button';

interface Props {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

const OrganizationQueryState = ({
  loading,
  error,
  onRetry,
  empty,
  emptyMessage,
  children,
}: Props) => {
  if (loading) return <p role="status">Loading authorized company records…</p>;
  if (error)
    return (
      <div className="space-y-2">
        <p role="alert">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  if (empty)
    return (
      <p className="text-sm text-content-secondary">
        {emptyMessage ?? 'No records are available in your current company scope.'}
      </p>
    );
  return children;
};

export default OrganizationQueryState;
