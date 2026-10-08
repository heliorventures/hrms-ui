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
  it('shows the selected ESIC number in the payslip, print markup and PDF', () => {
    const slip = payslipTemplatePreview(template, ['ESIC']);
    if (slip.presentation) {
      slip.presentation.employeeDetails = [{ field: 'ESIC', label: 'ESIC', value: '0123456789' }];
    }
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
    expect(screen.getByText('0123456789')).toBeTruthy();
    expect(container.querySelector('#payslip-print-sheet')?.textContent).toContain('0123456789');
    expect(createPayslipPdf(branding, slip, () => '').output()).toContain('0123456789');
  });

  it.each([
    { fields: undefined },
    { fields: [] },
    { fields: ['PAYSLIP_STATUS'] },
    { fields: ['GENERATED_DATE'] },
    { fields: ['PAYSLIP_STATUS', 'GENERATED_DATE'] },
  ])('shows only opted-in document metadata for selection $fields', ({ fields }) => {
    const slip = payslipTemplatePreview(template, fields);
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
    const markup = container.querySelector('#payslip-print-sheet')?.textContent ?? '';
    const pdf = createPayslipPdf(branding, slip, () => '').output();
    const generatedDate = new Date(slip.generatedAt).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
    });
    for (const output of [markup, pdf]) {
      expect(output.includes('GENERATED')).toBe(fields?.includes('PAYSLIP_STATUS') ?? false);
      expect(output.includes(generatedDate)).toBe(fields?.includes('GENERATED_DATE') ?? false);
      expect(output).toContain('38,000.00');
    }
  });

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
