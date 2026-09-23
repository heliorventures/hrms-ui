// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';

import AppearancePage from './AppearancePage';
import { APPEARANCE_STORAGE_KEY } from './storage';

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('appearance editor', () => {
  it('previews without changing saved preferences and cancels the draft', () => {
    render(
      <ThemeProvider>
        <AppearancePage />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect((screen.getByRole('radio', { name: 'System' }) as HTMLInputElement).checked).toBe(true);
  });

  it('applies and persists a saved choice', () => {
    render(
      <ThemeProvider>
        <AppearancePage />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toContain('"mode":"dark"');
  });

  it('keeps preferences unchanged when browser persistence fails', () => {
    render(
      <ThemeProvider>
        <AppearancePage />
      </ThemeProvider>
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(screen.getByRole('alert').textContent).toContain('could not save');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
