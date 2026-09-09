import type { ReactNode } from 'react';

import PageInformation from './PageInformation';

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** e.g. primary actions, filters (right side on `sm+`) */
  actions?: ReactNode;
  className?: string;
};

/** Page title and actions; supporting descriptions join the shared information drawer. */
const PageHeader = ({ title, description, actions, className = '' }: PageHeaderProps) => {
  return (
    <div
      className={`mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-content-primary">{title}</h1>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      {description ? (
        <PageInformation title={title}>
          <p>{description}</p>
        </PageInformation>
      ) : null}
    </div>
  );
};

export default PageHeader;
