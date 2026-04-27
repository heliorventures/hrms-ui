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
      className={`mb-6 flex flex-wrap gap-0.5 rounded-lg border border-slate-200/90 bg-slate-100/90 p-1 dark:border-slate-600/80 dark:bg-slate-800/60 ${className}`}
      role="tablist"
    >
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={
              active
                ? 'flex min-h-[2.5rem] items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-card dark:bg-slate-700 dark:text-white'
                : 'flex min-h-[2.5rem] items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-100'
            }
          >
            {t.icon ? <span className="shrink-0 opacity-80">{t.icon}</span> : null}
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
