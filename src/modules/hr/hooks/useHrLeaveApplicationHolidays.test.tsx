// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { useHrLeaveApplicationHolidays } from './useHrLeaveApplicationHolidays';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, reject, resolve };
};

const holidays = [
  {
    id: 'holiday-1',
    calendarId: 'calendar-1',
    calendarName: 'Default',
    holidayDate: '2026-10-02',
    name: 'Gandhi Jayanti',
    holidayType: 'PUBLIC',
  },
];

afterEach(() => {
  vi.useRealTimers();
});

it('loads once per identity and does not reload for queue view changes', async () => {
  const client = { request: vi.fn().mockResolvedValue({ upcomingHolidays: holidays }) };
  const { result, rerender } = renderHook(
    ({ identity }) => useHrLeaveApplicationHolidays({ client, identity }),
    { initialProps: { identity: 'tenant-a:user-a:permissions-a' } }
  );

  await act(() => result.current.load());
  rerender({ identity: 'tenant-a:user-a:permissions-a' });
  await act(() => result.current.load());

  expect(client.request).toHaveBeenCalledTimes(1);
  expect(result.current.rows).toEqual(holidays);
});

it('exposes a failed load and retries it', async () => {
  const client = {
    request: vi
      .fn()
      .mockRejectedValueOnce(new Error('Holiday calendar unavailable'))
      .mockResolvedValueOnce({ upcomingHolidays: holidays }),
  };
  const { result } = renderHook(() =>
    useHrLeaveApplicationHolidays({ client, identity: 'tenant-a:user-a:permissions-a' })
  );

  await act(() => result.current.load());
  expect(result.current.failure).toBe('We could not complete this action. Try again.');
  expect(result.current.ready).toBe(false);

  await act(() => result.current.retry());
  expect(result.current.failure).toBeNull();
  expect(result.current.ready).toBe(true);
  expect(result.current.rows).toEqual(holidays);
});

it('never publishes an old identity response during an A-B-A transition', async () => {
  const firstA = deferred<{ upcomingHolidays: typeof holidays }>();
  const b = deferred<{ upcomingHolidays: typeof holidays }>();
  const secondA = deferred<{ upcomingHolidays: typeof holidays }>();
  const client = {
    request: vi
      .fn()
      .mockReturnValueOnce(firstA.promise)
      .mockReturnValueOnce(b.promise)
      .mockReturnValueOnce(secondA.promise),
  };
  const { result, rerender } = renderHook(
    ({ identity }) => useHrLeaveApplicationHolidays({ client, identity }),
    { initialProps: { identity: 'identity-a' } }
  );

  act(() => {
    void result.current.load();
  });
  rerender({ identity: 'identity-b' });
  act(() => {
    void result.current.load();
  });
  rerender({ identity: 'identity-a' });
  act(() => {
    void result.current.load();
  });

  await act(() => {
    firstA.resolve({ upcomingHolidays: holidays });
    return Promise.resolve();
  });
  expect(result.current.ready).toBe(false);
  expect(result.current.rows).toEqual([]);

  await act(() => {
    secondA.resolve({ upcomingHolidays: holidays });
    return Promise.resolve();
  });
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.rows).toEqual(holidays);

  b.resolve({ upcomingHolidays: [] });
});

it('times out a hung request and lets retry own the eventual result', async () => {
  vi.useFakeTimers();
  const hung = deferred<{ upcomingHolidays: typeof holidays }>();
  const client = {
    request: vi
      .fn()
      .mockReturnValueOnce(hung.promise)
      .mockResolvedValueOnce({ upcomingHolidays: holidays }),
  };
  const { result } = renderHook(() =>
    useHrLeaveApplicationHolidays({ client, identity: 'tenant-a:user-a:permissions-a' })
  );

  act(() => {
    void result.current.load();
  });
  await act(() => vi.advanceTimersByTimeAsync(30_000));
  expect(result.current.failure).toBe('Company holidays took too long to load. Try again.');
  expect(result.current.loading).toBe(false);

  await act(() => result.current.retry());
  expect(result.current.rows).toEqual(holidays);
  hung.resolve({ upcomingHolidays: [] });
  await act(() => Promise.resolve());
  expect(result.current.rows).toEqual(holidays);
});

it('keeps the new identity timeout active when an older request settles', async () => {
  vi.useFakeTimers();
  const first = deferred<{ upcomingHolidays: typeof holidays }>();
  const second = deferred<{ upcomingHolidays: typeof holidays }>();
  const client = {
    request: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
  };
  const { result, rerender } = renderHook(
    ({ identity }) => useHrLeaveApplicationHolidays({ client, identity }),
    { initialProps: { identity: 'identity-a' } }
  );
  act(() => {
    void result.current.load();
  });
  rerender({ identity: 'identity-b' });
  act(() => {
    void result.current.load();
  });
  await act(() => {
    first.resolve({ upcomingHolidays: holidays });
    return Promise.resolve();
  });
  await act(() => vi.advanceTimersByTimeAsync(30_000));
  expect(result.current.failure).toBe('Company holidays took too long to load. Try again.');
  expect(result.current.loading).toBe(false);
});

it('refreshes expired holiday context on the next application open', async () => {
  vi.useFakeTimers();
  const client = { request: vi.fn().mockResolvedValue({ upcomingHolidays: holidays }) };
  const { result } = renderHook(() =>
    useHrLeaveApplicationHolidays({ client, identity: 'identity-a' })
  );
  await act(() => result.current.load());
  await act(() => vi.advanceTimersByTimeAsync(5 * 60 * 1000));
  client.request.mockResolvedValue({ upcomingHolidays: [] });
  await act(() => result.current.load());
  expect(client.request).toHaveBeenCalledTimes(2);
  expect(result.current.rows).toEqual([]);
  expect(result.current.ready).toBe(true);
});

it('aborts the previous network request when its identity is replaced', () => {
  const signals: AbortSignal[] = [];
  const client = {
    request: vi.fn().mockImplementation((options: { signal: AbortSignal }) => {
      signals.push(options.signal);
      return new Promise(() => undefined);
    }),
  };
  const { result, rerender, unmount } = renderHook(
    ({ identity }) => useHrLeaveApplicationHolidays({ client, identity }),
    { initialProps: { identity: 'identity-a' } }
  );
  act(() => {
    void result.current.load();
  });
  rerender({ identity: 'identity-b' });
  expect(signals[0]?.aborted).toBe(true);
  act(() => {
    void result.current.load();
  });
  expect(signals[1]?.aborted).toBe(false);
  unmount();
  expect(signals[1]?.aborted).toBe(true);
});
