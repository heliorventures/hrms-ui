// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type { PayslipRow } from '../payrollTypes';
import { payslipTemplatePreview } from '../payslipTemplatePreview';

import PayrollPayslipTab from './PayrollPayslipTab';

afterEach(cleanup);
const preview = payslipTemplatePreview('TABLE');
const slip = {
  ...preview,
  payrollCycleId: 'cycle',
  periodMonth: 1,
  periodYear: 2026,
} satisfies PayslipRow;
const props = {
  activePayslip: slip,
  presentation: preview.presentation,
  employeeCode: 'EMP001',
  employeeName: 'Employee',
  labelForLine: () => 'Basic',
  payslipBranding: null,
  payslipError: null,
  payslipLogoReadUrl: null,
  payslipMigrationRequired: false,
  payslipPeriodOptions: [
    { periodKey: '2026-01', label: 'January 2026', month: 1, year: 2026, payslip: slip },
  ],
  payslips: [slip],
  payslipsLoading: false,
  selectedPeriodKey: '2026-01',
  tenantName: 'Company',
  onSelectedPeriodChange: vi.fn(),
};

it('blocks print and download while company branding is loading', () => {
  render(<PayrollPayslipTab {...props} payslipBrandingLoading />);
  expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(true);
  expect(screen.getByRole('button', { name: 'Print / Save as PDF' }).hasAttribute('disabled')).toBe(
    true
  );
});

it('uses the saved address and removes it after the company clears the field', () => {
  const payslipBranding = {
    payslipTemplate: 'TABLE',
    payslipEmployeeFields: [],
    employerTan: null,
    employerLegalName: null,
    baseSalaryComponentCode: 'BASIC',
    arrearSalaryComponentCode: 'ARREAR',
    payslipHeaderTitle: 'Company header',
    payslipCompanyAddress: '801, Business Court\nPune - 411038',
    payslipLogoFileStorageId: null,
  };
  const view = render(<PayrollPayslipTab {...props} payslipBranding={payslipBranding} />);
  expect(screen.getByText('Company header').nextElementSibling?.textContent).toBe(
    'Address: 801, Business Court\nPune - 411038'
  );
  view.rerender(
    <PayrollPayslipTab
      {...props}
      payslipBranding={{ ...payslipBranding, payslipCompanyAddress: null }}
    />
  );
  expect(screen.queryByText(/^Address:/)).toBeNull();
});

it('shows branding failures and offers a retry while output stays blocked', () => {
  const retry = vi.fn();
  render(
    <PayrollPayslipTab
      {...props}
      payslipBrandingError="Company settings unavailable"
      onRetryPayslipBranding={retry}
    />
  );
  expect(screen.getByRole('alert').textContent).toContain('Company settings unavailable');
  expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Retry company branding' }));
  expect(retry).toHaveBeenCalledOnce();
});
