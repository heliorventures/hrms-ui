import { useContext, type ReactNode } from 'react';

import { CompactPageContext } from './compactPageContext';
import PageActions from './PageActions';
import PageInformation from './PageInformation';

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** e.g. primary actions, filters (right side on `sm+`) */
  actions?: ReactNode;
  className?: string;
  /** Keep record names, report periods, and other contextual titles visible. */
  retainTitle?: boolean;
};

/** Page title and actions; supporting descriptions join the shared information drawer. */
const PageHeader = ({
  title,
  description,
  actions,
  className = '',
  retainTitle = false,
}: PageHeaderProps) => {
  const compact = useContext(CompactPageContext) && !retainTitle;
  return (
    <div
      className={`${compact && !actions ? '' : 'mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'} ${className}`}
    >
      <div className={compact ? 'sr-only' : 'min-w-0 flex-1'}>
        <h1 className="text-2xl font-semibold tracking-tight text-content-primary">{title}</h1>
      </div>
      {actions ? <PageActions className="sm:w-auto">{actions}</PageActions> : null}
      {description ? (
        <PageInformation title={title}>
          <p>{description}</p>
        </PageInformation>
      ) : null}
    </div>
  );
};

export default PageHeader;
