// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CommandPalette from './CommandPalette';
import { CommandPaletteProvider, useCommandPalette } from './CommandPaletteContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ can: () => true, clientSession: null }),
}));

vi.mock('../../auth/navAccess', () => ({
  canAccessTenantPath: (path: string) => path === '/dashboard',
}));

function PaletteHarness() {
  const { open } = useCommandPalette();
  const location = useLocation();
  const focusHandoff = Boolean(
    (location.state as Record<string, unknown> | null)?.__heliorMainFocusHandoff
  );
  return (
    <>
      <div data-testid="background-content">
        <button type="button" onClick={(event) => open(event.currentTarget)}>
          Search pages and tools
        </button>
        <button type="button">Keyboard opener</button>
        <span data-testid="location">{location.pathname}</span>
        <span data-testid="location-key">{location.key}</span>
        <span data-testid="focus-handoff">{String(focusHandoff)}</span>
      </div>
      <CommandPalette />
    </>
  );
}

function renderPalette(initialPath = '/leave') {
  document.body.innerHTML = '<div id="root"></div>';
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CommandPaletteProvider>
        <PaletteHarness />
      </CommandPaletteProvider>
    </MemoryRouter>,
    { container: document.getElementById('root') ?? undefined }
  );
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  document.body.style.overflow = '';
  vi.unstubAllGlobals();
});

describe('CommandPalette', () => {
  it('uses the shared modal lifecycle and restores the Header opener after Escape', async () => {
    renderPalette();
    const opener = screen.getByRole('button', { name: 'Search pages and tools' });
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search pages and tools' }))
    );
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById('root')?.hasAttribute('inert')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(opener);
    expect(document.getElementById('root')?.hasAttribute('inert')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('captures the Ctrl/Cmd+K opener and restores it after outside dismissal', async () => {
    renderPalette();
    const opener = screen.getByRole('button', { name: 'Keyboard opener' });
    opener.focus();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await screen.findByRole('dialog', { name: 'Command palette' });
    fireEvent.mouseDown(screen.getByTestId('command-palette-backdrop'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(opener);
  });

  it('contains Tab focus and exposes only permitted destinations', async () => {
    renderPalette();
    fireEvent.click(screen.getByRole('button', { name: 'Search pages and tools' }));

    const search = await screen.findByRole('searchbox', { name: 'Search pages and tools' });
    const dashboard = screen.getByRole('button', { name: /Dashboard/ });
    expect(screen.queryByRole('button', { name: /Employees/ })).toBeNull();

    dashboard.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(search);
    search.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(dashboard);
  });

  it('keeps Arrow/Enter navigation and restores focus after route selection', async () => {
    renderPalette();
    const opener = screen.getByRole('button', { name: 'Search pages and tools' });
    fireEvent.click(opener);
    const search = await screen.findByRole('searchbox', { name: 'Search pages and tools' });

    fireEvent.keyDown(search, { key: 'ArrowDown' });
    fireEvent.keyDown(search, { key: 'ArrowUp' });
    fireEvent.keyDown(search, { key: 'Enter' });

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/dashboard'));
    expect(screen.getByTestId('focus-handoff').textContent).toBe('true');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('closes a current-path selection without creating a stale focus handoff', async () => {
    renderPalette('/dashboard');
    const originalKey = screen.getByTestId('location-key').textContent;
    const opener = screen.getByRole('button', { name: 'Search pages and tools' });
    fireEvent.click(opener);
    const search = await screen.findByRole('searchbox', { name: 'Search pages and tools' });

    fireEvent.keyDown(search, { key: 'Enter' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByTestId('location-key').textContent).toBe(originalKey);
    expect(screen.getByTestId('focus-handoff').textContent).toBe('false');
    expect(document.activeElement).toBe(opener);
  });
});
