// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import PayrollDraftReview from './PayrollDraftReview';

afterEach(cleanup);
it('shows the payment-date restriction while retaining the previewed salary figures', () => {
  render(
    <PayrollDraftReview
      draft={{
        cycle_id: 'cycle',
        revision: 1,
        fingerprint: 'review',
        can_finalize: false,
        finalization_block_reason:
          'Payroll can be finalized on or after 2026-10-10 in the company timezone. Until then this is a preview.',
        employees: [
          {
            employee_id: 'employee',
            outcome: 'READY',
            reason: null,
            prepared: {
              requires_tax_acknowledgement: false,
              calculation: {
                gross: '10000',
                incentive: '0',
                total_deductions: '500',
                net_earned: '9500',
                remaining_payable: '9500',
                advance_already_paid: '0',
              },
            },
          },
        ],
      }}
      busy={false}
      onFinalize={vi.fn()}
      onRecalculate={vi.fn()}
    />
  );
  expect(screen.getByText(/Payroll can be finalized on or after 2026-10-10/)).toBeTruthy();
  expect(screen.getByText('1 ready')).toBeTruthy();
  expect(screen.getAllByText('9500')).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'Finalize & Lock' })).toHaveProperty('disabled', true);
  expect(screen.queryByText(/Resolve all review items and recalculate/)).toBeNull();
});
it('lets HR select a payment date for a draft and requires a new calculation', () => {
  const save = vi.fn();
  render(
    <PayrollDraftReview
      draft={{
        cycle_id: 'cycle',
        revision: 1,
        fingerprint: 'review',
        can_finalize: false,
        employees: [],
      }}
      busy={false}
      onFinalize={vi.fn()}
      onRecalculate={vi.fn()}
      onPaymentDate={save}
    />
  );
  fireEvent.change(screen.getByLabelText('Payroll payment date'), {
    target: { value: '2026-10-09' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save payment date' }));
  expect(save).toHaveBeenCalledWith('2026-10-09');
  expect(screen.getByText(/Saving the date requires recalculating/)).toBeTruthy();
});
it('summarizes blocked calculations and keeps the missing configuration visible', () => {
  render(
    <PayrollDraftReview
      draft={{
        cycle_id: 'cycle',
        revision: 2,
        fingerprint: 'review',
        can_finalize: false,
        employees: [
          {
            employee_id: 'one',
            employee_label: 'EMP-01',
            outcome: 'REVIEW',
            reason: 'Confirm employee PF/ESI eligibility',
            prepared: null,
          },
        ],
      }}
      busy={false}
      onFinalize={vi.fn()}
      onRecalculate={vi.fn()}
    />
  );
  expect(screen.getByText('1 needs review')).toBeTruthy();
  expect(screen.getByText('Confirm employee PF/ESI eligibility')).toBeTruthy();
  expect(screen.getByText('Calculation blocked')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Finalize & Lock' })).toHaveProperty('disabled', true);
});
it('requires provisional tax acknowledgement before finalization', () => {
  const finalize = vi.fn();
  render(
    <PayrollDraftReview
      draft={{
        cycle_id: 'cycle',
        revision: 1,
        fingerprint: 'review',
        can_finalize: true,
        employees: [
          {
            employee_id: 'employee',
            outcome: 'READY',
            reason: null,
            prepared: {
              arrears: [{ id: 'arrear', amount: '20.00', reason: 'Prior salary correction' }],
              requires_tax_acknowledgement: true,
              calculation: {
                gross: '100',
                incentive: '0',
                total_deductions: '10',
                net_earned: '90',
                remaining_payable: '70',
                advance_already_paid: '20',
              },
            },
          },
        ],
      }}
      busy={false}
      onFinalize={finalize}
      onRecalculate={vi.fn()}
    />
  );
  expect(screen.getByRole('button', { name: 'Finalize & Lock' })).toHaveProperty('disabled', true);
  fireEvent.click(screen.getByText('Review included arrears'));
  expect(screen.getByText('ARREAR ₹20.00 — Prior salary correction')).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Finalize & Lock' }));
  expect(finalize).toHaveBeenCalledWith(['employee']);
});
