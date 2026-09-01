import type { ReactNode } from 'react';

import AsyncState from './AsyncState';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <AsyncState kind="empty" title={title} description={description} action={action} />
);

export default EmptyState;
