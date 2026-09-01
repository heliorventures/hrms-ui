// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MarkNotificationReadDocument,
  NotificationBoardSummaryDocument,
  OrgDepartmentsDocument,
} from '../../api/graphql/graphql';

import { useNotificationBoard } from './useNotificationBoard';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

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
  kind: 'personal',
  title: `Notification ${index}`,
  message: `Notification message ${index}`,
  actionUrl: '/notifications',
  isRead: false,
  createdAt: '2026-08-21T08:00:00.000Z',
});

const boardData = (announcementCount = 1, notificationCount = 1) => ({
  unreadNotificationCount: notificationCount,
  announcements: Array.from({ length: announcementCount }, (_, index) => announcement(index)),
  notifications: Array.from({ length: notificationCount }, (_, index) => notification(index)),
});

beforeEach(() => {
  graphState.client = { request: vi.fn() };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('useNotificationBoard', () => {
  it('publishes initial failure without claiming that board data loaded', async () => {
    graphState.client.request.mockImplementation((document: unknown) => {
      if (document === OrgDepartmentsDocument) return Promise.resolve({ departments: [] });
      if (document === NotificationBoardSummaryDocument) {
        return Promise.reject(new Error('notifications unavailable'));
      }
      throw new Error('Unexpected document');
    });

    const { result } = renderHook(() => useNotificationBoard());

    await waitFor(() => expect(result.current.phase).toBe('initial-error'));
    expect(result.current.hasLoadedData).toBe(false);
    expect(result.current.announcements).toEqual([]);
    expect(result.current.filteredNotifications).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it('reports possible caps only when successful collections reach the board limit', async () => {
    graphState.client.request.mockImplementation((document: unknown, variables?: unknown) => {
      if (document === OrgDepartmentsDocument) {
        expect(variables).toEqual({ limit: 100 });
        return Promise.resolve({ departments: [] });
      }
      if (document === NotificationBoardSummaryDocument) {
        expect(variables).toEqual({ limit: 20 });
        return Promise.resolve(boardData(20, 20));
      }
      throw new Error('Unexpected document');
    });

    const { result } = renderHook(() => useNotificationBoard());

    await waitFor(() => expect(result.current.phase).toBe('ready'));
    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.announcementsMayBeCapped).toBe(true);
    expect(result.current.notificationsMayBeCapped).toBe(true);
  });

  it('keeps a successful board when department labels cannot be loaded', async () => {
    graphState.client.request.mockImplementation((document: unknown) => {
      if (document === OrgDepartmentsDocument) {
        return Promise.reject(new Error('department labels unavailable'));
      }
      if (document === NotificationBoardSummaryDocument) return Promise.resolve(boardData());
      throw new Error('Unexpected document');
    });

    const { result } = renderHook(() => useNotificationBoard());

    await waitFor(() => expect(result.current.phase).toBe('ready'));
    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.announcements).toHaveLength(1);
    expect(result.current.filteredNotifications).toHaveLength(1);
    expect(result.current.deptNameById.size).toBe(0);
  });

  it('retains the previous board and reports recovery when a mark-read refresh fails', async () => {
    let boardRequests = 0;
    graphState.client.request.mockImplementation((document: unknown) => {
      if (document === OrgDepartmentsDocument) return Promise.resolve({ departments: [] });
      if (document === NotificationBoardSummaryDocument) {
        boardRequests += 1;
        return boardRequests === 1
          ? Promise.resolve(boardData())
          : Promise.reject(new Error('refresh unavailable'));
      }
      if (document === MarkNotificationReadDocument) {
        return Promise.resolve({ markNotificationRead: true });
      }
      throw new Error('Unexpected document');
    });

    const { result } = renderHook(() => useNotificationBoard());
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    const previousAnnouncements = result.current.announcements;
    const previousNotifications = result.current.filteredNotifications;

    await act(async () => {
      await expect(result.current.markRead('notification-0')).resolves.toBeUndefined();
    });

    expect(result.current.phase).toBe('stale-error');
    expect(result.current.announcements).toEqual(previousAnnouncements);
    expect(result.current.filteredNotifications).toEqual(previousNotifications);
    expect(result.current.hasLoadedData).toBe(true);
    expect(result.current.error).toBeTruthy();
    expect(result.current.actionBusy).toBe(false);
  });
});
