// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createPayslipPdf } from '../utils/payslipPdfLayout';

import PayslipDocument from './PayslipDocument';

afterEach(cleanup);
const branding = {
  companyLine: 'Example Company',
  employeeName: 'Example Employee',
  employeeCode: 'EX001',
  periodLabel: 'October 2026',
};
const slip = {
  id: 'example',
  grossSalary: '30000',
  totalDeductions: '2000',
  netSalary: '28000',
  status: 'GENERATED',
  generatedAt: '2026-10-31',
  uanNumber: 'EXAMPLE-UAN',
  lines: [],
  presentation: {
    template: 'TABLE',
    lines: [
      { id: 'hra', code: 'HRA', name: 'House rent allowance', componentType: 'EARNING', amount: '7500' },
      { id: 'pf', code: 'PF', name: 'Provident fund', componentType: 'DEDUCTION', amount: '1800' },
    ],
    statement: null,
  },
};
const props = {
  tenantName: branding.companyLine,
  employeeName: branding.employeeName,
  employeeCode: branding.employeeCode,
  periodLabel: branding.periodLabel,
  labelForLine: () => 'Hidden raw component',
};

describe('company-selected payslip templates', () => {
  it('uses the table template while retaining persisted totals and authorized rows', () => {
    render(<PayslipDocument {...props} slip={slip} />);
    expect(screen.getByRole('columnheader', { name: 'Earnings' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Deductions' })).toBeTruthy();
    expect(screen.getByText('House rent allowance')).toBeTruthy();
    expect(screen.getByText('Provident fund')).toBeTruthy();
    expect(screen.getByText('₹30,000.00')).toBeTruthy();
    expect(screen.getByText('₹28,000.00')).toBeTruthy();
    expect(screen.queryByText('Hidden raw component')).toBeNull();
  });

  it('disables output and reports an unsupported company template', () => {
    render(<PayslipDocument {...props} slip={{ ...slip, presentation: { ...slip.presentation, template: 'UNKNOWN' } }} />);
    expect(screen.getByRole('alert').textContent).toMatch(/template/i);
    expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(true);
  });

  it('routes PDF export through the same company template and carries available identifiers', () => {
    const output = createPayslipPdf(branding, slip, () => 'Hidden raw component').output();
    expect(output).toContain('Earnings');
    expect(output).toContain('Deductions');
    expect(output).toContain('EXAMPLE-UAN');
    expect(output).toContain('30,000.00');
    expect(output).not.toContain('Hidden raw component');
  });

  it('rejects unsupported PDF templates instead of silently exporting another format', () => {
    expect(() => createPayslipPdf(branding, { ...slip, presentation: { ...slip.presentation, template: 'UNKNOWN' } }, () => '')).toThrow(/template/i);
  });

  it('retains every row when table PDF content spans multiple pages', () => {
    const lines = Array.from({ length: 90 }, (_, index) => ({
      id: String(index), code: `E${index}`, name: `Component ${index}`, componentType: 'EARNING', amount: '10',
    }));
    const doc = createPayslipPdf(branding, { ...slip, presentation: { ...slip.presentation, lines } }, () => '');
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    const output = doc.output();
    for (const line of lines) expect(output).toContain(line.name);
    expect(output).toContain('Net pay');
  });
});
