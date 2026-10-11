import { describe, expect, it } from 'vitest';

import { parseLoanFinancialReport } from './loanFinancialReport';

describe('Loan financial integrity report', () => {
  const report = {
    loanId: 'loan-a',
    checkedAt: '2026-10-11T10:00:00Z',
    accountVersion: 4,
    issues: [],
  };
  it('keeps absence distinct from a completed healthy check', () => {
    expect(parseLoanFinancialReport(null, 'loan-a')).toBeNull();
    expect(parseLoanFinancialReport(report, 'loan-a')?.issues).toEqual([]);
  });
  it('rejects another account and incomplete evidence instead of displaying success', () => {
    expect(() => parseLoanFinancialReport(report, 'loan-b')).toThrow();
    expect(() => parseLoanFinancialReport({ ...report, issues: null }, 'loan-a')).toThrow();
    expect(() => parseLoanFinancialReport({ ...report, checkedAt: 'unknown' }, 'loan-a')).toThrow();
  });
  it('preserves a recovery hold even for a newer unrecognised issue code', () => {
    expect(
      parseLoanFinancialReport(
        { ...report, issues: [{ code: 'NEW_ISSUE', referenceId: null }] },
        'loan-a'
      )?.issues
    ).toHaveLength(1);
  });
});
