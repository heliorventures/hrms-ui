// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AttendanceCurrentDayWindowDocument } from '../../../api/attendance/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';

import { useCurrentAttendanceDayWindow } from './useAttendanceDayWindows';

type GraphClient = ReturnType<typeof useGraphClient>;

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const windowResponse = (workDate: string, startsAt: string, endsAt: string) => ({
  attendanceDayWindow: {
    workDate,
    startsAt,
    endsAt,
    timezone: 'UTC',
    boundaryMinutes: 0,
  },
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-09-11T12:00:00Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useCurrentAttendanceDayWindow lifecycle', () => {
  it('refreshes at the exact exclusive attendance-day end', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        windowResponse('2026-09-11', '2026-09-10T12:01:00Z', '2026-09-11T12:01:00Z')
      )
      .mockResolvedValueOnce(
        windowResponse('2026-09-12', '2026-09-11T12:01:00Z', '2026-09-12T12:01:00Z')
      );
    const client = { request } as unknown as GraphClient;
    const { result } = renderHook(() => useCurrentAttendanceDayWindow(client, 'tenant-1:user-1'));
    await waitFor(() => expect(result.current.data?.workDate).toBe('2026-09-11'));

    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(request).toHaveBeenCalledTimes(2);
    expect(result.current.data?.workDate).toBe('2026-09-12');
  });

  it('refreshes when a suspended page regains focus without changing the selected period', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        windowResponse('2026-09-11', '2026-09-10T12:00:00Z', '2026-09-12T12:00:00Z')
      )
      .mockResolvedValueOnce(
        windowResponse('2026-09-12', '2026-09-11T12:00:00Z', '2026-09-13T12:00:00Z')
      );
    const client = { request } as unknown as GraphClient;
    const { result } = renderHook(() => useCurrentAttendanceDayWindow(client, 'tenant-1:user-1'));
    await waitFor(() => expect(result.current.data?.workDate).toBe('2026-09-11'));

    window.dispatchEvent(new Event('focus'));

    await waitFor(() => expect(result.current.data?.workDate).toBe('2026-09-12'));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('rejects an already-expired current-window response and fails closed', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        windowResponse('2026-09-10', '2026-09-09T12:00:00Z', '2026-09-11T11:59:59Z')
      );
    const client = { request } as unknown as GraphClient;
    const { result } = renderHook(() => useCurrentAttendanceDayWindow(client, 'tenant-1:user-1'));

    await waitFor(() => expect(result.current.phase).toBe('initial-error'));
    expect(result.current.data).toBeNull();
  });

  it('does not publish a delayed response after the client and identity change', async () => {
    const stale = deferred<ReturnType<typeof windowResponse>>();
    const oldRequest = vi.fn().mockReturnValue(stale.promise);
    const newRequest = vi
      .fn()
      .mockResolvedValue(
        windowResponse('2026-09-12', '2026-09-11T12:00:00Z', '2026-09-12T12:00:00Z')
      );
    let client = { request: oldRequest } as unknown as GraphClient;
    let identity = 'tenant-1:user-1';
    const { result, rerender } = renderHook(() => useCurrentAttendanceDayWindow(client, identity));
    await waitFor(() =>
      expect(oldRequest).toHaveBeenCalledWith(AttendanceCurrentDayWindowDocument)
    );

    client = { request: newRequest } as unknown as GraphClient;
    identity = 'tenant-2:user-2';
    rerender();
    await waitFor(() => expect(result.current.data?.workDate).toBe('2026-09-12'));

    await act(async () => {
      stale.resolve(windowResponse('2026-09-10', '2026-09-09T12:00:00Z', '2026-09-13T12:00:00Z'));
      await stale.promise;
    });

    expect(result.current.data?.workDate).toBe('2026-09-12');
  });
});
