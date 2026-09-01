import type { ReactNode } from 'react';

import Card from './Card';
import Skeleton from './Skeleton';

export interface MetricCardProps {
  label: string;
  value?: ReactNode;
  context?: string;
  state?: 'ready' | 'loading' | 'unavailable' | 'error';
  action?: ReactNode;
}

const MetricCard = ({ label, value, context, state = 'ready', action }: MetricCardProps) => {
  const valueIsMissing = value === null || value === undefined;
  const effectiveState = state === 'ready' && valueIsMissing ? 'unavailable' : state;
  const normalizedLabel = label.charAt(0).toLowerCase() + label.slice(1);

  return (
    <Card>
      <p className="text-sm font-medium text-content-secondary">{label}</p>
      {effectiveState === 'loading' ? (
        <div role="status" aria-live="polite" aria-atomic="true" className="mt-3">
          <span className="sr-only">Loading {normalizedLabel}.</span>
          <Skeleton className="h-8 w-24" />
        </div>
      ) : null}
      {effectiveState === 'ready' ? (
        <div className="mt-2 text-2xl font-semibold tabular-nums text-content-primary">{value}</div>
      ) : null}
      {effectiveState === 'unavailable' ? (
        <p className="mt-2 text-base font-semibold text-content-muted">Unavailable</p>
      ) : null}
      {effectiveState === 'error' ? (
        <p role="alert" className="mt-2 text-sm font-medium text-status-danger">
          {label} could not be loaded.
        </p>
      ) : null}
      {context ? <p className="mt-1 text-sm text-content-secondary">{context}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
};

export default MetricCard;
