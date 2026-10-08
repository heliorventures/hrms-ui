import { readThemePreference } from '../contexts/themePreference';

import { DEFAULT_APPEARANCE, type AppearancePreferences } from './preferences';
import { readAppearance } from './storage';

export function initialAppearance(): AppearancePreferences {
  return readAppearance() ?? { ...DEFAULT_APPEARANCE, mode: readThemePreference() ?? 'system' };
}
