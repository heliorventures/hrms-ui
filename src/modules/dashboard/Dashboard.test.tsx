// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../../auth/clientSession';

import Dashboard from './Dashboard';

const authState = vi.hoisted(() => ({
  clientSession: {
    jwtRoles: [],
    permissions: new Set<string>(),
    permissionScopes: {},
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
    employeeId: 'f32759cb-7e53-4f10-83d5-90c85181a66f',
  } as ParsedClientSession,
  user: {
    id: 'user-1',
    tenantId: 'tenant-1',
    name: 'Demo',
    email: 'demo@example.test',
    role: 'employee' as const,
    employeeId: 'f32759cb-7e53-4f10-83d5-90c85181a66f',
    department: '',
    designation: 'Employee',
    joiningDate: '',
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { name: 'Acme Health', timezone: 'Asia/Kolkata' } }),
}));

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

vi.mock('./components/PunchInOut', () => ({
  default: () => <div data-testid="punch-in-out" />,
}));

vi.mock('./components/LeaveBalanceCard', () => ({
  default: () => <div data-testid="leave-balance" />,
}));

vi.mock('./components/OnLeaveToday', () => ({
  default: () => <div data-testid="on-leave-today" />,
}));

vi.mock('./components/UpcomingHolidays', () => ({
  default: () => <div data-testid="upcoming-holidays" />,
}));

afterEach(cleanup);

beforeEach(() => {
  authState.clientSession.permissions = new Set();
  authState.clientSession.permissionScopes = {};
  graphState.client.request.mockResolvedValue({
    viewerEmployeeId: authState.clientSession.employeeId,
    pagedLeaveRequests: [],
    leaveTypes: [],
  });
});

describe('Dashboard', () => {
  it('links Request leave directly to the authorized shared form entry point', async () => {
    authState.clientSession.permissions = new Set(['leave:read', 'leave:submit']);
    authState.clientSession.permissionScopes = { 'leave:read': 'SELF', 'leave:submit': 'SELF' };
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Request leave' }).getAttribute('href')).toBe(
      '/leave?apply=1'
    );
    await waitFor(() => expect(screen.queryByText('Loading request status…')).toBeNull());
  });

  it('hides Request leave without submission permission', async () => {
    authState.clientSession.permissions = new Set(['leave:read']);
    authState.clientSession.permissionScopes = { 'leave:read': 'SELF' };
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', { name: 'Request leave' })).toBeNull();
    await waitFor(() => expect(screen.queryByText('Loading request status…')).toBeNull());
  });

  it('omits every protected card when its read permission is missing', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('punch-in-out')).toBeNull();
    expect(screen.queryByTestId('leave-balance')).toBeNull();
    expect(screen.queryByTestId('on-leave-today')).toBeNull();
    expect(screen.queryByTestId('upcoming-holidays')).toBeNull();
  });

  it('renders only cards backed by exact read permissions', () => {
    authState.clientSession.permissions = new Set(['attendance:read', 'notification:read']);
    authState.clientSession.permissionScopes = {
      'attendance:read': 'SELF',
      'notification:read': 'SELF',
    };
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId('punch-in-out')).toBeTruthy();
    expect(screen.queryByTestId('leave-balance')).toBeNull();
    expect(screen.queryByTestId('on-leave-today')).toBeNull();
    expect(screen.queryByTestId('upcoming-holidays')).toBeNull();
  });

  it('does not grant attendance or leave access from notification permission', () => {
    authState.clientSession.permissions = new Set(['notification:read']);
    authState.clientSession.permissionScopes = { 'notification:read': 'SELF' };
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Use the navigation to open your available tools.')).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Your day' })).toBeNull();
  });

  it('does not expose the opaque employee UUID in the welcome header', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Welcome back/ })).toBeTruthy();
    expect(screen.queryByText(/f32759cb-7e53-4f10-83d5-90c85181a66f/i)).toBeNull();
  });
});
