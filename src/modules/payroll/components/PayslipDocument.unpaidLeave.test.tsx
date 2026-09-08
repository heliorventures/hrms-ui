// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import PayslipDocument from './PayslipDocument';

afterEach(cleanup);
const props = {
  tenantName: 'Example company',
  employeeName: 'Example employee',
  employeeCode: 'EMP1',
  periodLabel: 'September 2026',
  labelForLine: () => 'Basic',
};
const slip = {
  id: 'slip1',
  grossSalary: '9000',
  totalDeductions: '1147.50',
  netSalary: '7852.50',
  status: 'GENERATED',
  generatedAt: '2026-09-30T00:00:00Z',
  lines: [],
  unpaidLeave: {
    basicComponentCode: 'BASIC',
    basicAmount: '10000',
    dayDivisor: '30',
    unpaidDays: '3',
    amount: '1000',
    treatment: 'BEFORE_STATUTORY',
  },
};

describe('payslip unpaid leave explanation', () => {
  it('explains the original basis and reduction without showing a second deduction', () => {
    render(<PayslipDocument {...props} slip={slip} />);
    expect(screen.getByText('Unpaid leave: 3 days')).toBeTruthy();
    expect(screen.getByText(/Already included as a reduction in basic earnings/)).toBeTruthy();
    expect(screen.getByText(/BASIC.*10,000.*30.*3.*1,000/)).toBeTruthy();
  });
  it('explains after-statutory deductions', () => {
    render(
      <PayslipDocument
        {...props}
        slip={{ ...slip, unpaidLeave: { ...slip.unpaidLeave, treatment: 'AFTER_STATUTORY' } }}
      />
    );
    expect(
      screen.getByText(/Included below as a separate deduction after statutory calculation/)
    ).toBeTruthy();
  });
  it('prevents exporting a slip before its calculation details have loaded', () => {
    const view = render(<PayslipDocument {...props} slip={slip} detailsPending />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Download PDF' }).disabled).toBe(
      true
    );
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Print / Save as PDF' }).disabled
    ).toBe(true);
    view.rerender(<PayslipDocument {...props} slip={slip} detailsPending={false} />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Download PDF' }).disabled).toBe(
      false
    );
  });
});
