// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { useTenantCalendarDate } from './useTenantCalendarDate';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-09-11T18:29:59.999Z'));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('expires eligibility at the exact tenant-calendar midnight', async () => {
  const { result } = renderHook(() => useTenantCalendarDate('Asia/Kolkata', 'tenant-1:user-1'));
  expect(result.current).toBe('2026-09-11');

  await act(async () => {
    vi.advanceTimersByTime(1);
    await Promise.resolve();
  });

  expect(result.current).toBe('2026-09-12');
});

it('refreshes a suspended owner on focus and resets for a replacement identity', async () => {
  let identity = 'tenant-1:user-1';
  const { result, rerender } = renderHook(() => useTenantCalendarDate('Asia/Kolkata', identity));
  vi.setSystemTime(new Date('2026-09-12T18:30:00Z'));
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
    await Promise.resolve();
  });
  expect(result.current).toBe('2026-09-13');

  identity = 'tenant-2:user-2';
  vi.setSystemTime(new Date('2026-09-13T18:30:00Z'));
  rerender();
  expect(result.current).toBe('2026-09-14');
});
