// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createPayslipPdf } from '../utils/payslipPdfLayout';

import PayslipDocument from './PayslipDocument';

afterEach(cleanup);
const model = {
  id: 'fictional',
  grossSalary: '30000',
  totalDeductions: '2000',
  netSalary: '28000',
  status: 'GENERATED',
  generatedAt: '2026-09-30',
  pfEmployee: '1800',
  pfEmployer: '1950',
  lines: [{ id: 'hidden', salaryComponentId: 'hidden', amount: '15000', componentType: 'EARNING' }],
  presentation: {
    lines: [
      {
        id: 'visible',
        code: 'HRA',
        name: 'House rent allowance',
        amount: '7500',
        componentType: 'EARNING',
      },
    ],
    statement: {
      gross: '30000',
      incentive: '0',
      total_deductions: '2000',
      net_earned: '28000',
      advance_already_paid: '5000',
      remaining_payable: '23000',
      lwp_amount: '1000',
      lwp_days: '1',
      lwp_divisor: '31',
      lwp_basis_amount: '31000',
      gross_rule: 'FIXED_MINUS_LWP',
    },
  },
};
const branding = {
  companyLine: 'Fictional company',
  periodLabel: 'September 2026',
  employeeName: 'Fictional employee',
  employeeCode: 'TEST',
};
describe('company-controlled payslip presentation', () => {
  it('does not render raw components while required presentation details are unavailable', () => {
    render(
      <PayslipDocument
        tenantName={branding.companyLine}
        employeeName={branding.employeeName}
        employeeCode={branding.employeeCode}
        periodLabel={branding.periodLabel}
        labelForLine={() => 'Hidden Basic'}
        slip={{ ...model, presentation: null }}
        detailsPending
      />
    );
    expect(screen.queryByText('Hidden Basic')).toBeNull();
    expect(screen.queryByText('PF (employee)')).toBeNull();
    expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(
      true
    );
  });
  it.each(['EXISTING', 'TABLE'])(
    'prints only selected components and preserves settlement in %s',
    (template) => {
      render(
        <PayslipDocument
          tenantName={branding.companyLine}
          employeeName={branding.employeeName}
          employeeCode={branding.employeeCode}
          periodLabel={branding.periodLabel}
          labelForLine={() => 'Hidden Basic'}
          slip={{ ...model, presentation: { ...model.presentation, template } }}
        />
      );
      expect(screen.getByText('House rent allowance')).toBeTruthy();
      expect(screen.queryByText('Hidden Basic')).toBeNull();
      expect(screen.queryByText('PF (employee)')).toBeNull();
      expect(screen.queryByText(/employer/i)).toBeNull();
      expect(screen.getByText('Salary already paid as advance')).toBeTruthy();
      expect(screen.getByText('Remaining payable')).toBeTruthy();
      expect(screen.getByText(/Leave without pay: 1 days/)).toBeTruthy();
    }
  );
  it.each(['EXISTING', 'TABLE'])(
    'exports %s PDF without hidden components or employer costs',
    (template) => {
      const output = createPayslipPdf(
        branding,
        { ...model, presentation: { ...model.presentation, template } },
        () => 'HIDDEN_BASIC_SENTINEL'
      ).output();
      expect(output).toContain('House rent allowance');
      expect(output).not.toContain('HIDDEN_BASIC_SENTINEL');
      expect(output).not.toContain('employer');
      expect(output).toContain('Advance already paid');
      expect(output).toContain('Remaining payable');
    }
  );
  it('refuses PDF creation when company display settings are missing', () => {
    expect(() =>
      createPayslipPdf(branding, { ...model, presentation: null }, () => 'Hidden Basic')
    ).toThrow(/display settings/);
  });
});
