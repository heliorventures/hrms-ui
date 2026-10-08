import type { LucideIcon } from 'lucide-react';

import Select from '../../../../components/common/Select';

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
      <div data-tour-anchor="profile-section-navigation" data-active-profile-section={activeId}>
        <Select
          data-tour-anchor={`profile-section-${activeId}`}
          aria-label="Employee Profile Sections"
          value={activeId}
          onChange={(event) => onChange(event.target.value)}
          options={tabs.map((tab) => ({ value: tab.id, label: tab.label }))}
          className="max-w-full sm:w-60"
        />
      </div>
    </div>
  );
};
