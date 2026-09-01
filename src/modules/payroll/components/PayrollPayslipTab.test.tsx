// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PayrollPayslipTab from './PayrollPayslipTab';
import type { PayslipPeriodOption } from '../payrollTypes';

afterEach(cleanup);

describe('PayrollPayslipTab period availability', () => {
  it('keeps the period selector visible and explains the selected missing payslip', () => {
    const onSelectedPeriodChange = vi.fn();
    const options = [
      { periodKey: '2026-08', label: 'August 2026', month: 8, year: 2026, payslip: null },
      { periodKey: '2026-07', label: 'July 2026', month: 7, year: 2026, payslip: null },
    ] satisfies PayslipPeriodOption[];

    render(
      <PayrollPayslipTab
        activePayslip={null}
        employeeCode="EMP0042"
        employeeName="Aniket Dhobada"
        labelForLine={() => 'Basic'}
        payslipBranding={null}
        payslipError={null}
        payslipLogoReadUrl={null}
        payslipMigrationRequired={false}
        payslipPeriodOptions={options}
        payslips={[]}
        payslipsLoading={false}
        selectedPeriodKey="2026-08"
        tenantName="Helior Prd"
        onSelectedPeriodChange={onSelectedPeriodChange}
      />
    );

    const selector = screen.getByRole('combobox', { name: 'Pay period' });
    expect(selector).toBeTruthy();
    expect(screen.getByText('No payslip is available for August 2026 yet.')).toBeTruthy();

    fireEvent.change(selector, { target: { value: '2026-07' } });
    expect(onSelectedPeriodChange).toHaveBeenCalledWith('2026-07');
  });
});
