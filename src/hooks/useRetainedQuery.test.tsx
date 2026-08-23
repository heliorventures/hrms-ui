// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRetainedQuery } from './useRetainedQuery';

interface Deferred<T> {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
  let reject!: (reason?: unknown) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useRetainedQuery', () => {
  it('publishes data and ready after the initial load succeeds', async () => {
    const load = () => Promise.resolve('first result');
    const { result } = renderHook(() => useRetainedQuery(load));

    expect(result.current).toMatchObject({ data: null, error: null, phase: 'initial-loading' });

    await waitFor(() =>
      expect(result.current).toMatchObject({ data: 'first result', error: null, phase: 'ready' })
    );
  });

  it('publishes an initial error when the first load fails without data', async () => {
    const toMessage = vi.fn(() => 'Initial request failed');
    const load = async () => Promise.reject(new Error('initial failure'));
    const { result } = renderHook(() => useRetainedQuery(load, toMessage));

    await waitFor(() =>
      expect(result.current).toMatchObject({
        data: null,
        error: 'Initial request failed',
        phase: 'initial-error',
      })
    );
  });

  it('publishes refreshing while a manual refresh is pending', async () => {
    const refresh = deferred<string>();
    let calls = 0;
    const load = () => {
      calls += 1;
      return calls === 1 ? Promise.resolve('retained result') : refresh.promise;
    };
    const { result } = renderHook(() => useRetainedQuery(load));

    await waitFor(() => expect(result.current.phase).toBe('ready'));
    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = result.current.refresh();
    });

    expect(result.current).toMatchObject({
      data: 'retained result',
      error: null,
      phase: 'refreshing',
    });

    await act(async () => {
      refresh.resolve('refreshed result');
      await refreshPromise;
    });
    expect(result.current).toMatchObject({ data: 'refreshed result', error: null, phase: 'ready' });
  });

  it('retains the last success and reports stale-error when refresh fails', async () => {
    const toMessage = vi.fn(() => 'Refresh failed');
    let calls = 0;
    const load = () => {
      calls += 1;
      return calls === 1
        ? Promise.resolve('last successful data')
        : Promise.reject(new Error('refresh'));
    };
    const { result } = renderHook(() => useRetainedQuery(load, toMessage));

    await waitFor(() => expect(result.current.phase).toBe('ready'));

    await act(async () => {
      await expect(result.current.refresh()).resolves.toBeUndefined();
    });

    expect(result.current.data).toEqual('last successful data');
    expect(result.current).toMatchObject({ error: 'Refresh failed', phase: 'stale-error' });
  });

  it('recovers from stale-error after a later refresh succeeds', async () => {
    let calls = 0;
    const load = () => {
      calls += 1;
      if (calls === 1) return Promise.resolve('last successful data');
      if (calls === 2) return Promise.reject(new Error('refresh failed'));
      return Promise.resolve('recovered data');
    };
    const { result } = renderHook(() => useRetainedQuery(load));

    await waitFor(() => expect(result.current.phase).toBe('ready'));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.phase).toBe('stale-error');

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current).toMatchObject({ data: 'recovered data', error: null, phase: 'ready' });
  });
});

describe('useRetainedQuery request ownership', () => {
  it('starts a new authoritative load when the loader identity changes', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const firstLoad = () => first.promise;
    const secondLoad = () => second.promise;
    const { result, rerender } = renderHook(({ load }) => useRetainedQuery(load), {
      initialProps: { load: firstLoad },
    });

    rerender({ load: secondLoad });

    expect(result.current).toMatchObject({ data: null, error: null, phase: 'initial-loading' });
    await act(async () => {
      second.resolve('second source');
      await second.promise;
    });
    expect(result.current).toMatchObject({ data: 'second source', error: null, phase: 'ready' });

    await act(async () => {
      first.resolve('stale first source');
      await first.promise;
    });
    expect(result.current.data).toBe('second source');
  });

  it('suppresses updates and React warnings after unmount', async () => {
    const pending = deferred<string>();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const load = () => pending.promise;
    const { unmount } = renderHook(() => useRetainedQuery(load));

    unmount();
    await act(async () => {
      pending.resolve('late result');
      await pending.promise;
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it('only publishes the latest request when requests complete out of order', async () => {
    const requests: Array<Deferred<string>> = [];
    const load = () => {
      const request = deferred<string>();
      requests.push(request);
      return request.promise;
    };
    const { result } = renderHook(() => useRetainedQuery(load));

    await waitFor(() => expect(requests).toHaveLength(1));
    let latestRefresh!: Promise<void>;
    act(() => {
      latestRefresh = result.current.refresh();
    });
    expect(requests).toHaveLength(2);

    await act(async () => {
      requests[1].resolve('latest result');
      await latestRefresh;
    });
    await act(async () => {
      requests[0].resolve('stale result');
      await requests[0].promise;
    });

    expect(result.current).toMatchObject({ data: 'latest result', error: null, phase: 'ready' });
  });

  it('uses the same request path for automatic and manual refreshes', async () => {
    const requests: Array<Deferred<string>> = [];
    const load = () => {
      const request = deferred<string>();
      requests.push(request);
      return request.promise;
    };
    const { result } = renderHook(() => useRetainedQuery(load));

    await waitFor(() => expect(requests).toHaveLength(1));
    let manualRefresh!: Promise<void>;
    act(() => {
      manualRefresh = result.current.refresh();
    });
    expect(requests).toHaveLength(2);

    await act(async () => {
      requests[1].resolve('manual result');
      await manualRefresh;
    });
    await act(async () => {
      requests[0].reject(new Error('superseded automatic request'));
      await requests[0].promise.catch(() => undefined);
    });

    expect(result.current).toMatchObject({ data: 'manual result', error: null, phase: 'ready' });
  });
});
