import type { LucideIcon } from 'lucide-react';

export interface ProfileTabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  hrOnly?: boolean;
}

interface TabNavigationProps {
  tabs: ProfileTabDef[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabNavigation({ tabs, activeId, onChange }: TabNavigationProps) {
  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <nav
        className="flex min-w-max gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-700/80 dark:bg-slate-900/40"
        role="tablist"
        aria-label="Employee Profile Sections"
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                active
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-indigo-300 dark:ring-slate-600'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
