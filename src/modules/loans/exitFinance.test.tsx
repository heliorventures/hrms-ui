// @vitest-environment jsdom
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApproveSeparationWithFinanceDocument,
  SaveLoanExitReviewDocument,
} from '../../api/loans/graphql';

import { exitExposure } from './exitFinanceModel';
import FnfFinancialSummary from './FnfFinancialSummary';
import { fnfSources, initialFnfSources } from './fnfSourceForm';
import { useExitFinanceApproval } from './useExitFinanceApproval';

const request = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({ request }) }));
afterEach(() => {
  cleanup();
  request.mockReset();
});
const exposure = {
  fingerprint: 'a'.repeat(64),
  asOf: '2026-10-11',
  settlementDate: '2026-10-31',
  loans: [],
};
describe('Exit financial review', () => {
  it('retries the same saved decision after an uncertain HR approval response', async () => {
    request
      .mockResolvedValueOnce({ saveLoanExitReview: { id: 'saved-review' } })
      .mockRejectedValueOnce(new Error('Connection lost'))
      .mockResolvedValueOnce({});
    const saved = vi.fn(async () => {});
    const { result } = renderHook(() => useExitFinanceApproval('separation', saved));
    const fields = [{ key: 'reason', label: 'Decision' }];
    await act(() => result.current.approve(exposure, 'source', { reason: 'Reviewed' }, fields));
    expect(saved).not.toHaveBeenCalled();
    await act(() => result.current.approve(exposure, 'source', { reason: 'Reviewed' }, fields));
    expect(request).toHaveBeenCalledTimes(3);
    expect(request).toHaveBeenNthCalledWith(1, SaveLoanExitReviewDocument, expect.anything());
    for (const call of [2, 3])
      expect(request).toHaveBeenNthCalledWith(call, ApproveSeparationWithFinanceDocument, {
        separationId: 'separation',
        financeReviewId: 'saved-review',
      });
    expect(saved).toHaveBeenCalledOnce();
  });
  it('shows zero employee cash and the remaining loan as separate financial outcomes', () => {
    render(
      <FnfFinancialSummary
        financials={{
          currency: 'INR',
          valueDate: '2026-10-11',
          availablePayout: '12000',
          otherRecoveries: '0',
          loanRecovered: '12000',
          employeePayout: '0',
          residualLoanReceivable: '8000',
        }}
      />
    );
    expect(screen.getByText('Employee cash payout').nextElementSibling?.textContent).toBe('0');
    expect(screen.getByText('Remaining loan receivable').nextElementSibling?.textContent).toBe(
      '8000'
    );
  });
  it('requires complete financial data rather than treating missing balances as zero', () => {
    expect(() => exitExposure({ ...exposure, loans: [{ loanId: 'loan' }] })).toThrow();
    const initial = initialFnfSources(null);
    expect(initial.values).toEqual({});
    expect(initial.sources).toHaveLength(3);
  });
  it('retains existing paid amounts and OTHER recovery allocations when editing sources', () => {
    const input = {
      financialApprovalReference: 'approved',
      sources: [
        {
          sourceId: 'benefit',
          kind: 'BONUS',
          amount: '10000',
          alreadyPaid: '1000',
          otherRecovery: '2000',
          eligibleForLoan: true,
          approvalReference: 'set-off',
        },
      ],
    };
    const initial = initialFnfSources(input);
    expect(fnfSources(initial.sources, initial.values)).toEqual(input.sources);
  });
});
