// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import AppLayout from '../components/layout/AppLayout';

import { useGuidance } from './useGuidance';

const mocks = vi.hoisted(() => ({
  auth: {
    user: { id: 'user-existing' },
    isAuthenticated: true,
    logout: vi.fn(),
    clientSession: {
      permissions: new Set<string>(),
      permissionScopes: {},
      resourceScopes: {},
      employeeId: 'employee-1',
      jwtRoles: [],
      persona: 'EMPLOYEE',
      mustChangePassword: false,
    },
    can: () => true,
  },
  tenant: { currentTenant: { id: 'tenant-a' }, resolutionStatus: 'resolved' },
  request: vi.fn(),
}));

vi.mock('../hooks/useGraphClient', () => ({
  useGraphClient: () => ({ request: mocks.request }),
}));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => mocks.auth }));
vi.mock('../contexts/TenantContext', () => ({ useTenant: () => mocks.tenant }));
vi.mock('../contexts/EmployeeDisplayNameProvider', () => ({
  default: ({ children }: PropsWithChildren) => children,
}));
vi.mock('../hooks/useIdleLogout', () => ({ useIdleLogout: vi.fn() }));
vi.mock('../components/layout/Sidebar', () => ({ default: () => <div /> }));
vi.mock('../components/layout/WorkspaceHeader', () => ({ default: () => <div /> }));
vi.mock('../components/layout/CommandPalette', () => ({ default: () => null }));

const RouteControls = () => {
  const navigate = useNavigate();
  const guidance = useGuidance();
  return (
    <div>
      <button type="button" onClick={() => guidance.startOverview()}>
        Replay overview
      </button>
      <button type="button" onClick={() => navigate('/leave')}>
        Change route
      </button>
    </div>
  );
};

function renderShell(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="*" element={<RouteControls />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function guidanceState(dismissedAt: string | null = null) {
  return { myGuidanceState: { overviewDismissedAt: dismissedAt } };
}

beforeEach(() => {
  mocks.auth.user = { id: 'user-existing' };
  mocks.auth.isAuthenticated = true;
  mocks.auth.clientSession = {
    permissions: new Set<string>(),
    permissionScopes: {},
    resourceScopes: {},
    employeeId: 'employee-1',
    jwtRoles: [],
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
  mocks.tenant.currentTenant = { id: 'tenant-a' };
  mocks.tenant.resolutionStatus = 'resolved';
  mocks.request.mockReset();
  mocks.request.mockResolvedValue(guidanceState());
  document.body.innerHTML = '<div id="root"></div>';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

it.each(['user-existing', 'user-new'])(
  'opens for %s when no dismissal is stored',
  async (userId) => {
    mocks.auth.user = { id: userId };
    renderShell();

    expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
    expect(mocks.request).toHaveBeenCalledOnce();
  }
);

it('waits for an authenticated and resolved tenant shell before reading state', async () => {
  mocks.auth.isAuthenticated = false;
  mocks.tenant.resolutionStatus = 'resolving';
  const view = renderShell();

  expect(mocks.request).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog', { name: 'Welcome to your HRMS' })).toBeNull();

  mocks.auth.isAuthenticated = true;
  mocks.tenant.resolutionStatus = 'resolved';
  view.rerender(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="*" element={<RouteControls />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
  expect(mocks.request).toHaveBeenCalledOnce();
});

it('keeps eligibility independent for each tenant and authenticated user', async () => {
  const view = renderShell();
  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();

  mocks.tenant.currentTenant = { id: 'tenant-b' };
  view.rerender(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="*" element={<RouteControls />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();

  mocks.auth.user = { id: 'user-second' };
  view.rerender(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="*" element={<RouteControls />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(3));
  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
});

it('does not open automatically when dismissal is already stored', async () => {
  mocks.request.mockResolvedValueOnce(guidanceState('2026-09-29T10:00:00Z'));
  renderShell();

  await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
  expect(screen.queryByRole('dialog', { name: 'Welcome to your HRMS' })).toBeNull();
});

it('keeps a read error distinct from an eligible null state and supports retry', async () => {
  mocks.request.mockRejectedValueOnce(new Error('transport failure'));
  mocks.request.mockResolvedValueOnce(guidanceState());
  renderShell();

  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('dialog', { name: 'Welcome to your HRMS' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
  expect(mocks.request).toHaveBeenCalledTimes(2);
});

it('reports and retries a failed dismissal without reopening the automatic overview', async () => {
  mocks.request
    .mockResolvedValueOnce(guidanceState())
    .mockRejectedValueOnce(new Error('transport failure'))
    .mockResolvedValueOnce({
      dismissMyApplicationOverview: { overviewDismissedAt: '2026-09-29T10:00:00Z' },
    });
  renderShell();

  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
  expect(await screen.findByRole('alert')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(screen.queryByRole('dialog', { name: 'Welcome to your HRMS' })).toBeNull();
  expect(mocks.request).toHaveBeenCalledTimes(3);
});

it('does not reread or reopen after session refresh changes authorization', async () => {
  const view = renderShell();
  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();

  mocks.auth.clientSession = {
    ...mocks.auth.clientSession,
    permissions: new Set(['attendance:read']),
  };
  view.rerender(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="*" element={<RouteControls />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(mocks.request).toHaveBeenCalledOnce();
});

it('closes an overview on route changes without writing dismissal', async () => {
  renderShell();
  expect(await screen.findByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Change route' }));

  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(mocks.request).toHaveBeenCalledOnce();
});

it('does not replace an early Help replay when the first state read finishes', async () => {
  let resolveRead: ((value: ReturnType<typeof guidanceState>) => void) | undefined;
  const pendingRead = new Promise<ReturnType<typeof guidanceState>>((resolve) => {
    resolveRead = resolve;
  });
  mocks.request.mockReturnValueOnce(pendingRead);
  renderShell();

  fireEvent.click(screen.getByRole('button', { name: 'Replay overview' }));
  expect(screen.getByRole('dialog', { name: 'Welcome to your HRMS' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
  resolveRead?.(guidanceState());

  await waitFor(() => expect(mocks.request).toHaveBeenCalledOnce());
  expect(screen.queryByRole('dialog', { name: 'Welcome to your HRMS' })).toBeNull();
});
