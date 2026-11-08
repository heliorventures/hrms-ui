import { describe, expect, it } from 'vitest';

import { loanCsvCell } from './loanCsv';

describe('Authorized loan statement CSV', () => {
  it.each([
    '=HYPERLINK("https://example.test")',
    '+1+1',
    '@SUM(A1)',
    '-1+1',
    '\t=1+1',
    '  =1+1',
    '\ufeff=1+1',
  ])('prevents spreadsheet formulas in external references: %s', (value) => {
    expect(loanCsvCell(value).startsWith('"\'')).toBe(true);
  });
  it('preserves ordinary quoted references and multiline evidence as a single cell', () => {
    expect(loanCsvCell('Bank "A", ref\n123')).toBe('"Bank ""A"", ref\n123"');
  });
});
