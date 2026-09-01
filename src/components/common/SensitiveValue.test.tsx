// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SensitiveValue from './SensitiveValue';

const VALUE = '4111 1111 1111 1111';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('SensitiveValue', () => {
  it('starts masked and does not offer reveal without permission', () => {
    render(
      <SensitiveValue
        label="Bank account"
        value={VALUE}
        maskedValue="•••• 1111"
        mayReveal={false}
      />
    );

    expect(screen.getByText('•••• 1111')).not.toBeNull();
    expect(screen.queryByText(VALUE)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show bank account' })).toBeNull();
  });

  it('requires a fresh reveal after permission is denied', () => {
    const { rerender } = render(
      <SensitiveValue label="Bank account" value={VALUE} maskedValue="•••• 1111" mayReveal />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
    expect(screen.getByText(VALUE)).not.toBeNull();

    rerender(
      <SensitiveValue
        label="Bank account"
        value={VALUE}
        maskedValue="•••• 1111"
        mayReveal={false}
      />
    );
    expect(screen.queryByText(VALUE)).toBeNull();

    rerender(
      <SensitiveValue label="Bank account" value={VALUE} maskedValue="•••• 1111" mayReveal />
    );
    expect(screen.queryByText(VALUE)).toBeNull();
  });

  it('requires a fresh reveal when the mounted value changes', () => {
    vi.useFakeTimers();
    const replacementValue = '5555 5555 5555 4444';
    const { rerender } = render(
      <SensitiveValue label="Bank account" value={VALUE} maskedValue="•••• 1111" mayReveal />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
    expect(screen.getByText(VALUE)).not.toBeNull();
    expect(vi.getTimerCount()).toBe(1);

    rerender(
      <SensitiveValue
        label="Bank account"
        value={replacementValue}
        maskedValue="•••• 4444"
        mayReveal
      />
    );

    expect(screen.queryByText(VALUE)).toBeNull();
    expect(screen.queryByText(replacementValue)).toBeNull();
    expect(screen.getByText('•••• 4444')).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
    expect(screen.getByText(replacementValue)).not.toBeNull();
  });

  it('re-masks after 30 seconds and clears its timer on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <SensitiveValue label="Bank account" value={VALUE} maskedValue="•••• 1111" mayReveal />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
    expect(screen.getByText(VALUE)).not.toBeNull();
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      void vi.advanceTimersByTime(29_999);
    });
    expect(screen.getByText(VALUE)).not.toBeNull();
    act(() => {
      void vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText(VALUE)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('honors a caller-provided re-mask interval', () => {
    vi.useFakeTimers();
    render(
      <SensitiveValue
        label="Bank account"
        value={VALUE}
        maskedValue="•••• 1111"
        mayReveal
        remaskAfterMs={5_000}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
    act(() => {
      void vi.advanceTimersByTime(4_999);
    });
    expect(screen.getByText(VALUE)).not.toBeNull();
    act(() => {
      void vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText(VALUE)).toBeNull();
  });
});

describe('SensitiveValue clipboard handling', () => {
  it('copies only while the value is explicitly revealed', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      render(
        <SensitiveValue
          label="Bank account"
          value={VALUE}
          maskedValue="•••• 1111"
          mayReveal
          copyable
        />
      );

      expect(screen.queryByRole('button', { name: 'Copy bank account' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy bank account' }));

      await waitFor(() => expect(writeText).toHaveBeenCalledWith(VALUE));
      expect(screen.getByRole('status').textContent).toBe('Copied.');

      fireEvent.click(screen.getByRole('button', { name: 'Hide bank account' }));
      expect(screen.queryByRole('button', { name: 'Copy bank account' })).toBeNull();
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  it('uses friendly copy feedback when clipboard access is unavailable', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Reflect.deleteProperty(navigator, 'clipboard');

    try {
      render(
        <SensitiveValue
          label="Bank account"
          value={VALUE}
          maskedValue="•••• 1111"
          mayReveal
          copyable
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy bank account' }));

      await waitFor(() =>
        expect(screen.getByRole('status').textContent).toBe(
          'Copy is unavailable. Select the value and copy it manually.'
        )
      );
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
  });

  it('handles a rejected clipboard write without logging sensitive data', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard access denied'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    try {
      render(
        <SensitiveValue
          label="Bank account"
          value={VALUE}
          maskedValue="•••• 1111"
          mayReveal
          copyable
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy bank account' }));

      await waitFor(() =>
        expect(screen.getByRole('status').textContent).toBe(
          'Copy is unavailable. Select the value and copy it manually.'
        )
      );
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });
});

describe('SensitiveValue composite identity', () => {
  it('requires a fresh reveal when value changes under a stable resolver and ignores stale rejection', async () => {
    vi.useFakeTimers();
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    let rejectWrite: ((reason?: unknown) => void) | undefined;
    let resolvedValue = 'Resolved account A';
    const resolveValue = vi.fn(() => resolvedValue);
    const writeText = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectWrite = reject;
        })
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    try {
      const { rerender } = render(
        <SensitiveValue
          label="Bank account"
          value="employee-a"
          resolveValue={resolveValue}
          maskedValue="Hidden account A"
          mayReveal
          copyable
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy bank account' }));
      expect(writeText).toHaveBeenCalledWith('Resolved account A');
      expect(vi.getTimerCount()).toBe(1);
      resolvedValue = 'Resolved account B';
      rerender(
        <SensitiveValue
          label="Bank account"
          value="employee-b"
          resolveValue={resolveValue}
          maskedValue="Hidden account B"
          mayReveal
          copyable
        />
      );
      expect(screen.queryByText('Resolved account A')).toBeNull();
      expect(screen.queryByText('Resolved account B')).toBeNull();
      expect(screen.getByText('Hidden account B')).not.toBeNull();
      expect(screen.queryByRole('button', { name: 'Copy bank account' })).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
      await act(async () => {
        rejectWrite?.(new Error('Stale clipboard failure for account A'));
        await Promise.resolve();
      });
      expect(screen.queryByRole('status')).toBeNull();
      expect(writeText).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      expect(screen.getByText('Resolved account B')).not.toBeNull();
      expect(resolveValue).toHaveBeenCalledTimes(2);
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });
});

describe('SensitiveValue pending clipboard privacy', () => {
  it('ignores stale copy success when the value changes during the write', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    let resolveWrite: (() => void) | undefined;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        })
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    try {
      const replacementValue = '5555 5555 5555 4444';
      const { rerender } = render(
        <SensitiveValue
          label="Bank account"
          value={VALUE}
          maskedValue="•••• 1111"
          mayReveal
          copyable
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy bank account' }));
      expect(writeText).toHaveBeenCalledWith(VALUE);

      rerender(
        <SensitiveValue
          label="Bank account"
          value={replacementValue}
          maskedValue="•••• 4444"
          mayReveal
          copyable
        />
      );
      await act(async () => {
        resolveWrite?.();
        await Promise.resolve();
      });

      expect(screen.queryByText(replacementValue)).toBeNull();
      expect(screen.getByText('•••• 4444')).not.toBeNull();
      expect(screen.queryByText('Copied.')).toBeNull();
      expect(writeText).toHaveBeenCalledTimes(1);
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  it('ignores stale copy success when permission is revoked during the write', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    let resolveWrite: (() => void) | undefined;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        })
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    try {
      const { rerender } = render(
        <SensitiveValue
          label="Bank account"
          value={VALUE}
          maskedValue="•••• 1111"
          mayReveal
          copyable
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Show bank account' }));
      fireEvent.click(screen.getByRole('button', { name: 'Copy bank account' }));

      rerender(
        <SensitiveValue
          label="Bank account"
          value={VALUE}
          maskedValue="•••• 1111"
          mayReveal={false}
          copyable
        />
      );
      await act(async () => {
        resolveWrite?.();
        await Promise.resolve();
      });

      expect(screen.queryByText(VALUE)).toBeNull();
      expect(screen.queryByText('Copied.')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Copy bank account' })).toBeNull();
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });
});
