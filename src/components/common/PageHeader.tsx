import type { ReactNode } from 'react';

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** e.g. primary actions, filters (right side on `sm+`) */
  actions?: ReactNode;
  className?: string;
};

/**
 * Consistent page title + subtitle used across module pages (aligns with common HRIS patterns:
 * clear hierarchy, supporting line, optional toolbar).
 */
const PageHeader = ({ title, description, actions, className = '' }: PageHeaderProps) => {
  return (
    <div
      className={`mb-6 flex flex-col gap-3 border-b border-line-subtle pb-5 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-content-primary">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-content-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
