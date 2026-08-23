// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationsPreview from './NotificationsPreview';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

vi.mock('../../notifications/CreateAnnouncementModal', () => ({
  default: ({ isOpen, onCreated }: { isOpen: boolean; onCreated?: () => void }) =>
    isOpen ? (
      <button type="button" onClick={onCreated}>
        Complete Team Post
      </button>
    ) : null,
}));

vi.mock('../../notifications/components/AnnouncementAttachmentAction', () => ({
  default: () => null,
}));

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
};

const announcement = (index: number) => ({
  id: `announcement-${index}`,
  title: `Announcement ${index}`,
  body: `Announcement body ${index}`,
  targetAudience: 'ALL',
  targetDepartmentId: null,
  targetLocationId: null,
  postSource: 'company_announcement',
  publishAt: null,
  expiresAt: null,
  hasImageAttachment: false,
  hasDocumentAttachment: false,
});

const notification = (index: number) => ({
  id: `notification-${index}`,
  title: `Notification ${index}`,
  message: `Notification message ${index}`,
  isRead: false,
});

const board = (announcementCount = 0, notificationCount = 0) => ({
  unreadNotificationCount: notificationCount,
  announcements: Array.from({ length: announcementCount }, (_, index) => announcement(index)),
  notifications: Array.from({ length: notificationCount }, (_, index) => notification(index)),
});

function renderPreview(fullHeight = false) {
  return render(
    <MemoryRouter future={routerFuture}>
      <NotificationsPreview fullHeight={fullHeight} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  graphState.client.request = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NotificationsPreview truthful states', () => {
  it('renders an actionable initial failure without valid empty copy', async () => {
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));
    renderPreview();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Announcements and Notifications Could Not Be Loaded');
    expect(alert.textContent).toContain('Check your connection and try again.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.queryByText('No Announcements or Notifications Yet.')).toBeNull();
  });

  it('renders intentional empty copy only after a successful empty response', async () => {
    graphState.client.request.mockResolvedValue(board());
    renderPreview();

    expect(await screen.findByText('No Announcements or Notifications Yet.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows loading while retrying an initial failure and then renders ready data', async () => {
    const retry = deferred<ReturnType<typeof board>>();
    graphState.client.request
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockImplementationOnce(() => retry.promise);
    const user = userEvent.setup();
    renderPreview();

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Loading Announcements and Notifications…')).toBeTruthy();

    act(() => retry.resolve(board(1, 1)));
    expect(await screen.findByText('Announcement 0')).toBeTruthy();
    expect(screen.getByText('Notification 0')).toBeTruthy();
  });

  it('retains loaded data and offers retry when a team-post refresh fails', async () => {
    graphState.client.request
      .mockResolvedValueOnce(board(1, 1))
      .mockRejectedValueOnce(new Error('Failed to fetch'));
    const user = userEvent.setup();
    renderPreview();

    await screen.findByText('Announcement 0');
    await user.click(screen.getByRole('button', { name: 'Team Post' }));
    await user.click(screen.getByRole('button', { name: 'Complete Team Post' }));

    expect(
      await screen.findByText('Announcements and Notifications May Be Out of Date')
    ).toBeTruthy();
    expect(screen.getByText('Announcement 0')).toBeTruthy();
    expect(screen.getByText('Notification 0')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it.each([
    { fullHeight: false, limit: 3 },
    { fullHeight: true, limit: 20 },
  ])(
    'shows possibility wording at the $limit-item compact/full caps',
    async ({ fullHeight, limit }) => {
      graphState.client.request.mockResolvedValue(board(limit, limit));
      renderPreview(fullHeight);

      await screen.findByText('Announcement 0');
      expect(
        screen.getByText(`Showing up to ${limit} announcements. More may be available.`)
      ).toBeTruthy();
      expect(
        screen.getByText(`Showing up to ${limit} notifications. More may be available.`)
      ).toBeTruthy();
      expect(graphState.client.request).toHaveBeenCalledWith(expect.anything(), { limit });
    }
  );
});

describe('NotificationsPreview content resilience', () => {
  it('does not leak an unhandled rejection when a post-triggered refresh fails', async () => {
    graphState.client.request
      .mockResolvedValueOnce(board(1, 0))
      .mockRejectedValueOnce(new Error('Failed to fetch'));
    const unhandled = vi.fn();
    window.addEventListener('unhandledrejection', unhandled);
    const user = userEvent.setup();
    renderPreview();

    await screen.findByText('Announcement 0');
    await user.click(screen.getByRole('button', { name: 'Team Post' }));
    await user.click(screen.getByRole('button', { name: 'Complete Team Post' }));
    await screen.findByText('Announcements and Notifications May Be Out of Date');
    await waitFor(() => expect(unhandled).not.toHaveBeenCalled());

    window.removeEventListener('unhandledrejection', unhandled);
  });

  it('uses Title Case controls and safely contains long notification content', async () => {
    const longAnnouncementTitle = `Announcement ${'A'.repeat(120)}`;
    const longAnnouncementBody = `Body ${'B'.repeat(160)}`;
    const longNotificationTitle = `Notification ${'C'.repeat(120)}`;
    const longNotificationMessage = `Message ${'D'.repeat(160)}`;
    graphState.client.request.mockResolvedValue({
      unreadNotificationCount: 1,
      announcements: [
        { ...announcement(0), title: longAnnouncementTitle, body: longAnnouncementBody },
      ],
      notifications: [
        {
          ...notification(0),
          title: longNotificationTitle,
          message: longNotificationMessage,
        },
      ],
    });
    renderPreview();

    expect(
      await screen.findByRole('heading', { name: 'Announcements & Notifications' })
    ).toBeTruthy();
    expect(screen.getByText('Public Announcements')).toBeTruthy();
    expect(screen.getByText('For You')).toBeTruthy();
    const actionCluster = screen.getByRole('button', { name: 'Team Post' }).parentElement;
    expect(actionCluster?.className).toContain('min-w-0');
    expect(actionCluster?.className).toContain('flex-wrap');
    expect(screen.getByRole('link', { name: 'View All' })).toBeTruthy();
    for (const content of [
      longAnnouncementTitle,
      longAnnouncementBody,
      longNotificationTitle,
      longNotificationMessage,
    ]) {
      const { className } = screen.getByText(content);
      expect(className).toContain('break-words');
      expect(className).toContain('[overflow-wrap:anywhere]');
    }
    expect(document.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses a Title Case fallback for an untitled notification', async () => {
    graphState.client.request.mockResolvedValue({
      ...board(),
      notifications: [{ ...notification(0), title: null }],
    });
    renderPreview();

    expect(await screen.findByText('Untitled Notification')).toBeTruthy();
  });
});
