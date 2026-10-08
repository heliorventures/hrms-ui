// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnnouncementPreviewDocument } from '../../modules/notifications/notificationQueries';

import {
  notificationMocks,
  notificationTree,
  renderNotifications,
  setSuccessfulRequests,
} from './NotificationDropdown.testSupport';

describe('Notification drawer announcements', () => {
  it('clears loaded posts immediately when authorization changes in the same tenant', async () => {
    const mocks = notificationMocks();
    setSuccessfulRequests();
    const fallback = mocks.request.getMockImplementation();
    if (!fallback) throw new Error('Missing notification fixture');
    let requests = 0;
    let finishReload: ((data: { announcements: [] }) => void) | undefined;
    mocks.request.mockImplementation((document: unknown, variables: unknown) => {
      if (document !== AnnouncementPreviewDocument)
        return fallback(document, variables) as Promise<unknown>;
      requests += 1;
      if (requests === 1)
        return Promise.resolve({
          announcements: [
            {
              id: 'restricted',
              title: 'Restricted post',
              body: 'Confidential details',
              hasImageAttachment: false,
              hasDocumentAttachment: false,
            },
          ],
        });
      return new Promise<{ announcements: [] }>((resolve) => {
        finishReload = resolve;
      });
    });
    const view = renderNotifications();
    fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 3 unread' }));
    fireEvent.click(screen.getByRole('button', { name: 'Announcements' }));
    fireEvent.click(await screen.findByText('Restricted post'));
    if (!mocks.clientSession) throw new Error('Missing session fixture');
    mocks.clientSession = { ...mocks.clientSession, permissions: new Set() };
    view.rerender(notificationTree());
    expect(screen.queryByText('Restricted post')).toBeNull();
    expect(screen.queryByText('Confidential details')).toBeNull();
    await waitFor(() => expect(requests).toBe(2));
    await act(async () => {
      finishReload?.({ announcements: [] });
      await Promise.resolve();
    });
    expect(await screen.findByText('No announcements yet')).toBeTruthy();
  });

  it('loads announcements only on demand and expands a post without navigating', async () => {
    const mocks = notificationMocks();
    setSuccessfulRequests();
    const fallback = mocks.request.getMockImplementation();
    if (!fallback) throw new Error('Missing notification fixture');
    mocks.request.mockImplementation((document: unknown, variables: unknown) =>
      document === AnnouncementPreviewDocument
        ? Promise.resolve({
            announcements: [
              {
                id: 'post-1',
                title: 'Office update',
                body: 'The office opens at nine.',
                hasImageAttachment: false,
                hasDocumentAttachment: false,
              },
            ],
          })
        : (fallback(document, variables) as Promise<unknown>)
    );
    renderNotifications();
    fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 3 unread' }));
    await screen.findByText('Policy update');
    expect(mocks.request).not.toHaveBeenCalledWith(AnnouncementPreviewDocument, expect.anything());
    fireEvent.click(screen.getByRole('button', { name: 'Announcements' }));
    const summary = await screen.findByText('Office update');
    fireEvent.click(summary);
    expect(summary.closest('details')?.open).toBe(true);
    expect(screen.getByText('The office opens at nine.')).toBeTruthy();
    expect(mocks.request).toHaveBeenCalledWith(AnnouncementPreviewDocument, { limit: 3 });
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'View all announcements' }).getAttribute('href')).toBe(
      '/notifications'
    );
  });

  it('shows a retry when announcements fail and preserves access to personal alerts', async () => {
    renderNotifications();
    fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 3 unread' }));
    await screen.findByText('Policy update');
    fireEvent.click(screen.getByRole('button', { name: 'Announcements' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy());
    expect(screen.queryByText('No announcements yet')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'For you' }));
    expect(screen.getByText('Policy update')).toBeTruthy();
  });
});
