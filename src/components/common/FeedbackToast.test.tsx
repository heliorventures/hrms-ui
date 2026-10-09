// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { useFeedbackState } from '../../hooks/useFeedbackState';
import { FeedbackContext } from '../../notifications/feedbackContext';
import FeedbackProvider from '../../notifications/FeedbackProvider';

import FeedbackToast from './FeedbackToast';
import Modal from './Modal';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('retains another owner when shared feedback is cleared or replaced', () => {
  const Owners = () => {
    const context = useContext(FeedbackContext);
    return (
      <>
        <button
          type="button"
          onClick={() => {
            context?.publish({ key: 'first', variant: 'error', content: 'Network failure.' });
            context?.publish({ key: 'second', variant: 'error', content: 'Network failure.' });
          }}
        >
          Load both
        </button>
        <button type="button" onClick={() => context?.dismiss('first', false)}>
          Clear first
        </button>
        <button
          type="button"
          onClick={() =>
            context?.publish({ key: 'first', variant: 'error', content: 'New failure.' })
          }
        >
          Replace first
        </button>
        <button type="button" onClick={() => context?.dismiss('second', false)}>
          Clear second
        </button>
      </>
    );
  };
  render(
    <FeedbackProvider scopeKey="settings">
      <Owners />
    </FeedbackProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Load both' }));
  expect(screen.getAllByRole('alert')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Clear first' }));
  expect(screen.getByRole('alert').textContent).toContain('Network failure.');
  fireEvent.click(screen.getByRole('button', { name: 'Replace first' }));
  expect(screen.getAllByRole('alert')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Clear second' }));
  expect(screen.getByRole('alert').textContent).toContain('New failure.');
});

it('never invokes a detached owner when dismissing the retained shared message', () => {
  const firstDismiss = vi.fn();
  const secondDismiss = vi.fn();
  const Owners = () => {
    const context = useContext(FeedbackContext);
    return (
      <>
        <button
          type="button"
          onClick={() => {
            context?.publish({
              key: 'first',
              variant: 'error',
              content: 'Shared failure.',
              onDismiss: firstDismiss,
            });
            context?.publish({
              key: 'second',
              variant: 'error',
              content: 'Shared failure.',
              onDismiss: secondDismiss,
            });
          }}
        >
          Load both
        </button>
        <button
          type="button"
          onClick={() =>
            context?.publish({
              key: 'second',
              variant: 'error',
              content: 'New failure.',
              onDismiss: secondDismiss,
            })
          }
        >
          Replace second
        </button>
      </>
    );
  };
  render(
    <FeedbackProvider scopeKey="settings">
      <Owners />
    </FeedbackProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Load both' }));
  fireEvent.click(screen.getByRole('button', { name: 'Replace second' }));
  fireEvent.click(
    screen
      .getAllByRole('alert')
      .find((item) => item.textContent?.includes('Shared failure.'))!
      .querySelector('button')!
  );
  expect(firstDismiss).toHaveBeenCalledOnce();
  expect(secondDismiss).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toContain('New failure.');
});

it('ignores a queued expiry belonging to a replaced notification', () => {
  vi.useFakeTimers();
  const timers = vi.spyOn(window, 'setTimeout');
  const { rerender } = render(
    <FeedbackProvider scopeKey="settings">
      <FeedbackToast>First failure.</FeedbackToast>
    </FeedbackProvider>
  );
  const oldExpiry = timers.mock.calls.find((call) => call[1] === 5_000)?.[0];
  rerender(
    <FeedbackProvider scopeKey="settings">
      <FeedbackToast>Second failure.</FeedbackToast>
    </FeedbackProvider>
  );
  act(() => {
    if (typeof oldExpiry !== 'function') throw new Error('Expected an expiry callback');
    oldExpiry();
  });
  expect(screen.getByRole('alert').textContent).toContain('Second failure.');
});

it('updates retry controls without restarting the expiry deadline', () => {
  vi.useFakeTimers();
  const view = (busy: boolean) => (
    <FeedbackProvider scopeKey="settings">
      <FeedbackToast
        action={
          <button type="button" disabled={busy}>
            Retry
          </button>
        }
      >
        Could not save.
      </FeedbackToast>
    </FeedbackProvider>
  );
  const { rerender } = render(view(false));
  act(() => {
    vi.advanceTimersByTime(4_000);
  });
  rerender(view(true));
  expect(screen.getByRole('button', { name: 'Retry' })).toHaveProperty('disabled', true);
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(screen.queryByRole('alert')).toBeNull();
});

it('expires both successes and errors without removing field error descriptions', () => {
  vi.useFakeTimers();
  render(
    <FeedbackProvider scopeKey="directory">
      <FeedbackToast variant="success">Saved.</FeedbackToast>
      <FeedbackToast id="name-error">Enter a name.</FeedbackToast>
    </FeedbackProvider>
  );
  expect(screen.getByRole('status').textContent).toContain('Saved.');
  expect(screen.getByRole('alert').textContent).toContain('Enter a name.');
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByRole('status')).toBeNull();
  expect(document.getElementById('name-error')?.textContent).toBe('Enter a name.');
});

it('keeps the original deadline when a parent rerenders with the same message', () => {
  vi.useFakeTimers();
  const view = (scopeKey = 'directory') => (
    <FeedbackProvider scopeKey={scopeKey}>
      <FeedbackToast>Could not save.</FeedbackToast>
    </FeedbackProvider>
  );
  const { rerender } = render(view());
  act(() => {
    vi.advanceTimersByTime(4_000);
  });
  rerender(view());
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(screen.queryByRole('alert')).toBeNull();
});

const RepeatedSave = () => {
  const [message, setMessage] = useFeedbackState<string | null>(null, 'success');
  return (
    <>
      <button type="button" onClick={() => setMessage('Saved.')}>
        Save
      </button>
      {message ? <FeedbackToast variant="success">{message}</FeedbackToast> : null}
    </>
  );
};

it('ignores old request setters after leaving and returning to a retained route', () => {
  let oldClear: () => void = () => undefined;
  let oldFailure: () => void = () => undefined;
  let capture = true;
  const RetainedForm = () => {
    const [message, setMessage] = useFeedbackState<string | null>(null, 'success');
    if (capture) {
      oldClear = () => setMessage(null);
      oldFailure = () => setMessage('Old failure.');
    }
    return (
      <>
        <button type="button" onClick={() => setMessage('New save.')}>
          Save
        </button>
        <span data-testid="retained-message">{message}</span>
        {message ? <FeedbackToast variant="success">{message}</FeedbackToast> : null}
      </>
    );
  };
  const view = (scopeKey: string) => (
    <FeedbackProvider scopeKey={scopeKey}>
      <RetainedForm />
    </FeedbackProvider>
  );
  const { rerender } = render(view('first'));
  capture = false;
  rerender(view('second'));
  rerender(view('first'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  act(() => {
    oldClear();
    oldFailure();
  });
  expect(screen.getByRole('status').textContent).toContain('New save.');
  expect(screen.getByTestId('retained-message').textContent).toBe('New save.');
  expect(screen.queryByText('Old failure.')).toBeNull();
});

it('shows repeated identical outcomes after the previous notification expires', () => {
  vi.useFakeTimers();
  render(
    <FeedbackProvider scopeKey="settings">
      <RepeatedSave />
    </FeedbackProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getAllByRole('status')).toHaveLength(1);
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getAllByRole('status')).toHaveLength(1);
});

it('merges a changed state message with its render adapter', () => {
  const Changes = () => {
    const [message, setMessage] = useFeedbackState<string | null>(null, 'success');
    return (
      <>
        <button type="button" onClick={() => setMessage('First save.')}>
          First
        </button>
        <button type="button" onClick={() => setMessage('Second save.')}>
          Second
        </button>
        {message ? <FeedbackToast variant="success">{message}</FeedbackToast> : null}
      </>
    );
  };
  render(
    <FeedbackProvider scopeKey="settings">
      <Changes />
    </FeedbackProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'First' }));
  fireEvent.click(screen.getByRole('button', { name: 'Second' }));
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toContain('Second save.');
});

it('clears messages on navigation and does not republish unchanged messages', () => {
  const view = (scopeKey: string) => (
    <FeedbackProvider scopeKey={scopeKey}>
      <FeedbackToast>Could not save.</FeedbackToast>
    </FeedbackProvider>
  );
  const { rerender } = render(view('first'));
  expect(screen.getByRole('alert')).toBeTruthy();
  rerender(view('second'));
  expect(screen.queryByRole('alert')).toBeNull();
});

it('keeps feedback after its initiating dialog closes', () => {
  const view = (open: boolean) => (
    <FeedbackProvider scopeKey="settings">
      {open ? <FeedbackToast variant="success">Saved.</FeedbackToast> : null}
    </FeedbackProvider>
  );
  const { rerender } = render(view(true));
  rerender(view(false));
  expect(screen.getByRole('status').textContent).toContain('Saved.');
});

it('keeps retry and dismiss controls available inside the active modal', () => {
  vi.useFakeTimers();
  const retry = vi.fn();
  render(
    <FeedbackProvider scopeKey="settings">
      <Modal isOpen onClose={() => undefined} title="Edit settings">
        <FeedbackToast
          action={
            <button type="button" onClick={retry}>
              Retry
            </button>
          }
        >
          Could not save.
        </FeedbackToast>
      </Modal>
    </FeedbackProvider>
  );
  const retryButton = screen.getByRole('button', { name: 'Retry' });
  expect(screen.getByRole('dialog').contains(retryButton)).toBe(true);
  fireEvent.click(retryButton);
  expect(retry).toHaveBeenCalledOnce();
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('dialog').contains(screen.getByRole('button', { name: 'Retry' }))).toBe(
    true
  );
});

it('allows manual dismissal while retaining the recovery action', () => {
  render(
    <FeedbackProvider scopeKey="settings">
      <FeedbackToast action={<button type="button">Retry</button>}>Could not save.</FeedbackToast>
    </FeedbackProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
});
