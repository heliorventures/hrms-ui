import { describe, expect, it } from 'vitest';

import { findTourForRoute } from '../../../guidance/tourRegistry';

import { loanTours } from './LoanTours';

describe('loan guidance authority', () => {
  it('keeps account guidance available while hiding actions for a read-only employee', () => {
    const tour = findTourForRoute(
      'loans/my',
      { routePath: 'loans/my', canScopedPermission: () => false },
      loanTours
    );
    expect(tour?.steps.map((step) => step.id)).toEqual(['my-loans-balances']);
  });

  it('keeps account guidance available while hiding administrative writes for a reader', () => {
    const tour = findTourForRoute(
      'loans/admin',
      { routePath: 'loans/admin', canScopedPermission: () => false },
      loanTours
    );
    expect(tour?.steps.map((step) => step.id)).toEqual(['loan-admin-accounts']);
  });
});
