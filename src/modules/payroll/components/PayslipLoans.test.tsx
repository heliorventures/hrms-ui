// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { decodePayslipPresentation } from '../payslipPresentation';
import { createPayslipPdf } from '../utils/payslipPdfLayout';

import PayslipDocument from './PayslipDocument';

afterEach(cleanup);
const statement = {
  gross: '10000',
  incentive: '0',
  total_deductions: '500',
  net_earned: '9500',
  advance_already_paid: '0',
  remaining_payable: '9500',
  lwp_amount: '0',
  lwp_days: '0',
  lwp_divisor: '30',
  lwp_basis_amount: '10000',
  gross_rule: 'SOURCE_OVERRIDE',
  loans: {
    currency: 'INR',
    valueDate: '2026-10-09',
    total: '500',
    lines: [
      {
        loanId: 'loan-a',
        principalBefore: '10000',
        interestBefore: '0',
        accruedInterest: '0',
        principalRecovered: '500',
        interestRecovered: '0',
        principalAfter: '9500',
        interestAfter: '0',
        requested: '500',
        deferred: '0',
      },
    ],
  },
};
const branding = {
  companyLine: 'Example company',
  employeeName: 'Example employee',
  employeeCode: 'E01',
  periodLabel: 'October 2026',
};

it.each(['EXISTING', 'TABLE'])(
  'shows issued loan balances on the %s screen and PDF',
  (template) => {
    const presentation = decodePayslipPresentation({
      template,
      employeeDetails: [],
      lines: [],
      statement,
    });
    const slip = {
      id: 'slip-a',
      grossSalary: '10000',
      totalDeductions: '500',
      netSalary: '9500',
      status: 'GENERATED',
      generatedAt: '2026-10-09',
      lines: [],
      presentation,
    };
    render(
      <PayslipDocument
        tenantName={branding.companyLine}
        employeeName={branding.employeeName}
        employeeCode={branding.employeeCode}
        periodLabel={branding.periodLabel}
        labelForLine={() => ''}
        slip={slip}
      />
    );
    expect(screen.getByText('Loan recovery and balances')).toBeTruthy();
    expect(screen.getByText('Principal repaid')).toBeTruthy();
    expect(screen.getByText('Interest repaid')).toBeTruthy();
    const pdf = createPayslipPdf(branding, slip, () => '').output();
    expect(pdf).toContain('Loan recovery and balances');
    expect(pdf).toContain('Principal repaid');
    expect(pdf).toContain('Principal remaining');
  }
);

it('blocks output when a loan snapshot is incomplete rather than hiding its recovery', () => {
  expect(() =>
    decodePayslipPresentation({
      template: 'TABLE',
      employeeDetails: [],
      lines: [],
      statement: { ...statement, loans: { total: '500' } },
    })
  ).toThrow(/loan/i);
});
