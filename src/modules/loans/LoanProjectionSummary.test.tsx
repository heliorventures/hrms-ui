// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LoanProjectionSummary from './LoanProjectionSummary';

const projection = {
  basis: 'CURRENT_BALANCES',
  currency: { code: 'INR', minorUnits: 2 },
  schedule: {
    completionStatus: 'PROJECTED_PAYOFF',
    expectedCompletionDate: '2027-06-30',
    lastScheduledDate: '2027-06-30',
    projectedInterest: '321.45',
    projectedTotalRepayment: '10321.45',
    items: [],
    residualPrincipal: '0',
    residualInterest: '0',
    carry: '0',
  },
};
afterEach(cleanup);

describe('Loan repayment projection summary', () => {
  it('displays the server completion date and financial totals independently of schedule rows', () => {
    render(<LoanProjectionSummary projection={projection} />);
    expect(screen.getByText('Expected completion').nextElementSibling?.textContent).toBe(
      '2027-06-30'
    );
    expect(screen.getByText('Projected interest').nextElementSibling?.textContent).toBe(
      'INR 321.45'
    );
    expect(screen.getByText('Projected total repayment').nextElementSibling?.textContent).toBe(
      'INR 10321.45'
    );
  });
  it('does not present the last scheduled date as completion when a residual remains', () => {
    render(
      <LoanProjectionSummary
        projection={{
          ...projection,
          schedule: {
            ...projection.schedule,
            expectedCompletionDate: null,
            completionStatus: 'RESIDUAL_REMAINING',
            residualPrincipal: '800',
          },
        }}
      />
    );
    expect(screen.getByText('Expected completion').nextElementSibling?.textContent).toMatch(
      /not fully repaid/i
    );
    expect(screen.getByText('Last scheduled repayment').nextElementSibling?.textContent).toBe(
      '2027-06-30'
    );
  });
  it('uses the server funding assumption date for an unfunded account with future terms', () => {
    render(
      <LoanProjectionSummary
        projection={{
          ...projection,
          basis: 'APPROVED_UNFUNDED_BALANCE_PROJECTION',
          fundingAssumptionDate: '2026-12-01',
        }}
      />
    );
    expect(
      screen.getByText(/assumes the entire approved principal is funded on 2026-12-01/i)
    ).toBeTruthy();
    expect(screen.queryByText(/funded today/i)).toBeNull();
    expect(screen.queryByText(/uses current posted balances/i)).toBeNull();
  });
  it('does not infer a funding date when the server does not provide one', () => {
    render(
      <LoanProjectionSummary
        projection={{ ...projection, basis: 'APPROVED_UNFUNDED_BALANCE_PROJECTION' }}
      />
    );
    expect(screen.getByText(/funded on the assumed funding date/i)).toBeTruthy();
    expect(screen.queryByText(/funded today/i)).toBeNull();
  });
  it('keeps the contractual due date and explains a later calculation date', () => {
    render(
      <LoanProjectionSummary
        projection={{
          ...projection,
          schedule: {
            ...projection.schedule,
            items: [
              {
                dueDate: '2026-10-01',
                valueDate: '2026-10-11',
                principal: '500',
                interest: '10',
                total: '510',
                principalAfter: '9500',
                interestAfter: '0',
              },
            ],
          },
        }}
      />
    );
    expect(screen.getByText('2026-10-01')).toBeTruthy();
    expect(screen.getByText('Calculated through 2026-10-11')).toBeTruthy();
  });
  it('shows unavailable summary values safely when the response omits them', () => {
    render(
      <LoanProjectionSummary
        projection={{
          ...projection,
          schedule: {
            items: [],
            residualPrincipal: '0',
            residualInterest: '0',
            carry: '0',
          },
        }}
      />
    );
    expect(screen.getByText('Expected completion').nextElementSibling?.textContent).toMatch(
      /unavailable/i
    );
    expect(screen.getByText('Projected interest').nextElementSibling?.textContent).toMatch(
      /unavailable/i
    );
    expect(screen.getByText('Projected total repayment').nextElementSibling?.textContent).toMatch(
      /unavailable/i
    );
  });
});

describe('Loan completion status', () => {
  it.each([
    ['NO_REMAINING_BALANCE', 'No remaining balance'],
    ['RESIDUAL_REMAINING', 'Not fully repaid within this schedule'],
    ['UNKNOWN', 'Unavailable'],
    [undefined, 'Unavailable'],
  ])('uses server status %s when there is no completion date', (completionStatus, expected) => {
    render(
      <LoanProjectionSummary
        projection={{
          ...projection,
          schedule: { ...projection.schedule, completionStatus, expectedCompletionDate: null },
        }}
      />
    );
    expect(screen.getByText('Expected completion').nextElementSibling?.textContent).toBe(expected);
  });
});
