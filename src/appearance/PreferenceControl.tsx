import { useId } from 'react';

import type { AppearancePreferences } from './preferences';
import type { AppearanceSetting } from './settings';

export interface PreferenceControlProps {
  setting: AppearanceSetting;
  preferences: AppearancePreferences;
  onChange: (key: keyof AppearancePreferences, value: string | boolean) => void;
}

const PreferenceControl = ({ setting, preferences, onChange }: PreferenceControlProps) => {
  const id = useId();
  if (!setting.options) {
    return (
      <label className="appearance-option" htmlFor={id}>
        <span>
          <span className="block font-medium">{setting.label}</span>
          <span className="text-xs text-content-muted">{setting.description}</span>
        </span>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={preferences[setting.key] === true}
          onChange={(event) => onChange(setting.key, event.target.checked)}
          className="appearance-switch"
        />
      </label>
    );
  }
  return (
    <fieldset className="appearance-choice">
      <legend className="font-medium">{setting.label}</legend>
      <p className="mb-2 text-xs text-content-muted">{setting.description}</p>
      <div className="flex flex-wrap gap-1">
        {setting.options.map(([value, label]) => (
          <label key={value} className="appearance-radio">
            <input
              type="radio"
              name={id}
              value={value}
              checked={preferences[setting.key] === value}
              onChange={() => onChange(setting.key, value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
export default PreferenceControl;
