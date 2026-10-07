// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { payslipTemplatePreview } from '../payslipTemplatePreview';
import { createPayslipPdf } from '../utils/payslipPdfLayout';

import PayslipDocument from './PayslipDocument';

afterEach(cleanup);
const branding = {
  companyLine: 'Example Company',
  employeeName: 'Hidden employee name',
  employeeCode: 'HIDDEN-CODE',
  periodLabel: 'January 2026',
};

describe.each(['EXISTING', 'TABLE'] as const)('%s employee detail selection', (template) => {
  it('shows selected fields and excludes hidden values in browser, print markup and PDF', () => {
    const slip = {
      ...payslipTemplatePreview(template, ['GENDER', 'MARITAL_STATUS']),
      uanNumber: 'HIDDEN-UAN',
      esicNumber: 'HIDDEN-ESIC',
    };
    const { container } = render(
      <PayslipDocument
        tenantName={branding.companyLine}
        employeeName={branding.employeeName}
        employeeCode={branding.employeeCode}
        periodLabel={branding.periodLabel}
        slip={slip}
        labelForLine={() => ''}
      />
    );
    expect(screen.getByText('Female')).toBeTruthy();
    expect(screen.getByText('Married')).toBeTruthy();
    for (const hidden of ['Hidden employee name', 'HIDDEN-CODE', 'HIDDEN-UAN', 'HIDDEN-ESIC']) {
      expect(container.querySelector('#payslip-print-sheet')?.textContent).not.toContain(hidden);
    }
    const pdf = createPayslipPdf(branding, slip, () => '').output();
    expect(pdf).toContain('Female');
    expect(pdf).toContain('Married');
    for (const hidden of ['Hidden employee name', 'HIDDEN-CODE', 'HIDDEN-UAN', 'HIDDEN-ESIC']) {
      expect(pdf).not.toContain(hidden);
    }
  });

  it('supports hiding all employee fields while preserving salary totals', () => {
    const slip = payslipTemplatePreview(template, []);
    const pdf = createPayslipPdf(branding, slip, () => '').output();
    expect(pdf).not.toContain('Example Employee');
    expect(pdf).not.toContain('Hidden employee name');
    expect(pdf).toContain('38,000.00');
  });
});
