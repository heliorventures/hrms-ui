// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import PayrollDraftRow from './PayrollDraftRow';

afterEach(cleanup);
it('shows the reviewed loan split and deferred amount before payroll finalization', () => {
  const row = {
    employee_id: 'employee',
    employee_label: 'EMP-01',
    outcome: 'READY',
    reason: null,
    prepared: {
      requires_tax_acknowledgement: false,
      calculation: {
        gross: '10000',
        incentive: '0',
        total_deductions: '200',
        net_earned: '9800',
        advance_already_paid: '8800',
        remaining_payable: '1000',
      },
      loan_recovery: {
        quote: {
          total: '200',
          input: { value_date: '2026-10-09', currency: { code: 'INR' } },
          lines: [{ loan_id: 'loan-a', principal: '180', interest: '20', deferred: '300' }],
        },
      },
    },
  };
  render(
    <table>
      <tbody>
        <PayrollDraftRow row={row} />
      </tbody>
    </table>
  );
  expect(screen.getByText('Review loan recovery')).toBeTruthy();
  expect(screen.getByText(/Principal 180/)).toBeTruthy();
  expect(screen.getByText(/Interest 20/)).toBeTruthy();
  expect(screen.getByText(/Deferred 300/)).toBeTruthy();
});
