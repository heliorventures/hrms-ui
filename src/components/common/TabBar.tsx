import type { ReactNode } from 'react';

import { TAB_LIST_CLASS, tabClassName } from './tabStyles';

export type TabId = string;

type TabItem = { id: TabId; label: string; icon?: ReactNode };

type TabBarProps = {
  tabs: TabItem[];
  value: TabId;
  onChange: (id: TabId) => void;
  className?: string;
};

/**
 * Underline tab strip for product-style section switching (e.g. Insights, Onboarding + exit).
 */
const TabBar = ({ tabs, value, onChange, className = '' }: TabBarProps) => {
  return (
    <div className={`${TAB_LIST_CLASS} ${className}`} role="group" aria-label="View selection">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={tabClassName(active)}
          >
            {tab.icon ? <span aria-hidden="true">{tab.icon}</span> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
