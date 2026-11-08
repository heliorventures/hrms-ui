// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../../../auth/clientSession';
import type { PayslipLoans } from '../payslipLoans';

import PayslipLoanLinks from './PayslipLoanLinks';

const state = vi.hoisted(() => ({ session: null as ParsedClientSession | null }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ clientSession: state.session }),
}));
afterEach(cleanup);
const snapshot: PayslipLoans = {
  currency: 'INR',
  valueDate: '2026-10-11',
  total: '500',
  lines: [
    {
      loanId: 'loan/one',
      principalBefore: '1000',
      interestBefore: '0',
      accruedInterest: '0',
      principalRecovered: '500',
      interestRecovered: '0',
      principalAfter: '500',
      interestAfter: '0',
      requested: '500',
      deferred: '0',
    },
  ],
};
it.each([
  ['SELF', '/loans/my'],
  ['ALL', '/loans/admin'],
])('links %s readers to the authorized loan workspace', (scope, path) => {
  state.session = {
    employeeId: 'employee',
    jwtRoles: [],
    persona: 'EMPLOYEE',
    mustChangePassword: false,
    permissions: new Set(['loan:read']),
    permissionScopes: { 'loan:read': scope },
    resourceScopes: {},
  };
  render(<PayslipLoanLinks snapshot={snapshot} />);
  expect(screen.getByRole('link').getAttribute('href')).toBe(`${path}?loan=loan%2Fone`);
});
it('hides loan links when the signed-in session has no loan authority', () => {
  state.session = null;
  render(<PayslipLoanLinks snapshot={snapshot} />);
  expect(screen.queryByRole('link')).toBe(null);
});
