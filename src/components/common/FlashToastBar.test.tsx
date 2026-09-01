// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFlashToast } from '../../hooks/useFlashToast';

import FlashToastBar from './FlashToastBar';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const FlashToastHarness = () => {
  const { flash, show, clear } = useFlashToast(1_000);

  return (
    <>
      <button
        type="button"
        onClick={() => show('Attendance was not saved.', 'error', { recoverableWithoutAction: true })}
      >
        Show error
      </button>
      <FlashToastBar toast={flash} onDismiss={clear} />
    </>
  );
};

describe('FlashToastBar', () => {
  it('announces successful actions politely', () => {
    render(
      <FlashToastBar
        toast={{ text: 'Attendance saved.', variant: 'success' }}
        onDismiss={() => undefined}
      />
    );

    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Attendance saved.');
  });

  it('announces explicitly recoverable errors assertively', () => {
    render(
      <FlashToastBar
        toast={{
          text: 'Attendance was not saved.',
          variant: 'error',
          recoverableWithoutAction: true,
        }}
        onDismiss={() => undefined}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('aria-atomic')).toBe('true');
    expect(alert.textContent).toContain('Attendance was not saved.');
  });

  it('activates the supplied dismiss handler', () => {
    let dismissals = 0;
    render(
      <FlashToastBar
        toast={{ text: 'Attendance saved.', variant: 'success' }}
        onDismiss={() => (dismissals += 1)}
      />
    );

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    expect(dismissButton.className).toContain('min-h-11');
    expect(dismissButton.className).toContain('min-w-11');
    expect(dismissButton.className).toContain('md:min-h-6');
    expect(dismissButton.className).toContain('md:min-w-6');

    fireEvent.click(dismissButton);
    expect(dismissals).toBe(1);
  });

  it('keeps an integrated error visible until explicit dismissal', () => {
    vi.useFakeTimers();
    render(<FlashToastHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Show error' }));
    expect(screen.getByRole('alert').textContent).toContain('Attendance was not saved.');
    act(() => {
      void vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole('alert').textContent).toContain('Attendance was not saved.');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
