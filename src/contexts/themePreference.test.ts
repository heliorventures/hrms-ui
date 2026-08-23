// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
  THEME_STORAGE_KEY,
  applyDocumentTheme,
  persistThemePreference,
  readThemePreference,
  resolveInitialTheme,
} from './themePreference';

function storageWith(
  values: Record<string, string>
): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  return {
    getItem: (key) => values[key] ?? null,
    setItem: (key, value) => {
      values[key] = value;
    },
    removeItem: (key) => {
      delete values[key];
    },
  };
}

describe('themePreference', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    document.head.innerHTML = '<meta name="theme-color" content="#f8fafc" />';
  });

  it('reads a valid namespaced preference', () => {
    expect(readThemePreference(storageWith({ [THEME_STORAGE_KEY]: 'dark' }))).toBe('dark');
  });

  it('rejects an invalid namespaced preference without falling back to legacy storage', () => {
    expect(
      readThemePreference(storageWith({ [THEME_STORAGE_KEY]: 'invalid', theme: 'dark' }))
    ).toBeNull();
  });

  it('preserves one valid legacy preference and clears its old key', () => {
    const values: Record<string, string> = { theme: 'dark' };

    expect(readThemePreference(storageWith(values))).toBe('dark');
    expect(values[THEME_STORAGE_KEY]).toBe('dark');
    expect(values.theme).toBeUndefined();
  });

  it('keeps a valid legacy preference when the namespaced write fails', () => {
    const values: Record<string, string> = { theme: 'dark' };
    const storage = {
      ...storageWith(values),
      setItem: () => {
        throw new DOMException('Write blocked');
      },
    };

    expect(readThemePreference(storage)).toBe('dark');
    expect(values.theme).toBe('dark');
    expect(values[THEME_STORAGE_KEY]).toBeUndefined();
  });

  it('returns a valid legacy preference when cleanup fails after migration', () => {
    const values: Record<string, string> = { theme: 'dark' };
    const storage = {
      ...storageWith(values),
      removeItem: () => {
        throw new DOMException('Cleanup blocked');
      },
    };

    expect(readThemePreference(storage)).toBe('dark');
    expect(values[THEME_STORAGE_KEY]).toBe('dark');
    expect(values.theme).toBe('dark');
  });

  it('falls back safely when preference storage is blocked', () => {
    const blockedStorage: Pick<Storage, 'getItem' | 'removeItem'> = {
      getItem: () => {
        throw new DOMException('Blocked');
      },
      removeItem: () => undefined,
    };

    expect(readThemePreference(blockedStorage)).toBeNull();
  });

  it('falls back safely when the browser blocks access to default storage', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Blocked');
      },
    });

    try {
      expect(readThemePreference()).toBeNull();
      expect(() => persistThemePreference('dark')).not.toThrow();
    } finally {
      if (descriptor) {
        Object.defineProperty(window, 'localStorage', descriptor);
      } else {
        Reflect.deleteProperty(window, 'localStorage');
      }
    }
  });

  it('uses the system preference only when no valid stored preference exists', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
    expect(resolveInitialTheme('light', true)).toBe('light');
  });

  it('persists only the namespaced preference and ignores blocked writes', () => {
    const values: Record<string, string> = {};
    const storage: Pick<Storage, 'setItem'> = {
      setItem: (key, value) => {
        values[key] = value;
      },
    };

    persistThemePreference('dark', storage);
    expect(values).toEqual({ [THEME_STORAGE_KEY]: 'dark' });

    expect(() =>
      persistThemePreference('light', {
        setItem: () => {
          throw new DOMException('Blocked');
        },
      })
    ).not.toThrow();
  });

  it('applies the document class, color scheme, and theme-color metadata', () => {
    applyDocumentTheme('dark', document.documentElement);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      '#020617'
    );
  });
});
