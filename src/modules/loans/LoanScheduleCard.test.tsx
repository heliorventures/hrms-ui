// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { LoanSchedulePreviewDocument } from '../../api/loans/graphql';

import LoanScheduleCard from './LoanScheduleCard';

const request = vi.hoisted(() => vi.fn<unknown[], Promise<unknown>>());
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({ request }) }));
afterEach(() => {
  cleanup();
  request.mockReset();
});

it('loads the contractual schedule without asking for a replacement repayment date', async () => {
  request.mockResolvedValue({
    loanSchedulePreview: {
      basis: 'CURRENT_BALANCES',
      currency: { code: 'INR', minorUnits: 2 },
      schedule: {
        items: [],
        completionStatus: 'NO_REMAINING_BALANCE',
        expectedCompletionDate: null,
        lastScheduledDate: null,
        projectedInterest: '0',
        projectedTotalRepayment: '0',
        residualPrincipal: '0',
        residualInterest: '0',
        carry: '0',
      },
    },
  });
  render(<LoanScheduleCard loanId="loan-1" />);
  expect(screen.queryByLabelText('Projection first repayment date')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Preview repayment schedule' }));
  await screen.findByText('No remaining balance');
  expect(request).toHaveBeenCalledWith(LoanSchedulePreviewDocument, { loanId: 'loan-1' });
});
