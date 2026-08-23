// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ConfirmDialog from './ConfirmDialog';

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
};

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

const baseProps = {
  open: true,
  title: 'Delete policy',
  description: 'This policy will no longer be available.',
  confirmLabel: 'Delete policy',
  onOpenChange: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('uses a synchronous gate to allow only one confirmation', async () => {
    const pending = deferred<void>();
    const onConfirm = vi.fn(() => pending.promise);
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    const confirm = screen.getByRole<HTMLButtonElement>('button', { name: 'Delete policy' });
    act(() => {
      confirm.click();
      confirm.click();
    });

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(confirm.disabled).toBe(true);
    await act(async () => pending.resolve());
    expect(baseProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('locks cancel, backdrop, and Escape while confirmation is pending', async () => {
    const user = userEventLibrary.setup();
    const pending = deferred<void>();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        onConfirm={() => pending.promise}
        onOpenChange={onOpenChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete policy' }));
    const cancel = screen.getByRole<HTMLButtonElement>('button', { name: 'Cancel' });
    expect(cancel.disabled).toBe(true);
    expect(screen.getByText('Working…')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByTestId('modal-backdrop'));
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => pending.resolve());
  });

  it('keeps the dialog open and presents friendly recovery after rejection', async () => {
    const user = userEventLibrary.setup();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        onConfirm={() => Promise.reject(new Error('database timeout with internal details'))}
        onOpenChange={onOpenChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete policy' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('could not be completed');
    expect(screen.getByRole('alert').textContent).not.toContain('database timeout');
    expect(screen.getByRole('dialog', { name: 'Delete policy' })).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Cancel' }).disabled).toBe(false);
  });

  it('keeps rejection recovery active after StrictMode replays effect setup', async () => {
    const user = userEventLibrary.setup();
    render(
      <StrictMode>
        <ConfirmDialog
          {...baseProps}
          onConfirm={() => Promise.reject(new Error('internal failure'))}
          onOpenChange={vi.fn()}
        />
      </StrictMode>
    );

    await user.click(screen.getByRole('button', { name: 'Delete policy' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('could not be completed');
  });

  it('treats external busy state as a complete dismissal lock', async () => {
    const user = userEventLibrary.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        busy
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    const cancel = screen.getByRole<HTMLButtonElement>('button', { name: 'Cancel' });
    expect(cancel.disabled).toBe(true);
    await user.click(cancel);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
