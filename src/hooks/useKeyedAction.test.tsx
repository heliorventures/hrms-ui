// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { useKeyedAction } from './useKeyedAction';

it('isolates loading, prevents duplicate actions and releases failures for retry', async () => {
  const { result } = renderHook(() => useKeyedAction());
  let finish!: () => void;
  const operation = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.run('save', operation, 'Saved');
  });
  expect(result.current.isBusy('save')).toBe(true);
  expect(result.current.isBusy('open')).toBe(false);
  await act(async () => {
    await result.current.run('save', operation, 'Saved');
  });
  expect(operation).toHaveBeenCalledOnce();
  await act(async () => {
    finish();
    await pending;
  });
  expect(result.current.isBusy('save')).toBe(false);
  await act(async () => {
    await result.current.run('save', () => Promise.reject(new Error('Unavailable')), 'Saved');
  });
  expect(result.current.error).toBe('We could not complete this action. Try again.');
  expect(result.current.isBusy('save')).toBe(false);
});

it('suppresses stale completion messages while preserving three-argument notices', async () => {
  const { result } = renderHook(() => useKeyedAction());

  await act(async () => {
    await result.current.run('current', () => Promise.resolve(), 'Saved');
  });
  expect(result.current.notice).toBe('Saved');

  await act(async () => {
    await result.current.run('stale-success', () => Promise.resolve(), 'Stale', () => false);
  });
  expect(result.current.notice).toBeNull();
  expect(result.current.isBusy('stale-success')).toBe(false);

  await act(async () => {
    await result.current.run(
      'stale-error',
      () => Promise.reject(new Error('Unavailable')),
      'Stale',
      () => false
    );
  });
  expect(result.current.error).toBeNull();
  expect(result.current.isBusy('stale-error')).toBe(false);
});
