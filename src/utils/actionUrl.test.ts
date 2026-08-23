import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../auth/clientSession';
import type { NavAccessOptions } from '../auth/navAccess';

import {
  authorizedNotificationActionUrl,
  directNotificationActionUrl,
  notificationActionDestination,
} from './actionUrl';

function session(permissions: readonly string[] = []): ParsedClientSession {
  return {
    jwtRoles: [],
    permissions: new Set(permissions),
    resourceScopes: {},
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };
}

const employeeAccess: NavAccessOptions = {
  can: () => false,
  clientSession: session(),
};

const notificationManagerAccess: NavAccessOptions = {
  can: () => true,
  clientSession: session(['notification:manage']),
};

describe('notificationActionDestination', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://heliorsoft.com' } });
  });

  it('uses notifications as the fallback when the action URL is absent or external', () => {
    expect(notificationActionDestination(null)).toBe('/notifications');
    expect(notificationActionDestination('')).toBe('/notifications');
    expect(notificationActionDestination('https://evil.example/path')).toBe('/notifications');
  });

  it('normalizes same-origin absolute URLs to internal routes', () => {
    expect(notificationActionDestination('https://heliorsoft.com/admin/notifications')).toBe(
      '/admin/notifications'
    );
  });

  it('keeps relative internal URLs in the same tab', () => {
    expect(notificationActionDestination('notifications')).toBe('/notifications');
    expect(notificationActionDestination('/admin/notifications?tab=direct')).toBe(
      '/admin/notifications?tab=direct'
    );
  });
});

describe('directNotificationActionUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://heliorsoft.com' } });
  });

  it('defaults direct notifications to the notifications page', () => {
    expect(directNotificationActionUrl(null)).toBe('/notifications');
    expect(directNotificationActionUrl('')).toBe('/notifications');
  });

  it('rejects external and protocol-relative routes', () => {
    expect(directNotificationActionUrl('https://evil.example/path')).toBe('/notifications');
    expect(directNotificationActionUrl('//evil.example/path')).toBe('/notifications');
    expect(directNotificationActionUrl('/\\evil.example/path')).toBe('/notifications');
  });

  it('preserves normalized internal application routes with query and hash', () => {
    expect(directNotificationActionUrl('/notifications?filter=unread#top')).toBe(
      '/notifications?filter=unread#top'
    );
    expect(directNotificationActionUrl('/expenses?tab=claims')).toBe('/expenses?tab=claims');
    expect(directNotificationActionUrl('https://heliorsoft.com/leave#requests')).toBe(
      '/leave#requests'
    );
  });
});

describe('authorizedNotificationActionUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://heliorsoft.com' } });
  });

  it('suppresses malformed and external destinations', () => {
    expect(authorizedNotificationActionUrl('http://[::1', employeeAccess)).toBeNull();
    expect(
      authorizedNotificationActionUrl('https://outside.example/path', employeeAccess)
    ).toBeNull();
  });

  it('suppresses unknown and dynamic destinations instead of guessing route access', () => {
    expect(authorizedNotificationActionUrl('/not-a-registered-route', employeeAccess)).toBeNull();
    expect(
      authorizedNotificationActionUrl('/organization/employees/123', employeeAccess)
    ).toBeNull();
  });

  it('suppresses static destinations the current session cannot access', () => {
    expect(authorizedNotificationActionUrl('/admin/notifications', employeeAccess)).toBeNull();
  });

  it('keeps the normalized destination query and hash after authorizing its pathname', () => {
    expect(
      authorizedNotificationActionUrl('/notifications?filter=unread#latest', employeeAccess)
    ).toBe('/notifications?filter=unread#latest');
  });

  it('allows a static route when the current session has the corresponding permission', () => {
    expect(authorizedNotificationActionUrl('/admin/notifications', notificationManagerAccess)).toBe(
      '/admin/notifications'
    );
  });
});
