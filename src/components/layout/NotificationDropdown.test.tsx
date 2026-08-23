// @vitest-environment jsdom

import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MarkNotificationReadDocument } from '../../api/graphql/graphql';
import {
  NotificationPreviewDocument,
  UnreadNotificationCountDocument,
} from '../../modules/notifications/notificationQueries';

import {
  deferred,
  installDropdownGeometry,
  notificationMocks,
  notificationRequestScenarios,
  notificationTree,
  preview,
  renderNotifications,
  tenantB,
} from './NotificationDropdown.testSupport';

const mocks = notificationMocks();

describe('NotificationDropdown', () => {
  it('polls only unread count while closed and loads the 15-item preview on open', async () => {
    renderNotifications();

    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith(UnreadNotificationCountDocument)
    );
    expect(mocks.request).not.toHaveBeenCalledWith(NotificationPreviewDocument, expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 3 unread' }));

    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith(NotificationPreviewDocument, { limit: 15 })
    );
    expect(await screen.findByText('Policy update')).toBeTruthy();
  });

  it('shows direct notification action URLs in the receiver preview', async () => {
    renderNotifications();

    await screen.findByRole('button', { name: 'Notifications, 3 unread' });
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 3 unread' }));

    expect(await screen.findByText('Action URL:', { exact: false })).toBeTruthy();
    expect(screen.getByText('/leave')).toBeTruthy();
  });

  it('preserves successful count and preview independently and offers inline retries', async () => {
    let countFails = false;
    let previewFails = false;
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        if (countFails) return Promise.reject(new Error('count unavailable'));
        return Promise.resolve({ unreadNotificationCount: 12 });
      }
      if (document === NotificationPreviewDocument) {
        if (previewFails) return Promise.reject(new Error('preview unavailable'));
        return Promise.resolve({ notifications: preview });
      }
      return Promise.resolve({ markNotificationRead: true });
    });
    vi.useFakeTimers();
    renderNotifications();
    await act(async () => Promise.resolve());

    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 12 unread' }));
    await act(async () => Promise.resolve());
    expect(screen.getByText('Policy update')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('region', { name: 'Notifications' }), { key: 'Escape' });

    countFails = true;
    previewFails = true;
    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 12 unread' }));
    await act(async () => Promise.resolve());

    expect(screen.getByText('Policy update')).toBeTruthy();
    expect(screen.getByText('Notifications May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Showing the last loaded data.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry Notification Preview' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry Unread Count' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Notifications, 12 unread' })).toBeTruthy();
  });

  it('renders an actionable initial preview failure without claiming the preview is empty', async () => {
    notificationRequestScenarios.previewFailure();
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(trigger);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Notifications Could Not Be Loaded');
    expect(screen.getByRole('button', { name: 'Retry Notification Preview' })).toBeTruthy();
    expect(screen.queryByText('No Notifications')).toBeNull();
  });
});

describe('NotificationDropdown preview states', () => {
  it('uses Title Case and an ellipsis for the initial preview loading title', async () => {
    const pendingPreview = deferred<{ notifications: typeof preview }>();
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 0 });
      }
      if (document === NotificationPreviewDocument) return pendingPreview.promise;
      return Promise.resolve({ markNotificationRead: true });
    });
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(trigger);

    expect(await screen.findByText('Loading Notifications…')).toBeTruthy();

    act(() => pendingPreview.resolve({ notifications: preview }));
  });

  it('uses Title Case for the successful empty preview title', async () => {
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 0 });
      }
      if (document === NotificationPreviewDocument) return Promise.resolve({ notifications: [] });
      return Promise.resolve({ markNotificationRead: true });
    });
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(trigger);

    expect(await screen.findByText('No Notifications')).toBeTruthy();
  });

  it('keeps retained notifications visible and announces an in-progress refresh once', async () => {
    const pendingRefresh = deferred<{ notifications: typeof preview }>();
    notificationRequestScenarios.retainedRefresh(pendingRefresh.promise);
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(trigger);
    expect(await screen.findByText('Policy update')).toBeTruthy();

    fireEvent.keyDown(screen.getByRole('region', { name: 'Notifications' }), { key: 'Escape' });
    fireEvent.click(trigger);

    expect(screen.getByText('Policy update')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Refreshing notifications…');
    expect(screen.getAllByRole('status')).toHaveLength(1);

    act(() => pendingRefresh.resolve({ notifications: preview }));
  });

  it('shows possible cap guidance when the 15-item preview reaches its request limit', async () => {
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 0 });
      }
      if (document === NotificationPreviewDocument) {
        return Promise.resolve({
          notifications: Array.from({ length: 15 }, (_, index) => ({
            ...preview[0],
            id: `notification-${index}`,
            title: `Notification preview ${index}`,
          })),
        });
      }
      return Promise.resolve({ markNotificationRead: true });
    });
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(trigger);

    expect(
      await screen.findByText('Showing up to 15 recent items. More may be available.')
    ).toBeTruthy();
  });
});

describe('NotificationDropdown tenant isolation', () => {
  it('clears tenant A data while tenant B count and open preview are pending or fail', async () => {
    const tenantARequest = vi.fn((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 7 });
      }
      if (document === NotificationPreviewDocument) {
        return Promise.resolve({ notifications: preview });
      }
      return Promise.resolve({ markNotificationRead: true });
    });
    mocks.client = { request: tenantARequest };
    const view = renderNotifications();

    const tenantATrigger = await screen.findByRole('button', {
      name: 'Notifications, 7 unread',
    });
    fireEvent.click(tenantATrigger);
    expect(await screen.findByText('Policy update')).toBeTruthy();

    const tenantBCount = deferred<{ unreadNotificationCount: number }>();
    const tenantBPreview = deferred<{ notifications: typeof preview }>();
    const tenantBRequest = vi.fn((document: unknown) => {
      if (document === UnreadNotificationCountDocument) return tenantBCount.promise;
      if (document === NotificationPreviewDocument) return tenantBPreview.promise;
      return Promise.resolve({ markNotificationRead: true });
    });
    mocks.client = { request: tenantBRequest };
    view.rerender(notificationTree());

    await waitFor(() =>
      expect(tenantBRequest).toHaveBeenCalledWith(UnreadNotificationCountDocument)
    );
    await waitFor(() =>
      expect(tenantBRequest).toHaveBeenCalledWith(NotificationPreviewDocument, { limit: 15 })
    );
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy();
    expect(screen.queryByText('Policy update')).toBeNull();

    await act(async () => {
      tenantBCount.reject(new Error('tenant B count unavailable'));
      tenantBPreview.reject(new Error('tenant B preview unavailable'));
      await Promise.resolve();
    });

    expect(await screen.findByRole('button', { name: 'Retry Unread Count' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry Notification Preview' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy();
    expect(screen.queryByText('Policy update')).toBeNull();
  });

  it('ignores tenant A count and preview completions after switching to tenant B', async () => {
    const tenantACount = deferred<{ unreadNotificationCount: number }>();
    const tenantAPreview = deferred<{ notifications: typeof preview }>();
    const tenantARequest = vi.fn((document: unknown) => {
      if (document === UnreadNotificationCountDocument) return tenantACount.promise;
      if (document === NotificationPreviewDocument) return tenantAPreview.promise;
      return Promise.resolve({ markNotificationRead: true });
    });
    mocks.client = { request: tenantARequest };
    const view = renderNotifications();

    await waitFor(() =>
      expect(tenantARequest).toHaveBeenCalledWith(UnreadNotificationCountDocument)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    await waitFor(() =>
      expect(tenantARequest).toHaveBeenCalledWith(NotificationPreviewDocument, { limit: 15 })
    );

    const tenantBCount = deferred<{ unreadNotificationCount: number }>();
    const tenantBPreview = deferred<{ notifications: typeof preview }>();
    const tenantBRequest = vi.fn((document: unknown) => {
      if (document === UnreadNotificationCountDocument) return tenantBCount.promise;
      if (document === NotificationPreviewDocument) return tenantBPreview.promise;
      return Promise.resolve({ markNotificationRead: true });
    });
    mocks.client = { request: tenantBRequest };
    view.rerender(notificationTree());

    await waitFor(() =>
      expect(tenantBRequest).toHaveBeenCalledWith(UnreadNotificationCountDocument)
    );
    await waitFor(() =>
      expect(tenantBRequest).toHaveBeenCalledWith(NotificationPreviewDocument, { limit: 15 })
    );

    await act(async () => {
      tenantACount.resolve({ unreadNotificationCount: 9 });
      tenantAPreview.resolve({
        notifications: [{ ...preview[0], id: 'tenant-a', title: 'Tenant A pending notice' }],
      });
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy();
    expect(screen.queryByText('Tenant A pending notice')).toBeNull();

    await act(async () => {
      tenantBCount.resolve({ unreadNotificationCount: 2 });
      tenantBPreview.resolve({
        notifications: [{ ...preview[0], id: 'tenant-b', title: 'Tenant B notice' }],
      });
      await Promise.resolve();
    });

    expect(await screen.findByRole('button', { name: 'Notifications, 2 unread' })).toBeTruthy();
    expect(await screen.findByText('Tenant B notice')).toBeTruthy();
    expect(screen.queryByText('Tenant A pending notice')).toBeNull();
  });
});

describe('NotificationDropdown notification actions', () => {
  it('still navigates and closes when marking a notification read fails', async () => {
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 1 });
      }
      if (document === NotificationPreviewDocument) {
        return Promise.resolve({
          notifications: [{ ...preview[0], actionUrl: 'javascript:alert(1)' }],
        });
      }
      if (document === MarkNotificationReadDocument) {
        return Promise.reject(new Error('mark failed'));
      }
      return Promise.reject(new Error('Unexpected document'));
    });
    renderNotifications();
    await screen.findByRole('button', { name: 'Notifications, 1 unread' });
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));

    fireEvent.click(await screen.findByRole('button', { name: /Policy update/ }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/notifications'));
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();
  });

  it.each([
    ['absent', null],
    ['unauthorized', '/admin/notifications'],
  ])(
    'marks %s action notifications read and falls back to notifications',
    async (_label, actionUrl) => {
      mocks.request.mockImplementation((document: unknown) => {
        if (document === UnreadNotificationCountDocument) {
          return Promise.resolve({ unreadNotificationCount: 1 });
        }
        if (document === NotificationPreviewDocument) {
          return Promise.resolve({ notifications: [{ ...preview[0], actionUrl }] });
        }
        if (document === MarkNotificationReadDocument) {
          return Promise.resolve({ markNotificationRead: true });
        }
        return Promise.reject(new Error('Unexpected document'));
      });
      renderNotifications();
      await screen.findByRole('button', { name: 'Notifications, 1 unread' });
      fireEvent.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));
      fireEvent.click(await screen.findByRole('button', { name: /Policy update/ }));

      await waitFor(() =>
        expect(mocks.request).toHaveBeenCalledWith(MarkNotificationReadDocument, {
          id: 'notification-1',
        })
      );
      expect(mocks.navigate).toHaveBeenCalledWith('/notifications');
    }
  );

  it('re-evaluates the destination against the current session before opening a notification', async () => {
    const view = renderNotifications();
    await screen.findByRole('button', { name: 'Notifications, 3 unread' });
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 3 unread' }));
    await screen.findByRole('button', { name: /Policy update/ });

    mocks.clientSession = null;
    view.rerender(notificationTree());
    fireEvent.click(screen.getByRole('button', { name: /Policy update/ }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/notifications'));
  });

  it('falls back until an independently changed resolved tenant matches the session tenant', async () => {
    const view = renderNotifications();
    await screen.findByRole('button', { name: 'Notifications, 3 unread' });
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 3 unread' }));
    await screen.findByRole('button', { name: /Policy update/ });

    mocks.resolvedTenantId = tenantB;
    view.rerender(notificationTree());
    fireEvent.click(screen.getByRole('button', { name: /Policy update/ }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/notifications'));

    mocks.navigate.mockClear();
    mocks.tenantId = tenantB;
    view.rerender(notificationTree());
    fireEvent.click(screen.getByRole('button', { name: /Notifications/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Policy update/ }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/leave'));
  });

  it('navigates immediately while read-state persistence is still pending', async () => {
    const markPending = deferred<{ markNotificationRead: boolean }>();
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 1 });
      }
      if (document === NotificationPreviewDocument) {
        return Promise.resolve({ notifications: preview });
      }
      if (document === MarkNotificationReadDocument) return markPending.promise;
      return Promise.reject(new Error('Unexpected document'));
    });

    renderNotifications();
    await screen.findByRole('button', { name: 'Notifications, 1 unread' });
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));
    fireEvent.click(await screen.findByRole('button', { name: /Policy update/ }));

    expect(mocks.navigate).toHaveBeenCalledWith('/leave');
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();

    act(() => markPending.resolve({ markNotificationRead: true }));
  });
});

describe('NotificationDropdown interaction and layout', () => {
  it('keeps list semantics, shared Arrow navigation, outside dismissal, and opener restoration', async () => {
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications, 3 unread' });
    fireEvent.click(trigger);

    const list = await screen.findByRole('list', { name: 'Notification previews' });
    const notification = within(list).getByRole('button', { name: /Policy update/ });
    await waitFor(() => expect(document.activeElement).toBe(notification));
    fireEvent.keyDown(notification, { key: 'End' });
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: 'View all notifications' })
    );

    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('uses truthful region semantics and visual-viewport safe-area geometry', async () => {
    const longToken = 'NotificationTitle'.repeat(30);
    installDropdownGeometry();
    mocks.request.mockImplementation((document: unknown) => {
      if (document === UnreadNotificationCountDocument) {
        return Promise.resolve({ unreadNotificationCount: 0 });
      }
      if (document === NotificationPreviewDocument) {
        return Promise.resolve({
          notifications: [
            {
              ...preview[0],
              title: longToken,
              message: longToken,
              isRead: true,
            },
          ],
        });
      }
      return Promise.resolve({ markNotificationRead: true });
    });
    renderNotifications();
    const trigger = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(trigger);
    const panel = await screen.findByRole('region', { name: 'Notifications' });
    const heading = screen.getByRole('heading', { name: 'Notifications' });
    const title = await screen.findByText(longToken, { selector: '[data-notification-title]' });
    const message = screen.getByText(longToken, { selector: '[data-notification-message]' });

    expect(title.className).toContain('break-words');
    expect(title.className).toContain('[overflow-wrap:anywhere]');
    expect(message.className).toContain('break-words');
    expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
    expect(panel.getAttribute('aria-label')).toBeNull();
    expect(panel.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(panel.style.left).toBe('76px');
    expect(panel.style.top).toBe('92px');
    expect(panel.style.maxWidth).toBe('518px');
    expect(panel.style.maxHeight).toBe('434px');
    expect(panel.className).toContain('overscroll-contain');
  });
});
