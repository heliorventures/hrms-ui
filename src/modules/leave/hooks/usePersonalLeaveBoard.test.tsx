// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

import { usePersonalLeaveBoard, type PersonalLeaveClient } from './usePersonalLeaveBoard';

afterEach(cleanup);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((ok, fail) => {
    resolve = ok;
    reject = fail;
  });
  return { promise, resolve, reject };
}
const response = (count: number) => ({ leaveRequestCount: count }) as LeaveBoardQuery;

describe('personal leave board request ordering', () => {
  it('keeps the newest response when an earlier request completes later', async () => {
    const older = deferred<LeaveBoardQuery>();
    const newer = deferred<LeaveBoardQuery>();
    const request = vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const client = { request } as unknown as PersonalLeaveClient;
    const { result } = renderHook(() => usePersonalLeaveBoard(client, 2026, 0));
    act(() => {
      void result.current.refresh();
    });
    await act(async () => {
      newer.resolve(response(2));
      await newer.promise;
    });
    await act(async () => {
      older.resolve(response(1));
      await older.promise;
    });
    expect(result.current.data?.leaveRequestCount).toBe(2);
    expect(result.current.loading).toBe(false);
  });
  it('ignores an older failure and cannot refresh after unmount', async () => {
    const older = deferred<LeaveBoardQuery>();
    const request = vi.fn().mockReturnValueOnce(older.promise).mockResolvedValue(response(2));
    const client = { request } as unknown as PersonalLeaveClient;
    const { result, unmount } = renderHook(() => usePersonalLeaveBoard(client, 2026, 0));
    await act(async () => result.current.refresh());
    await act(async () => {
      older.reject(new Error('obsolete failure'));
      await older.promise.catch(() => undefined);
    });
    expect(result.current.failure).toBeNull();
    const { refresh } = result.current;
    unmount();
    await refresh();
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('reports an active failure and recovers with retry', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValue(response(2));
    const client = { request } as unknown as PersonalLeaveClient;
    const { result } = renderHook(() => usePersonalLeaveBoard(client, 2026, 0));
    await waitFor(() => expect(result.current.failure?.operation).toBe('board'));
    await act(async () => result.current.refresh());
    expect(result.current.failure).toBeNull();
    expect(result.current.data?.leaveRequestCount).toBe(2);
  });
});
