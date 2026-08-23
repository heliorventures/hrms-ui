// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import { MemoryRouter, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RouteContent from './RouteContent';

type PageModule = { default: ComponentType };

function deferredPageModule() {
  let resolve!: (module: PageModule) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<PageModule>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

let consoleError: { mockRestore: () => void };

beforeEach(() => {
  document.title = 'Previous title';
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
});

describe('RouteContent', () => {
  it('sets the exact product title and shows a labelled fallback until the page commits', async () => {
    const deferred = deferredPageModule();
    const load = vi.fn(() => deferred.promise);
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <RouteContent title="Dashboard" load={load} />
      </MemoryRouter>
    );

    expect(document.title).toBe('Dashboard | Helior HRMS');
    expect(screen.getByRole('status', { name: 'Loading Dashboard' })).toBeTruthy();
    expect(load).toHaveBeenCalledTimes(1);

    deferred.resolve({ default: () => <h1>Dashboard content</h1> });
    expect(await screen.findByRole('heading', { name: 'Dashboard content' })).toBeTruthy();
  });

  it('recreates a rejected lazy import when retry is requested', async () => {
    const load = vi
      .fn<[], Promise<PageModule>>()
      .mockRejectedValueOnce(new Error('chunk URL and stack must stay private'))
      .mockResolvedValueOnce({ default: () => <h1>Recovered route</h1> });

    render(
      <MemoryRouter initialEntries={['/reports']}>
        <RouteContent title="Reports" load={load} />
      </MemoryRouter>
    );

    const announcement = await screen.findByRole('alert', { name: 'Page unavailable' });
    expect(announcement.getAttribute('aria-live')).toBe('assertive');
    expect(document.title).toBe('Page unavailable | Helior HRMS');
    expect(document.body.textContent).not.toMatch(/chunk URL|stack must stay private/i);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Recovered route' })).toBeTruthy();
    await waitFor(() => expect(document.title).toBe('Reports | Helior HRMS'));
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('resets a failed import when the pathname changes', async () => {
    const load = vi
      .fn<[], Promise<PageModule>>()
      .mockRejectedValueOnce(new Error('first path failed'))
      .mockResolvedValueOnce({ default: () => <h1>Next route content</h1> });
    const Navigation = () => {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => navigate('/next')}>
          Open next path
        </button>
      );
    };

    render(
      <MemoryRouter initialEntries={['/failed']}>
        <Navigation />
        <Routes>
          <Route path="*" element={<RouteContent title="Shared page" load={load} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Page unavailable' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open next path' }));
    expect(await screen.findByRole('heading', { name: 'Next route content' })).toBeTruthy();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('marks authorized real content committed only after its lazy module renders', async () => {
    const deferred = deferredPageModule();
    const onRouteContentCommit = vi.fn();
    const Parent = () => <Outlet context={{ onRouteContentCommit }} />;

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<Parent />}>
            <Route
              path="dashboard"
              element={<RouteContent title="Dashboard" load={() => deferred.promise} />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: 'Loading Dashboard' })).toBeTruthy();
    expect(onRouteContentCommit).not.toHaveBeenCalled();

    deferred.resolve({ default: () => <h1>Authorized dashboard</h1> });
    expect(await screen.findByRole('heading', { name: 'Authorized dashboard' })).toBeTruthy();
    await waitFor(() =>
      expect(onRouteContentCommit).toHaveBeenCalledWith({
        locationKey: expect.any(String),
        pathname: '/dashboard',
      })
    );
  });
});
