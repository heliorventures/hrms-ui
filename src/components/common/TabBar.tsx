import type { ReactNode } from 'react';

export type TabId = string;

type TabItem = { id: TabId; label: string; icon?: ReactNode };

type TabBarProps = {
  tabs: TabItem[];
  value: TabId;
  onChange: (id: TabId) => void;
  className?: string;
};

/**
 * Pill-style tab strip for product-style section switching (e.g. Insights, Onboarding + exit).
 */
const TabBar = ({ tabs, value, onChange, className = '' }: TabBarProps) => {
  return (
    <div
      className={`flex flex-wrap gap-1 rounded-lg border border-line bg-canvas p-1 ${className}`}
      role="group"
      aria-label="View selection"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              active
                ? 'bg-surface font-semibold text-content-primary shadow-card'
                : 'font-medium text-content-secondary hover:bg-surface-selected'
            }`}
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
