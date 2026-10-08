import { describe, expect, it } from 'vitest';

import { DEFAULT_APPEARANCE, parseAppearance } from './preferences';
import { readAppearance, saveAppearance } from './storage';

describe('personal appearance preferences', () => {
  it('uses compact defaults and rejects invalid persisted values independently', () => {
    expect(parseAppearance({ density: 'comfortable', mode: 'invalid', textSize: 99 })).toEqual({
      ...DEFAULT_APPEARANCE,
      density: 'comfortable',
    });
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
  });

  it('does not trust malformed or unsupported stored documents', () => {
    expect(readAppearance({ getItem: () => '{broken' })).toBeNull();
    expect(readAppearance({ getItem: () => JSON.stringify({ version: 99 }) })).toBeNull();
  });

  it('round trips system mode without turning it into a fixed mode', () => {
    let stored = '';
    const preferences = { ...DEFAULT_APPEARANCE, mode: 'system' as const };
    expect(
      saveAppearance(preferences, {
        setItem: (_key, value) => {
          stored = value;
        },
      })
    ).toBe(true);
    expect(readAppearance({ getItem: () => stored })).toEqual(preferences);
  });

  it('reports blocked storage rather than pretending settings were saved', () => {
    expect(
      saveAppearance(DEFAULT_APPEARANCE, {
        setItem: () => {
          throw new Error('blocked');
        },
      })
    ).toBe(false);
    expect(
      readAppearance({
        getItem: () => {
          throw new Error('blocked');
        },
      })
    ).toBeNull();
  });
});
