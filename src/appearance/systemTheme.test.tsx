// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';

import { DEFAULT_APPEARANCE } from './preferences';
import { saveAppearance } from './storage';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

it('follows operating system changes while retaining System mode', () => {
  localStorage.clear();
  saveAppearance({ ...DEFAULT_APPEARANCE, mode: 'system' });
  let changed: (() => void) | undefined;
  const media = {
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_type: string, callback: () => void) => {
      changed = callback;
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  };
  window.matchMedia = vi.fn(() => media as unknown as MediaQueryList);
  render(
    <ThemeProvider>
      <span>Workspace</span>
    </ThemeProvider>
  );
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  act(() => {
    media.matches = true;
    changed?.();
  });
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('heliorhrms.appearance.v1')).toContain('"mode":"system"');
});
