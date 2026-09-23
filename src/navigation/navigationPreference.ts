export const NAVIGATION_COLLAPSED_KEY = 'heliorhrms.navigation.collapsed.v1';

type NavigationStorage = Pick<Storage, 'getItem' | 'setItem'>;

function browserStorage(): NavigationStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readDesktopNavigationCollapsed(
  storage: NavigationStorage | undefined = browserStorage()
): boolean {
  return readRememberedNavigationCollapsed(storage) ?? false;
}

export function readRememberedNavigationCollapsed(
  storage: NavigationStorage | undefined = browserStorage()
): boolean | null {
  try {
    const value = storage?.getItem(NAVIGATION_COLLAPSED_KEY);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

export function writeDesktopNavigationCollapsed(
  collapsed: boolean,
  storage: NavigationStorage | undefined = browserStorage()
): void {
  try {
    storage?.setItem(NAVIGATION_COLLAPSED_KEY, String(collapsed));
  } catch {
    // Navigation remains usable when storage is disabled or full.
  }
}
