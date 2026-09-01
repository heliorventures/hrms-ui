// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
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
    expect(screen.queryByText('Salary Components')).toBeNull();
    expect(screen.queryByText('Payroll Cycles')).toBeNull();
  });
});
