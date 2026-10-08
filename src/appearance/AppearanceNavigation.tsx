import PreferenceControl, { type PreferenceControlProps } from './PreferenceControl';
import { APPEARANCE_WORKSPACES } from './sectionWorkspaces';
import { MODE_SETTING, type AppearanceSection } from './settings';

interface Props extends Omit<PreferenceControlProps, 'setting'> {
  section: AppearanceSection;
  onSectionChange: (section: AppearanceSection) => void;
}
const AppearanceNavigation = ({ preferences, onChange, section, onSectionChange }: Props) => (
  <aside className="space-y-4">
    <PreferenceControl setting={MODE_SETTING} preferences={preferences} onChange={onChange} />
    <nav
      aria-label="Appearance sections"
      className="flex flex-wrap gap-1 lg:flex-col"
      data-tour-anchor="appearance-sections"
    >
      {APPEARANCE_WORKSPACES.map(({ label, sections }) => (
        <button
          key={label}
          type="button"
          aria-pressed={sections.includes(section)}
          onClick={() => onSectionChange(sections.includes(section) ? section : sections[0])}
          className={`app-button min-h-11 rounded-lg px-3 py-2 text-left text-sm ${sections.includes(section) ? 'bg-surface-selected font-semibold text-accent' : 'text-content-secondary hover:bg-surface-selected'}`}
        >
          {label}
        </button>
      ))}
    </nav>
  </aside>
);
export default AppearanceNavigation;
