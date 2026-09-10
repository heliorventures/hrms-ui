import type { LucideIcon } from 'lucide-react';

import { TAB_LIST_CLASS, tabClassName } from '../../../../components/common/tabStyles';

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

export const TabNavigation = ({ tabs, activeId, onChange }: TabNavigationProps) => {
  return (
    <div className="min-w-0">
      <div className={TAB_LIST_CLASS} role="tablist" aria-label="Employee Profile Sections">
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
              className={tabClassName(active)}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
