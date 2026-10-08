import { useContext, useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import PageInformationButton from './PageInformationButton';
import { PageInformationContext } from './pageInformationContext';
import PageInformationProvider from './PageInformationProvider';
import { PageTabVisibilityContext } from './pageTabVisibilityContext';

interface PageInformationProps {
  title: string;
  children: ReactNode;
}

/** Secondary reference content only. Keep errors and action-critical guidance on the page. */
const PageInformation = ({ title, children }: PageInformationProps) => {
  const information = useContext(PageInformationContext);
  const isActive = useContext(PageTabVisibilityContext);
  const id = useId();
  const register = information?.register;

  useEffect(() => (isActive ? register?.(id) : undefined), [register, id, isActive]);

  if (!isActive) return null;

  // Standalone pages and embedded views remain usable outside an application shell.
  if (!information) {
    return (
      <PageInformationProvider scopeKey={id}>
        <div className="flex justify-end">
          <PageInformationButton />
        </div>
        <PageInformation title={title}>{children}</PageInformation>
      </PageInformationProvider>
    );
  }

  if (!information.target) return null;
  return createPortal(
    <section aria-labelledby={id} className="space-y-3 text-sm text-content-secondary">
      <h2 id={id} className="font-semibold text-content-primary">
        {title}
      </h2>
      {children}
    </section>,
    information.target
  );
};

export default PageInformation;
