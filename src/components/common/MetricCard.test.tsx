// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import MetricCard from './MetricCard';

afterEach(cleanup);

describe('MetricCard', () => {
  it('uses tabular numerals for a ready value', () => {
    render(<MetricCard label="Available leave" value="12.5" context="Days remaining" />);

    expect(screen.getByText('12.5').className).toContain('tabular-nums');
    expect(screen.getByText('Days remaining')).not.toBeNull();
  });

  it('never turns a missing ready value into zero', () => {
    render(<MetricCard label="Pending expenses" />);

    expect(screen.getByText('Unavailable')).not.toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('renders numeric zero as a real tabular metric', () => {
    render(<MetricCard label="Pending expenses" value={0} />);

    expect(screen.getByText('0').className).toContain('tabular-nums');
    expect(screen.queryByText('Unavailable')).toBeNull();
  });

  it('renders explicit loading, unavailable, and error states', () => {
    const { rerender } = render(<MetricCard label="Headcount" state="loading" />);
    expect(screen.getByRole('status').textContent).toContain('Loading headcount.');

    rerender(<MetricCard label="Headcount" state="unavailable" />);
    expect(screen.getByText('Unavailable')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(<MetricCard label="Headcount" state="error" />);
    expect(screen.getByRole('alert').textContent).toContain('Headcount could not be loaded.');
  });

  it('keeps recovery actions available through state transitions', () => {
    let retries = 0;
    const retryAction = (
      <button type="button" onClick={() => (retries += 1)}>
        Retry
      </button>
    );
    const { rerender } = render(
      <MetricCard label="Headcount" state="error" action={retryAction} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retries).toBe(1);
    rerender(<MetricCard label="Headcount" state="loading" action={retryAction} />);
    expect(screen.getByRole('status').textContent).toContain('Loading headcount.');
    expect(screen.getByRole('button', { name: 'Retry' })).not.toBeNull();
    rerender(<MetricCard label="Headcount" value={42} />);
    expect(screen.getByText('42')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });
});
