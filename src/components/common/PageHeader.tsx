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
      className={`app-page-header mb-3 flex flex-wrap items-center justify-between gap-2 ${className}`}
    >
      <div data-optional-heading={compact || undefined} className="min-w-0 flex-1">
        <h1 className="page-heading">{title}</h1>
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
