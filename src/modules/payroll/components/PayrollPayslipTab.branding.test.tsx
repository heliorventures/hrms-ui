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
