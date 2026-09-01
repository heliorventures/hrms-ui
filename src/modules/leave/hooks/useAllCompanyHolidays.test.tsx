// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AllCompanyHolidaysQuery } from '../../../api/graphql/graphql';
import { useAllCompanyHolidays, type AllCompanyHolidaysClient } from './useAllCompanyHolidays';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useAllCompanyHolidays', () => {
  it('owns the holiday dialog loading lifecycle and closes without discarding loaded rows', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T10:00:00'));
    const requests: Array<{ fromDate: string; limit: number }> = [];
    const rows = [{ id: 'holiday-1' }] as AllCompanyHolidaysQuery['upcomingHolidays'];
    const client: AllCompanyHolidaysClient = {
      request: async <T,>(_document: unknown, variables: { fromDate: string; limit: number }) => {
        requests.push(variables);
        return { upcomingHolidays: rows } as T;
      },
    };
    const { result } = renderHook(() => useAllCompanyHolidays(client, 450));

    await act(async () => {
      await result.current.open();
    });
    expect(requests).toEqual([{ fromDate: '2026-01-01', limit: 450 }]);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.rows).toBe(rows);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.rows).toBe(rows);
  });

  it('preserves loaded holidays and exposes a retryable user-facing failure', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T10:00:00'));
    const rows = [{ id: 'holiday-1' }] as AllCompanyHolidaysQuery['upcomingHolidays'];
    let attempt = 0;
    const client: AllCompanyHolidaysClient = {
      request: async <T,>() => {
        attempt += 1;
        if (attempt === 2) throw new Error('network error');
        return { upcomingHolidays: rows } as T;
      },
    };
    const { result } = renderHook(() => useAllCompanyHolidays(client, 450));

    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      await result.current.open();
    });

    expect(result.current.rows).toBe(rows);
    expect(result.current.failure).toBe(
      'We could not connect right now. Check your connection and try again.'
    );
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.retry();
    });
    expect(attempt).toBe(3);
    expect(result.current.failure).toBeNull();
    expect(result.current.rows).toBe(rows);
  });

  it('ignores a late response from a replaced client', async () => {
    let resolveFirst: ((value: unknown) => void) | undefined;
    const firstClient: AllCompanyHolidaysClient = {
      request: <T,>() => new Promise<T>((resolve) => {
        resolveFirst = resolve as (value: unknown) => void;
      }),
    };
    const secondRows = [{ id: 'holiday-b' }] as AllCompanyHolidaysQuery['upcomingHolidays'];
    const secondClient: AllCompanyHolidaysClient = {
      request: async <T,>() => ({ upcomingHolidays: secondRows }) as T,
    };
    const { result, rerender } = renderHook(
      ({ client }) => useAllCompanyHolidays(client, 450),
      { initialProps: { client: firstClient } }
    );

    act(() => {
      void result.current.open();
    });
    rerender({ client: secondClient });
    expect(result.current.rows).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      resolveFirst?.({ upcomingHolidays: [{ id: 'holiday-a' }] });
    });

    expect(result.current.rows).toBe(secondRows);
  });
});
