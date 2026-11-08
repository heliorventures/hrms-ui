// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ReconcileLoanFinancialsDocument } from '../../api/loans/graphql';

import LoanFinancialCheck from './LoanFinancialCheck';

const client = vi.hoisted(() => ({ request: vi.fn<unknown[], Promise<unknown>>() }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => client }));
afterEach(() => {
  cleanup();
  client.request.mockReset();
});
const report = {
  loanId: 'loan-a',
  accountVersion: 3,
  checkedAt: '2026-10-11T10:00:00Z',
  issues: [],
};

describe('HR Loan financial check', () => {
  it('does not describe an unchecked loan as healthy and reads the recorded report after checking', async () => {
    client.request
      .mockResolvedValueOnce({ loanFinancialReconciliation: null })
      .mockResolvedValueOnce({ reconcileLoanFinancials: report })
      .mockResolvedValueOnce({ loanFinancialReconciliation: report });
    render(<LoanFinancialCheck loanId="loan-a" version={3} />);
    await screen.findByText('No financial check has been recorded yet.');
    expect(screen.queryByText('No inconsistencies found at the last check.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Run financial check' }));
    await screen.findByText('No inconsistencies found at the last check.');
    expect(client.request.mock.calls[1]).toEqual([
      ReconcileLoanFinancialsDocument,
      { loanId: 'loan-a' },
    ]);
    await waitFor(() => expect(client.request).toHaveBeenCalledTimes(3));
  });
  it('retains the recovery hold when a new check fails', async () => {
    client.request
      .mockResolvedValueOnce({
        loanFinancialReconciliation: {
          ...report,
          issues: [{ code: 'ISSUED_SOURCE_MISMATCH', referenceId: 'source-a' }],
        },
      })
      .mockRejectedValueOnce(new Error('Network unavailable'));
    render(<LoanFinancialCheck loanId="loan-a" version={3} />);
    await screen.findByText(/Further Payroll\/FNF loan recovery/);
    fireEvent.click(screen.getByRole('button', { name: 'Run financial check' }));
    await screen.findByText('We could not complete this action. Try again.');
    expect(screen.getByText(/Further Payroll\/FNF loan recovery/)).toBeTruthy();
    expect(screen.queryByText('No inconsistencies found at the last check.')).toBeNull();
  });
  it('rejects an account mismatch instead of rendering its report', async () => {
    client.request.mockResolvedValue({
      loanFinancialReconciliation: { ...report, loanId: 'other-loan' },
    });
    render(<LoanFinancialCheck loanId="loan-a" version={3} />);
    await screen.findByRole('alert');
    expect(screen.queryByText('No inconsistencies found at the last check.')).toBeNull();
  });
  it('clearly identifies a check made before the latest loan change', async () => {
    client.request.mockResolvedValue({ loanFinancialReconciliation: report });
    render(<LoanFinancialCheck loanId="loan-a" version={4} />);
    await screen.findByText('Loan records changed after this check. Run a new check.');
  });
});
