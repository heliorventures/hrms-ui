import { describe, expect, it } from 'vitest';

import {
  NAVIGATION_COLLAPSED_KEY,
  readDesktopNavigationCollapsed,
  writeDesktopNavigationCollapsed,
} from './navigationPreference';

function createStorage(initialValue: string | null = null) {
  let value = initialValue;
  return {
    getItem: (key: string) => (key === NAVIGATION_COLLAPSED_KEY ? value : null),
    setItem: (key: string, nextValue: string) => {
      if (key === NAVIGATION_COLLAPSED_KEY) value = nextValue;
    },
  };
}

describe('desktop navigation preference', () => {
  it('defaults to expanded when no preference exists', () => {
    expect(readDesktopNavigationCollapsed(createStorage())).toBe(false);
  });

  it('restores only an explicitly collapsed preference', () => {
    expect(readDesktopNavigationCollapsed(createStorage('true'))).toBe(true);
    expect(readDesktopNavigationCollapsed(createStorage('false'))).toBe(false);
    expect(readDesktopNavigationCollapsed(createStorage('unexpected'))).toBe(false);
  });

  it('persists the current collapsed state', () => {
    const storage = createStorage();
    writeDesktopNavigationCollapsed(true, storage);
    expect(readDesktopNavigationCollapsed(storage)).toBe(true);
    writeDesktopNavigationCollapsed(false, storage);
    expect(readDesktopNavigationCollapsed(storage)).toBe(false);
  });

  it('fails safely when browser storage is unavailable', () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(readDesktopNavigationCollapsed(unavailableStorage)).toBe(false);
    expect(() => writeDesktopNavigationCollapsed(true, unavailableStorage)).not.toThrow();
  });
});
