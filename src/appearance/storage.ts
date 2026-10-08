import { parseAppearance, type AppearancePreferences } from './preferences';

export const APPEARANCE_STORAGE_KEY = 'heliorhrms.appearance.v1';

export function appearanceStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readAppearance(
  storage = appearanceStorage() as Pick<Storage, 'getItem'> | undefined
): AppearancePreferences | null {
  try {
    const raw = storage?.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return null;
    const document: unknown = JSON.parse(raw);
    if (
      !document ||
      typeof document !== 'object' ||
      !('version' in document) ||
      document.version !== 1
    )
      return null;
    return parseAppearance('preferences' in document ? document.preferences : undefined);
  } catch {
    return null;
  }
}

export function saveAppearance(
  preferences: AppearancePreferences,
  storage = appearanceStorage() as Pick<Storage, 'setItem'> | undefined
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ version: 1, preferences }));
    return true;
  } catch {
    return false;
  }
}
