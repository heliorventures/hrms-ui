import { useContext, type ReactNode } from 'react';

import { PageWorkspaceContext } from '../../navigation/pageWorkspaceContext';
import WorkspaceTaskSelector from '../../navigation/WorkspaceTaskSelector';

import { CompactPageContext } from './compactPageContext';
import PageActions from './PageActions';
import PageInformation from './PageInformation';
import PageInformationButton from './PageInformationButton';

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** e.g. primary actions, filters (right side on `sm+`) */
  actions?: ReactNode;
  /** A local task selector; omit to use the current route workspace. */
  selector?: ReactNode;
  className?: string;
  /** Keep record names, report periods, and other contextual titles visible. */
  retainTitle?: boolean;
  tourAnchor?: string;
};

/** Page title and actions; supporting descriptions join the anchored information popover. */
const PageHeader = ({
  title,
  description,
  actions,
  selector,
  className = '',
  retainTitle = false,
  tourAnchor,
}: PageHeaderProps) => {
  const compact = useContext(CompactPageContext) && !retainTitle;
  const workspace = useContext(PageWorkspaceContext);
  const heading = !retainTitle && selector === undefined ? (workspace?.title ?? title) : title;
  return (
    <div
      className={`app-page-header flex min-h-8 flex-wrap items-center gap-2 ${className}`}
      data-tour-anchor={tourAnchor}
    >
      <div data-optional-heading={compact || undefined} className="min-w-0">
        <h1 className="page-heading">{heading}</h1>
      </div>
      <PageInformationButton />
      {selector === undefined ? <WorkspaceTaskSelector /> : selector}
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
