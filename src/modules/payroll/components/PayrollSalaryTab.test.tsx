// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import PayrollSalaryTab from './PayrollSalaryTab';

afterEach(cleanup);

describe('PayrollSalaryTab employee self-service', () => {
  it('renders only the signed-in employee salary breakup', () => {
    render(
      <PayrollSalaryTab
        preview={{
          employeeId: 'employee-1',
          annualCtc: '1200000',
          monthlyGross: '100000',
          monthlyDeductions: '10000',
          monthlyNetBeforeStatutory: '90000',
          lines: [
            {
              salaryComponentId: 'basic-id',
              componentName: 'Basic Salary',
              componentCode: 'BASIC',
              componentType: 'EARNING',
              calculationBasis: 'FIXED_ANNUAL',
              calculationValue: '600000',
              annualAmount: '600000',
              monthlyAmount: '50000',
              isOverride: false,
            },
          ],
        }}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Annual CTC')).toBeTruthy();
    expect(screen.getByText('Basic Salary')).toBeTruthy();
    expect(screen.queryByText('Monthly Deductions')).toBeNull();
    expect(screen.queryByText('Net Before Statutory')).toBeNull();
    expect(screen.queryByText('Salary Components')).toBeNull();
    expect(screen.queryByText('Payroll Cycles')).toBeNull();
  });
});

it('shows regular salary as annual CTC and employer costs separately', () => {
  render(
    <PayrollSalaryTab
      preview={{
        employeeId: 'employee-1',
        annualCtc: '1236000',
        monthlyGross: '100000',
        monthlyDeductions: '0',
        monthlyNetBeforeStatutory: '100000',
        lines: [],
        financials: {
          annual_gross: '1200000',
          annual_employer_pf: '36000',
          annual_ctc: '1236000',
          ctc_ready: true,
        },
      }}
      loading={false}
      error={null}
    />
  );
  const ctc = screen.getByText('Annual CTC').closest('div');
  expect(ctc).toBeTruthy();
  expect(within(ctc as HTMLElement).getByText('₹12,00,000')).toBeTruthy();
  expect(screen.getByText('Other: annual employer PF')).toBeTruthy();
  expect(screen.getByText('Total including employer PF')).toBeTruthy();
  expect(screen.getByText('₹36,000')).toBeTruthy();
  expect(screen.getByText('₹12,36,000')).toBeTruthy();
});
