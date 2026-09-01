// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { clearTimeout as clearNodeTimeout, setTimeout as setNodeTimeout } from 'node:timers';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFlashToast, type FlashToastShow } from './useFlashToast';

const createTimerHandle = () => {
  const handle = setNodeTimeout(() => undefined, 0);
  clearNodeTimeout(handle);
  return handle;
};

function typeCheckRecoverableErrorFlash(show: FlashToastShow) {
  // @ts-expect-error Error toasts must declare that they are recoverable without user action.
  show('Attendance was not saved.', 'error');
  show('Attendance was not saved.', 'error', { recoverableWithoutAction: true });
}

void typeCheckRecoverableErrorFlash;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  cleanup();
});

describe('useFlashToast', () => {
  it('keeps the public return shape stable', () => {
    const { result } = renderHook(() => useFlashToast());

    expect(Object.keys(result.current).sort()).toEqual(['clear', 'flash', 'show']);
  });

  it('expires success and information messages', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlashToast(2_000));

    act(() => result.current.show(' Saved. ', 'success'));
    expect(result.current.flash).toEqual({ text: 'Saved.', variant: 'success' });
    act(() => {
      void vi.advanceTimersByTime(2_000);
    });
    expect(result.current.flash).toBeNull();

    act(() => result.current.show('Updated.'));
    act(() => {
      void vi.advanceTimersByTime(2_000);
    });
    expect(result.current.flash).toBeNull();
  });

  it('keeps explicitly recoverable errors until explicitly cleared', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlashToast(1_000));

    act(() => result.current.show('Attendance was not saved.', 'error', { recoverableWithoutAction: true }));
    act(() => {
      void vi.advanceTimersByTime(60_000);
    });
    expect(result.current.flash).toEqual({
      text: 'Attendance was not saved.',
      variant: 'error',
      recoverableWithoutAction: true,
    });

    act(() => result.current.clear());
    expect(result.current.flash).toBeNull();
  });

  it('cleans timers when a message is replaced and when the hook unmounts', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useFlashToast(5_000));

    act(() => result.current.show('First message.', 'success'));
    expect(vi.getTimerCount()).toBe(1);
    act(() => result.current.show('Second message.', 'info'));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not let an expiring transient clear a replacement error at the old deadline', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlashToast(1_000));

    act(() => result.current.show('Saved.', 'success'));
    act(() => {
      void vi.advanceTimersByTime(999);
      result.current.show('Attendance was not saved.', 'error', { recoverableWithoutAction: true });
      void vi.advanceTimersByTime(1);
    });

    expect(result.current.flash).toEqual({
      text: 'Attendance was not saved.',
      variant: 'error',
      recoverableWithoutAction: true,
    });
    act(() => {
      void vi.advanceTimersByTime(60_000);
    });
    expect(result.current.flash).toEqual({
      text: 'Attendance was not saved.',
      variant: 'error',
      recoverableWithoutAction: true,
    });
  });

  it('gives a replacement transient its full duration after the old deadline', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlashToast(1_000));

    act(() => result.current.show('First message.', 'success'));
    act(() => {
      void vi.advanceTimersByTime(999);
      result.current.show('Second message.', 'info');
      void vi.advanceTimersByTime(1);
    });
    expect(result.current.flash).toEqual({ text: 'Second message.', variant: 'info' });

    act(() => {
      void vi.advanceTimersByTime(998);
    });
    expect(result.current.flash).toEqual({ text: 'Second message.', variant: 'info' });
    act(() => {
      void vi.advanceTimersByTime(1);
    });
    expect(result.current.flash).toBeNull();
  });
});

describe('useFlashToast duration ownership', () => {
  it('restarts a transient with the new full duration when duration changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ duration }) => useFlashToast(duration), {
      initialProps: { duration: 1_000 },
    });

    act(() => result.current.show('Saved.', 'success'));
    act(() => {
      void vi.advanceTimersByTime(500);
    });
    rerender({ duration: 2_000 });
    act(() => {
      void vi.advanceTimersByTime(1_999);
    });
    expect(result.current.flash).toEqual({ text: 'Saved.', variant: 'success' });
    act(() => {
      void vi.advanceTimersByTime(1);
    });
    expect(result.current.flash).toBeNull();
  });

  it('ignores an old expiry queued after render adopts a new duration identity', () => {
    let queuedExpiry: (() => void) | undefined;
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout').mockImplementation((handler) => {
      if (typeof handler !== 'function') throw new Error('Expected a timer callback');
      queuedExpiry = handler;
      return createTimerHandle();
    });

    try {
      const { result, rerender } = renderHook(
        ({ duration, runQueuedExpiry }) => {
          const toast = useFlashToast(duration);
          if (runQueuedExpiry && queuedExpiry) {
            const oldExpiry = queuedExpiry;
            queuedExpiry = undefined;
            oldExpiry();
          }
          return toast;
        },
        { initialProps: { duration: 1_000, runQueuedExpiry: false } }
      );

      act(() => result.current.show('Saved.', 'success'));
      expect(queuedExpiry).toBeTypeOf('function');

      rerender({ duration: 2_000, runQueuedExpiry: true });
      expect(result.current.flash).toEqual({ text: 'Saved.', variant: 'success' });
      expect(queuedExpiry).toBeTypeOf('function');

      act(() => queuedExpiry?.());
      expect(result.current.flash).toBeNull();
    } finally {
      setTimeoutSpy.mockRestore();
    }
  });

  it('treats -0 and +0 as one duration identity for ownership and expiry', () => {
    vi.useFakeTimers();
    const queuedCallbacks: Array<() => void> = [];
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout').mockImplementation((handler) => {
      if (typeof handler !== 'function') {
        throw new Error('Expected a timer callback');
      }

      queuedCallbacks.push(handler);
      return createTimerHandle();
    });

    try {
      const { result, rerender } = renderHook(({ duration }) => useFlashToast(duration), {
        initialProps: { duration: -0 },
      });

      act(() => result.current.show('Saved.', 'success'));
      expect(queuedCallbacks).toHaveLength(1);

      rerender({ duration: 0 });
      expect(queuedCallbacks).toHaveLength(1);

      act(() => queuedCallbacks[0]?.());
      expect(result.current.flash).toBeNull();
    } finally {
      setTimeoutSpy.mockRestore();
    }
  });
});
