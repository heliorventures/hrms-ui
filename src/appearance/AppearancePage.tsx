import { useState } from 'react';

import Card from '../components/common/Card';

import { useAppearance } from './appearanceContext';
import AppearanceNavigation from './AppearanceNavigation';
import AppearancePreview from './AppearancePreview';
import PalettePicker from './PalettePicker';
import PreferenceActions from './PreferenceActions';
import PreferenceControl from './PreferenceControl';
import { DEFAULT_APPEARANCE, parseAppearance, type AppearancePreferences } from './preferences';
import { APPEARANCE_SETTINGS, type AppearanceSection } from './settings';

const AppearancePage = () => {
  const { preferences, savePreferences } = useAppearance();
  const [draft, setDraft] = useState(preferences);
  const [section, setSection] = useState<AppearanceSection>('Colors & Themes');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(preferences);
  const change = (key: keyof AppearancePreferences, value: string | boolean) => {
    setDraft((current) => parseAppearance({ ...current, [key]: value }));
    setMessage('');
  };
  const save = () => {
    const saved = savePreferences(draft);
    setFailed(!saved);
    setMessage(
      saved
        ? 'Preferences saved in this browser.'
        : 'This browser could not save your preferences. Check its storage settings and try again.'
    );
  };
  return (
    <div className="space-y-4">
      <header>
        <h1 className="page-heading">Appearance</h1>
        <p className="mt-1 text-xs text-content-muted">Personal preferences for your workspace.</p>
      </header>
      <div className="grid items-start gap-4 lg:grid-cols-[10.5rem_minmax(0,1fr)] xl:grid-cols-[10.5rem_minmax(0,1fr)_17rem]">
        <AppearanceNavigation
          preferences={draft}
          onChange={change}
          section={section}
          onSectionChange={setSection}
        />
        <Card>
          <h2 className="mb-3 text-base font-semibold">{section}</h2>
          <div className="space-y-3">
            {APPEARANCE_SETTINGS[section].map((setting) => (
              <PreferenceControl
                key={setting.key}
                setting={setting}
                preferences={draft}
                onChange={change}
              />
            ))}
            {section === 'Colors & Themes' && (
              <PalettePicker value={draft.palette} onChange={(value) => change('palette', value)} />
            )}
            {section === 'Accessibility' && (
              <p className="text-xs text-content-muted">
                Keyboard focus and accessible names remain available. Status labels never depend on
                color alone.
              </p>
            )}
          </div>
          <PreferenceActions
            dirty={dirty}
            onSave={save}
            onReset={() => {
              setDraft({ ...DEFAULT_APPEARANCE });
              setFailed(false);
              setMessage('Defaults previewed. Save to apply.');
            }}
            onCancel={() => {
              setDraft(preferences);
              setMessage('Preview cancelled. Saved preferences restored.');
              setFailed(false);
            }}
          />
          <p
            role={failed ? 'alert' : 'status'}
            className={`mt-2 text-xs ${failed ? 'text-status-danger' : 'text-content-muted'}`}
          >
            {message}
          </p>
        </Card>
        <AppearancePreview preferences={draft} />
      </div>
    </div>
  );
};
export default AppearancePage;
