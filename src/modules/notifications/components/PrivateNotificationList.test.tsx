// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../../../auth/clientSession';

import PrivateNotificationList from './PrivateNotificationList';

const authState = vi.hoisted(() => ({
  clientSession: null as ParsedClientSession | null,
  tenantId: null as string | null,
  resolvedTenantId: '' as string,
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => false,
    clientSession: authState.clientSession,
    tenantId: authState.tenantId,
  }),
}));

vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: authState.resolvedTenantId } }),
}));

const tenantA = 'e6d4fc13-feb8-52a0-93bd-f66c795969b1';
const tenantB = '342205fc-98b1-5421-8a11-b30821c86aa0';

function employeeSession(): ParsedClientSession {
  return {
    jwtRoles: [],
    permissions: new Set(),
    permissionScopes: {},
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
}

const notification = {
  id: 'notification-1',
  kind: 'personal',
  title: 'Action needed',
  message: 'Review your notification.',
  isRead: true,
  createdAt: '2026-08-20T08:00:00.000Z',
};

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

function notificationList(
  actionUrl: string,
  overrides: Partial<typeof notification> = {},
  onMarkRead = vi.fn()
) {
  return (
    <MemoryRouter future={routerFuture}>
      <PrivateNotificationList
        actionBusy={false}
        filter="all"
        loading={false}
        notifications={[{ ...notification, ...overrides, actionUrl }]}
        onMarkRead={onMarkRead}
      />
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  authState.clientSession = null;
  authState.tenantId = null;
  authState.resolvedTenantId = '';
});

describe('PrivateNotificationList', () => {
  it('does not expose destination text or a view link for an unauthorized route', () => {
    const { container } = render(notificationList('/admin/notifications'));

    expect(screen.queryByText('Destination:', { exact: false })).toBeNull();
    expect(screen.queryByRole('link', { name: 'View' })).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });

  it('renders an authorized route as one styled link without a nested button', () => {
    authState.clientSession = employeeSession();
    authState.tenantId = tenantA;
    authState.resolvedTenantId = tenantA;
    render(notificationList('/notifications'));

    const view = screen.getByRole('link', { name: 'View' });
    expect(view.getAttribute('href')).toBe('/notifications');
    expect(view.className).not.toBe('');
    expect(view.querySelector('button')).toBeNull();
  });

  it('marks an unread notification as read when the user opens its destination', () => {
    const onMarkRead = vi.fn();
    authState.clientSession = employeeSession();
    authState.tenantId = tenantA;
    authState.resolvedTenantId = tenantA;
    render(notificationList('/notifications', { isRead: false }, onMarkRead));

    fireEvent.click(screen.getByRole('link', { name: 'View' }));

    expect(onMarkRead).toHaveBeenCalledWith('notification-1');
  });

  it('suppresses destinations while the resolved tenant differs from the authenticated session tenant', () => {
    authState.clientSession = employeeSession();
    authState.tenantId = tenantA;
    authState.resolvedTenantId = tenantA;
    const view = render(notificationList('/notifications'));
    expect(screen.getByRole('link', { name: 'View' })).toBeTruthy();

    authState.resolvedTenantId = tenantB;
    view.rerender(notificationList('/notifications'));

    expect(screen.queryByText('Destination:', { exact: false })).toBeNull();
    expect(screen.queryByRole('link', { name: 'View' })).toBeNull();

    authState.tenantId = tenantB;
    view.rerender(notificationList('/notifications'));

    expect(screen.getByRole('link', { name: 'View' })).toBeTruthy();
  });

  it('keeps long notification title and message tokens contained without displacing actions', () => {
    const longToken = 'NotificationContent'.repeat(30);
    authState.clientSession = employeeSession();
    authState.tenantId = tenantA;
    authState.resolvedTenantId = tenantA;
    render(notificationList('/notifications', { message: longToken, title: longToken }));

    const title = screen.getByRole('heading', { name: longToken });
    const message = screen.getByText(longToken, { selector: 'p' });
    const view = screen.getByRole('link', { name: 'View' });
    expect(title.className).toContain('break-words');
    expect(title.className).toContain('[overflow-wrap:anywhere]');
    expect(message.className).toContain('break-words');
    expect(message.className).toContain('[overflow-wrap:anywhere]');
    expect(view.parentElement?.className).toContain('shrink-0');
  });
});
