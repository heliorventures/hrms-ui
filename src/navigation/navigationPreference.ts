export const NAVIGATION_COLLAPSED_KEY = 'heliorhrms.navigation.collapsed.v1';

type NavigationStorage = Pick<Storage, 'getItem' | 'setItem'>;

function browserStorage(): NavigationStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
}

export function readDesktopNavigationCollapsed(
  storage: NavigationStorage | undefined = browserStorage()
): boolean {
  try {
    return storage?.getItem(NAVIGATION_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
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
