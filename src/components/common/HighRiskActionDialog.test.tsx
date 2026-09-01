// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HighRiskActionDialog from './HighRiskActionDialog';

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
  action: 'Terminate tenant',
  target: 'Acme India',
  scope: 'All tenant users and records',
  consequence: 'Users immediately lose access.',
  confirmLabel: 'Terminate tenant',
  onOpenChange: vi.fn(),
};

describe('HighRiskActionDialog', () => {
  it('renders one complete summary with separate visible reason and exact-phrase controls', () => {
    render(
      <HighRiskActionDialog
        {...baseProps}
        confirmationText="TERMINATE Acme India"
        requireReason
        onConfirm={() => undefined}
      />
    );

    expect(screen.getAllByText('Terminate tenant')).toHaveLength(2);
    expect(screen.getAllByText('Acme India')).toHaveLength(1);
    expect(screen.getAllByText('All tenant users and records')).toHaveLength(1);
    expect(screen.getAllByText('Users immediately lose access.')).toHaveLength(1);
    expect(screen.getByLabelText('Reason')).toBeTruthy();
    expect(screen.getByLabelText('Type TERMINATE Acme India to confirm')).toBeTruthy();

    const dialog = screen.getByRole('dialog', { name: 'High-risk action' });
    const description = document.getElementById(dialog.getAttribute('aria-describedby') ?? '');
    expect(description?.tagName).toBe('P');
    expect(description?.querySelector('div')).toBeNull();
  });

  it('requires a trimmed reason and an exact case-and-whitespace-sensitive phrase', async () => {
    const user = userEventLibrary.setup();
    const onConfirm = vi.fn();
    render(
      <HighRiskActionDialog
        {...baseProps}
        confirmationText="TERMINATE Acme India"
        requireReason
        onConfirm={onConfirm}
      />
    );

    const reason = screen.getByLabelText('Reason');
    const phrase = screen.getByLabelText('Type TERMINATE Acme India to confirm');
    const confirm = screen.getByRole<HTMLButtonElement>('button', { name: 'Terminate tenant' });

    fireEvent.change(reason, { target: { value: '  Approved change request  ' } });
    fireEvent.change(phrase, { target: { value: 'terminate Acme India' } });
    expect(confirm.disabled).toBe(true);
    fireEvent.change(phrase, { target: { value: 'TERMINATE Acme India ' } });
    expect(confirm.disabled).toBe(true);
    fireEvent.change(phrase, { target: { value: 'TERMINATE Acme India' } });
    expect(confirm.disabled).toBe(false);

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('Approved change request');
  });

  it('synchronously locks submission and every dismissal path until settlement', async () => {
    const pending = deferred<void>();
    const onConfirm = vi.fn(() => pending.promise);
    const onOpenChange = vi.fn();
    render(
      <HighRiskActionDialog
        {...baseProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    const confirm = screen.getByRole<HTMLButtonElement>('button', { name: 'Terminate tenant' });
    act(() => {
      confirm.click();
      confirm.click();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Cancel' }).disabled).toBe(true);
    expect(screen.getByText('Working…')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByTestId('modal-backdrop'));
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => pending.resolve());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('preserves both values and shows friendly recovery when confirmation fails', async () => {
    const user = userEventLibrary.setup();
    render(
      <HighRiskActionDialog
        {...baseProps}
        confirmationText="TERMINATE Acme India"
        requireReason
        onConfirm={() => Promise.reject(new Error('raw GraphQL failure'))}
      />
    );

    const reason = screen.getByLabelText<HTMLInputElement>('Reason');
    const phrase = screen.getByLabelText<HTMLInputElement>('Type TERMINATE Acme India to confirm');
    fireEvent.change(reason, { target: { value: 'Security review approved' } });
    fireEvent.change(phrase, { target: { value: 'TERMINATE Acme India' } });
    await user.click(screen.getByRole('button', { name: 'Terminate tenant' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('could not be completed');
    expect(screen.getByRole('alert').textContent).not.toContain('GraphQL');
    expect(reason.value).toBe('Security review approved');
    expect(phrase.value).toBe('TERMINATE Acme India');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Cancel' }).disabled).toBe(false);
  });

  it('keeps rejection recovery active after StrictMode replays effect setup', async () => {
    const user = userEventLibrary.setup();
    render(
      <StrictMode>
        <HighRiskActionDialog
          {...baseProps}
          onConfirm={() => Promise.reject(new Error('internal failure'))}
          onOpenChange={vi.fn()}
        />
      </StrictMode>
    );

    await user.click(screen.getByRole('button', { name: 'Terminate tenant' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('could not be completed');
  });
});
