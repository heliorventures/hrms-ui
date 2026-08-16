import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatters';

describe('formatCurrency', () => {
  it('does not throw while a currency code is blank or partially entered', () => {
    expect(() => formatCurrency('1200', '')).not.toThrow();
    expect(() => formatCurrency('1200', 'IN')).not.toThrow();
  });

  it('normalizes a complete lowercase currency code', () => {
    expect(formatCurrency('1200', 'inr')).toContain('1,200');
  });
});
