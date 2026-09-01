// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationsPage from './NotificationsPage';

const boardHook = vi.hoisted(() => ({
  useNotificationBoard: vi.fn(),
}));

vi.mock('./useNotificationBoard', () => ({
  useNotificationBoard: boardHook.useNotificationBoard,
}));

vi.mock('./CreateAnnouncementModal', () => ({
  default: () => null,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => false,
    clientSession: {
      jwtRoles: [],
      permissions: new Set(),
      resourceScopes: {},
      persona: 'EMPLOYEE',
      mustChangePassword: false,
    },
    tenantId: 'tenant-a',
  }),
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant-a' } }),
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => ({ request: vi.fn() }),
}));

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const announcement = (index: number) => ({
  id: `announcement-${index}`,
  title: `Announcement ${index}`,
  body: `Announcement body ${index}`,
  targetAudience: 'ALL',
  targetDepartmentId: null,
  targetLocationId: null,
  publishAt: null,
  expiresAt: null,
  postSource: 'company_announcement',
  hasImageAttachment: false,
  hasDocumentAttachment: false,
});

const notification = (index: number) => ({
  id: `notification-${index}`,
  kind: 'personal',
  title: `Private notification ${index}`,
  message: `Private notification message ${index}`,
  actionUrl: '/notifications',
  isRead: false,
  createdAt: '2026-08-21T08:00:00.000Z',
});

function boardState(overrides: Record<string, unknown> = {}) {
  return {
    actionBusy: false,
    announcements: [],
    announcementsMayBeCapped: false,
    deptNameById: new Map<string, string>(),
    error: null,
    filter: 'all',
    filteredNotifications: [],
    hasLoadedData: true,
    loading: false,
    markAllRead: vi.fn(() => Promise.resolve()),
    markRead: vi.fn(() => Promise.resolve()),
    notificationsMayBeCapped: false,
    phase: 'ready',
    refreshBoard: vi.fn(() => Promise.resolve()),
    setFilter: vi.fn(),
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture}>
      <NotificationsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  boardHook.useNotificationBoard.mockReturnValue(boardState());
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NotificationsPage truthful states', () => {
  it('renders an actionable initial failure without rendering valid empty lists', async () => {
    const refreshBoard = vi.fn(() => Promise.resolve());
    boardHook.useNotificationBoard.mockReturnValue(
      boardState({
        error: 'We could not complete this action. Try again.',
        hasLoadedData: false,
        phase: 'initial-error',
        refreshBoard,
      })
    );
    const user = userEvent.setup();
    renderPage();

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Notifications Could Not Be Loaded');
    expect(screen.queryByText('No Announcements Found.')).toBeNull();
    expect(screen.queryByText('No Notifications found')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refreshBoard).toHaveBeenCalledTimes(1);
  });

  it('uses Title Case and an ellipsis for the initial loading title', () => {
    boardHook.useNotificationBoard.mockReturnValue(
      boardState({
        hasLoadedData: false,
        loading: true,
        phase: 'initial-loading',
      })
    );
    renderPage();

    expect(screen.getByText('Loading Notifications…')).toBeTruthy();
  });

  it('renders both intentional empty states after a successful empty response', () => {
    renderPage();

    expect(screen.getByText('No Announcements Found.')).toBeTruthy();
    expect(screen.getByText('No Notifications found')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('retains both lists and offers recovery after a refresh failure', async () => {
    const refreshBoard = vi.fn(() => Promise.resolve());
    boardHook.useNotificationBoard.mockReturnValue(
      boardState({
        announcements: [announcement(1)],
        error: 'We could not complete this action. Try again.',
        filteredNotifications: [notification(1)],
        phase: 'stale-error',
        refreshBoard,
      })
    );
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText('Announcement 1')).toBeTruthy();
    expect(screen.getByText('Private notification 1')).toBeTruthy();
    expect(screen.getByText('Notifications May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Showing the last loaded data.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refreshBoard).toHaveBeenCalledTimes(1);
  });

  it('uses a Title Case ellipsis status while refreshing retained lists', () => {
    boardHook.useNotificationBoard.mockReturnValue(
      boardState({
        announcements: [announcement(1)],
        filteredNotifications: [notification(1)],
        loading: true,
        phase: 'refreshing',
      })
    );
    renderPage();

    expect(screen.getByText('Refreshing Notifications…')).toBeTruthy();
    expect(screen.getByText('Announcement 1')).toBeTruthy();
    expect(screen.getByText('Private notification 1')).toBeTruthy();
  });

  it('shows possible cap guidance for each collection that reaches 20 items', () => {
    boardHook.useNotificationBoard.mockReturnValue(
      boardState({
        announcements: Array.from({ length: 20 }, (_, index) => announcement(index)),
        announcementsMayBeCapped: true,
        filteredNotifications: Array.from({ length: 20 }, (_, index) => notification(index)),
        notificationsMayBeCapped: true,
      })
    );
    renderPage();

    expect(
      screen.getAllByText('Showing up to 20 recent items. More may be available.')
    ).toHaveLength(2);
  });
});
