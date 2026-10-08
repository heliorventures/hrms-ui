// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { payslipTemplatePreview } from '../payslipTemplatePreview';
import { createPayslipPdf } from '../utils/payslipPdfLayout';

import PayslipDocument from './PayslipDocument';

afterEach(cleanup);
const props = {
  tenantName: 'Example Company',
  employeeName: 'Example Employee',
  employeeCode: 'EMP001',
  periodLabel: 'January 2026',
  labelForLine: () => '',
};
const branding = {
  companyLine: props.tenantName,
  employeeName: props.employeeName,
  employeeCode: props.employeeCode,
  periodLabel: props.periodLabel,
};
const address = '801, Business Court\nPune - 411038';

describe.each(['EXISTING', 'TABLE'] as const)('%s company address', (template) => {
  it('places the address immediately below the company name on the printable sheet', () => {
    render(
      <PayslipDocument
        {...props}
        companyAddress={address}
        slip={payslipTemplatePreview(template)}
      />
    );
    const line = screen.getByText(/^Address:/);
    expect(screen.getByText(props.tenantName).nextElementSibling).toBe(line);
    expect(line.textContent).toBe(`Address: ${address}`);
    expect(line.className).toContain('whitespace-pre-line');
    expect(line.className).toContain('[overflow-wrap:anywhere]');
    expect(document.getElementById('payslip-print-sheet')?.contains(line)).toBe(true);
  });

  it.each([undefined, null, '', ' \n '])('omits an unconfigured address: %j', (companyAddress) => {
    render(
      <PayslipDocument
        {...props}
        companyAddress={companyAddress}
        slip={payslipTemplatePreview(template)}
      />
    );
    expect(screen.queryByText(/^Address:/)).toBeNull();
    const output = createPayslipPdf(
      { ...branding, companyAddress },
      payslipTemplatePreview(template),
      () => ''
    ).output();
    expect(output).not.toContain('Address:');
  });

  it('includes every address line before the payslip period in the downloaded PDF', () => {
    const output = createPayslipPdf(
      { ...branding, companyAddress: address },
      payslipTemplatePreview(template),
      () => ''
    ).output();
    expect(output).toContain('Address: 801, Business Court');
    expect(output).toContain('Pune - 411038');
    expect(output.indexOf('Example Company')).toBeLessThan(output.indexOf('Address:'));
    expect(output.indexOf('Pune - 411038')).toBeLessThan(output.indexOf('January 2026'));
  });
});
