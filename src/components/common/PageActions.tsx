import type { ReactNode } from 'react';

import { PageActionsContext } from './pageActionsContext';

const PageActions = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <PageActionsContext.Provider value>
    <div className={`ml-auto flex w-full flex-wrap items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  </PageActionsContext.Provider>
);

export default PageActions;
