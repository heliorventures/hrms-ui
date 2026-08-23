// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AsyncState from './AsyncState';

afterEach(cleanup);

describe('AsyncState', () => {
  it('announces loading without raising an alert', () => {
    render(
      <AsyncState
        kind="loading"
        title="Loading attendance"
        description="Your latest attendance is being prepared."
      />
    );

    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Loading attendance');
    expect(status.textContent).toContain('Your latest attendance is being prepared.');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(status.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps routine empty and unavailable states polite', () => {
    const { rerender } = render(
      <AsyncState
        kind="empty"
        title="No leave requests"
        description="New requests will appear here."
      />
    );

    expect(screen.getByRole('status').textContent).toContain('No leave requests');
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(
      <AsyncState
        kind="unavailable"
        title="Balances are unavailable"
        description="Try again in a few minutes."
      />
    );
    expect(screen.getByRole('status').textContent).toContain('Balances are unavailable');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('uses an alert for an error and renders its recovery action', () => {
    render(
      <AsyncState
        kind="error"
        title="Attendance could not be loaded"
        description="Try again."
        action={<button type="button">Retry</button>}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Attendance could not be loaded');
    expect(screen.getByRole('button', { name: 'Retry' })).not.toBeNull();
    expect(alert.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
