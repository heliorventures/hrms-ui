// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import PayrollDraftReview from './PayrollDraftReview';

afterEach(cleanup);
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
