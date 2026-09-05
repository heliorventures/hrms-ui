// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
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
  useTenant: () => ({ currentTenant: { name: 'Acme Health' } }),
}));

vi.mock('./components/PunchInOut', () => ({
  default: () => <div data-testid="punch-in-out" />,
}));

vi.mock('./components/LeaveBalanceCard', () => ({
  default: () => <div data-testid="leave-balance" />,
}));

vi.mock('./components/NotificationsPreview', () => ({
  default: () => <div data-testid="notifications-preview" />,
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
});

describe('Dashboard', () => {
  it('omits every protected card when its read permission is missing', () => {
    render(<Dashboard />);

    expect(screen.queryByTestId('punch-in-out')).toBeNull();
    expect(screen.queryByTestId('leave-balance')).toBeNull();
    expect(screen.queryByTestId('on-leave-today')).toBeNull();
    expect(screen.queryByTestId('upcoming-holidays')).toBeNull();
    expect(screen.queryByTestId('notifications-preview')).toBeNull();
  });

  it('renders only cards backed by exact read permissions', () => {
    authState.clientSession.permissions = new Set(['attendance:read', 'notification:read']);
    authState.clientSession.permissionScopes = {
      'attendance:read': 'SELF',
      'notification:read': 'SELF',
    };
    render(<Dashboard />);

    expect(screen.getByTestId('punch-in-out')).toBeTruthy();
    expect(screen.getByTestId('notifications-preview')).toBeTruthy();
    expect(screen.queryByTestId('leave-balance')).toBeNull();
    expect(screen.queryByTestId('on-leave-today')).toBeNull();
    expect(screen.queryByTestId('upcoming-holidays')).toBeNull();
  });

  it('does not expose the opaque employee UUID in the welcome header', () => {
    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: 'Welcome back, Demo' })).toBeTruthy();
    expect(screen.queryByText(/f32759cb-7e53-4f10-83d5-90c85181a66f/i)).toBeNull();
  });
});
