// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MaskedAmount from './MaskedAmount';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('MaskedAmount', () => {
  it('formats only on explicit reveal and re-masks after 30 seconds', () => {
    vi.useFakeTimers();
    const formatter = vi.fn((amount: number) => `INR ${amount.toFixed(2)}`);
    const { container, rerender } = render(
      <MaskedAmount amount={1250} formatter={formatter} className="payroll-total" />
    );

    expect(container.firstElementChild?.className).toContain('payroll-total');
    expect(screen.getByText('XXXX')).not.toBeNull();
    expect(screen.queryByText('INR 1250.00')).toBeNull();
    expect(formatter).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Show amount' }));
    expect(formatter).toHaveBeenCalledTimes(1);
    expect(formatter).toHaveBeenCalledWith(1250);
    expect(screen.getByText('INR 1250.00')).not.toBeNull();

    rerender(<MaskedAmount amount={1250} formatter={formatter} className="payroll-total" />);
    expect(formatter).toHaveBeenCalledTimes(1);
    expect(screen.getByText('INR 1250.00')).not.toBeNull();

    act(() => {
      void vi.advanceTimersByTime(29_999);
    });
    expect(screen.getByText('INR 1250.00')).not.toBeNull();
    act(() => {
      void vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('INR 1250.00')).toBeNull();
    expect(screen.getByText('XXXX')).not.toBeNull();
  });

  it('uses the default Indian rupee formatter only after reveal', () => {
    render(<MaskedAmount amount={1250} />);

    expect(screen.getByText('XXXX')).not.toBeNull();
    expect(screen.queryByText('₹1,250')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show amount' }));
    expect(screen.getByText('₹1,250')).not.toBeNull();
  });

  it('requires a new reveal when the amount or formatter identity changes', () => {
    const firstFormatter = vi.fn((amount: number) => `First ${amount}`);
    const secondFormatter = vi.fn((amount: number) => `Second ${amount}`);
    const { rerender } = render(<MaskedAmount amount={100} formatter={firstFormatter} />);

    fireEvent.click(screen.getByRole('button', { name: 'Show amount' }));
    expect(screen.getByText('First 100')).not.toBeNull();

    rerender(<MaskedAmount amount={200} formatter={firstFormatter} />);
    expect(screen.queryByText('First 100')).toBeNull();
    expect(screen.getByText('XXXX')).not.toBeNull();
    expect(firstFormatter).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Show amount' }));
    expect(screen.getByText('First 200')).not.toBeNull();
    rerender(<MaskedAmount amount={200} formatter={secondFormatter} />);
    expect(screen.queryByText('First 200')).toBeNull();
    expect(screen.getByText('XXXX')).not.toBeNull();
    expect(secondFormatter).not.toHaveBeenCalled();
  });

  it('stays masked with friendly retry guidance when the lazy formatter throws', () => {
    const formatter = vi.fn(() => {
      throw new Error('Formatter exposed amount 987654');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      render(<MaskedAmount amount={987654} formatter={formatter} />);

      expect(() =>
        fireEvent.click(screen.getByRole('button', { name: 'Show amount' }))
      ).not.toThrow();
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(screen.getByText('XXXX')).not.toBeNull();
      expect(screen.queryByText('987654')).toBeNull();
      expect(document.body.textContent).not.toContain('Formatter exposed amount');
      expect(screen.getByRole('status').textContent).toBe(
        'Unable to reveal this value. Try again.'
      );
      expect(consoleError).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Show amount' }));
      expect(formatter).toHaveBeenCalledTimes(2);
      expect(screen.getByText('XXXX')).not.toBeNull();
    } finally {
      consoleError.mockRestore();
    }
  });
});
