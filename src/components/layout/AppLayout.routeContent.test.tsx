// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RouteContent from '../../routes/RouteContent';
import AppLayout from './AppLayout';

type PageModule = { default: ComponentType };

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, logout: vi.fn() }),
}));

vi.mock('../../contexts/DialogContext', () => ({
  DialogProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../../hooks/useIdleLogout', () => ({ useIdleLogout: vi.fn() }));
vi.mock('./Header', () => ({ default: () => <div>Header</div> }));
vi.mock('./Sidebar', () => ({ default: () => <div>Sidebar</div> }));
vi.mock('./CommandPalette', () => ({ default: () => null }));

let consoleError: { mockRestore: () => void };

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
  document.body.innerHTML = '';
});

describe('AppLayout route-state ownership', () => {
  it('does not reuse failed-navigation focus or scroll ownership after retry succeeds', async () => {
    const DashboardPage = () => {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => navigate('/reports')}>
          Open reports
        </button>
      );
    };
    const reportsLoad = vi
      .fn<[], Promise<PageModule>>()
      .mockRejectedValueOnce(new Error('private rejected chunk'))
      .mockResolvedValueOnce({ default: () => <h1>Recovered reports</h1> });

    document.body.innerHTML = '<div id="root"></div>';
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route
              path="dashboard"
              element={
                <RouteContent
                  title="Dashboard"
                  load={async () => ({ default: DashboardPage })}
                />
              }
            />
            <Route
              path="reports"
              element={<RouteContent title="Reports" load={reportsLoad} />}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
      { container: document.getElementById('root') ?? undefined }
    );

    const main = await screen.findByRole('main', { name: 'Main content' });
    await waitFor(() => expect(document.activeElement).toBe(main));
    main.scrollTop = 90;

    const openReports = screen.getByRole('button', { name: 'Open reports' });
    openReports.focus();
    fireEvent.click(openReports);
    expect(await screen.findByRole('alert', { name: 'Page unavailable' })).toBeTruthy();
    expect(main.scrollTop).toBe(90);

    const retry = screen.getByRole('button', { name: 'Try again' });
    retry.focus();
    fireEvent.click(retry);
    expect(await screen.findByRole('heading', { name: 'Recovered reports' })).toBeTruthy();
    expect(main.scrollTop).toBe(90);
    expect(document.activeElement).not.toBe(main);
  });
});
