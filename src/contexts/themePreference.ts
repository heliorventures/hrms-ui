export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'heliorhrms.theme.v1';

const LEGACY_THEME_STORAGE_KEY = 'theme';
const THEME_COLORS: Record<Theme, string> = {
  light: '#f8fafc',
  dark: '#020617',
};

type ThemePreferenceStorage = Pick<Storage, 'getItem' | 'removeItem'> &
  Partial<Pick<Storage, 'setItem'>>;

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function getDefaultStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readThemePreference(
  storage: ThemePreferenceStorage | undefined = getDefaultStorage()
): Theme | null {
  if (!storage) {
    return null;
  }

  let preference: string | null;
  try {
    preference = storage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }

  if (preference !== null) {
    return isTheme(preference) ? preference : null;
  }

  let legacyPreference: string | null;
  try {
    legacyPreference = storage.getItem(LEGACY_THEME_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!isTheme(legacyPreference)) {
    return null;
  }

  try {
    if (!storage.setItem) {
      return legacyPreference;
    }
    storage.setItem(THEME_STORAGE_KEY, legacyPreference);
  } catch {
    return legacyPreference;
  }

  try {
    storage.removeItem(LEGACY_THEME_STORAGE_KEY);
  } catch {
    // The namespaced preference is already durable; stale legacy cleanup is best effort.
  }

  return legacyPreference;
}

export function resolveInitialTheme(preference: Theme | null, prefersDark: boolean): Theme {
  return preference ?? (prefersDark ? 'dark' : 'light');
}

export function persistThemePreference(theme: Theme, storage?: Pick<Storage, 'setItem'>): void {
  try {
    const targetStorage = storage ?? getDefaultStorage();
    targetStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Privacy settings can block storage; the active document theme still applies.
  }
}

export function applyDocumentTheme(theme: Theme, documentRoot?: HTMLElement): void {
  const root =
    documentRoot ?? (typeof document === 'undefined' ? undefined : document.documentElement);
  if (!root) {
    return;
  }

  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;

  const { ownerDocument } = root;

  let themeColor = ownerDocument.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!themeColor) {
    themeColor = ownerDocument.createElement('meta');
    themeColor.name = 'theme-color';
    ownerDocument.head.append(themeColor);
  }
  themeColor.content = THEME_COLORS[theme];
}
