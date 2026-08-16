import { beforeEach, describe, expect, it, vi } from 'vitest';
import { directNotificationActionUrl, notificationActionDestination } from './actionUrl';

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
