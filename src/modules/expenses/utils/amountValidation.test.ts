import { describe, expect, it } from 'vitest';

import { normalizeMoneyForInput, parseStrictMoney } from './amountValidation';

describe('expense money normalization', () => {
  it('accepts database decimals whose extra precision is only trailing zeroes', () => {
    expect(normalizeMoneyForInput('751.0000')).toBe('751.00');
    expect(normalizeMoneyForInput('751.2300')).toBe('751.23');
    expect(parseStrictMoney('751.0000')).toBe(751);
  });

  it('rejects values with more than two non-zero decimal places', () => {
    expect(normalizeMoneyForInput('751.0010')).toBeNull();
    expect(Number.isNaN(parseStrictMoney('751.0010'))).toBe(true);
  });
});
