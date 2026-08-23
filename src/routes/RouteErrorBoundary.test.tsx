// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RouteErrorBoundary from './RouteErrorBoundary';

let consoleError: { mockRestore: () => void };

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
});

describe('RouteErrorBoundary', () => {
  it('hides route exceptions and retries with a fresh child render', () => {
    let shouldThrow = true;
    const RecoverablePage = () => {
      if (shouldThrow) throw new Error('sensitive implementation detail');
      return <h1>Recovered page</h1>;
    };

    render(
      <MemoryRouter>
        <RouteErrorBoundary onRetry={() => { shouldThrow = false; }}>
          <RecoverablePage />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Page unavailable' })).toBeTruthy();
    expect(document.body.textContent).not.toContain('sensitive implementation detail');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('heading', { name: 'Recovered page' })).toBeTruthy();
  });

  it('clears a captured error when the pathname changes', () => {
    const PathPage = () => {
      const location = useLocation();
      if (location.pathname === '/broken') throw new Error('broken route');
      return <h1>Working route</h1>;
    };
    const Navigation = () => {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => navigate('/working')}>
          Open working route
        </button>
      );
    };

    render(
      <MemoryRouter initialEntries={['/broken']}>
        <Navigation />
        <RouteErrorBoundary>
          <PathPage />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Page unavailable' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open working route' }));
    expect(screen.getByRole('heading', { name: 'Working route' })).toBeTruthy();
  });
});
