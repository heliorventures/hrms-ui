import type { ReactNode } from 'react';

import type { PageTab } from '../../hooks/usePageTabs';

import { PageTabVisibilityContext } from './pageTabVisibilityContext';
import Tabs from './Tabs';

interface PageTabsProps {
  tabs: readonly PageTab[];
  value: string;
  onValueChange: (id: string) => void;
}

const panelId = (id: string) => `page-feature-${id}`;

const PageTabs = ({ tabs, value, onValueChange }: PageTabsProps) => (
  <Tabs
    tabs={tabs.map((tab) => ({ ...tab, panelId: panelId(tab.id) }))}
    value={value}
    onValueChange={onValueChange}
  />
);
export default PageTabs;

/** Keep inputs mounted so switching tasks does not discard filters or drafts.
 * Callers must permission-gate both tab definitions and restricted panels.
 */
export const PageTabPanel = ({
  id,
  activeTab,
  children,
}: {
  id: string;
  activeTab: string;
  children: ReactNode;
}) => (
  <PageTabVisibilityContext.Provider value={id === activeTab}>
    <section
      id={panelId(id)}
      role="tabpanel"
      aria-labelledby={`${panelId(id)}-tab`}
      hidden={id !== activeTab}
      tabIndex={0}
      className="min-w-0 space-y-4"
    >
      {children}
    </section>
  </PageTabVisibilityContext.Provider>
);
