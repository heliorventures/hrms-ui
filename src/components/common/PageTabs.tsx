import type { ReactNode } from 'react';

import type { PageTab } from '../../hooks/usePageTabs';

import { PageTabVisibilityContext } from './pageTabVisibilityContext';
import Select from './Select';
import Tabs from './Tabs';

interface PageTabsProps {
  tabs: readonly PageTab[];
  value: string;
  onValueChange: (id: string) => void;
}

const panelId = (id: string) => `page-feature-${id}`;

const PageTabs = ({ tabs, value, onValueChange }: PageTabsProps) =>
  tabs.length > 4 ? (
    <Select
      aria-label="Page section"
      aria-controls={panelId(value)}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      options={tabs.map((tab) => ({
        value: tab.id,
        label: tab.label,
        id: `${panelId(tab.id)}-tab`,
      }))}
      className="max-w-full sm:w-60"
    />
  ) : (
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
  label,
  children,
}: {
  id: string;
  activeTab: string;
  label?: string;
  children: ReactNode;
}) => (
  <PageTabVisibilityContext.Provider value={id === activeTab}>
    <section
      id={panelId(id)}
      role="tabpanel"
      aria-labelledby={label ? undefined : `${panelId(id)}-tab`}
      aria-label={label}
      hidden={id !== activeTab}
      tabIndex={0}
      className="min-w-0 space-y-4"
    >
      {children}
    </section>
  </PageTabVisibilityContext.Provider>
);
