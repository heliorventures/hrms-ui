import { describe, expect, it } from 'vitest';

import { normalizePayslipCompanyAddress } from './payslipCompanyAddress';

describe('payslip company address input', () => {
  it('normalizes pasted line endings and preserves address lines', () => {
    expect(normalizePayslipCompanyAddress('  801, Business Court\r\nPune - 411038  ')).toBe(
      '801, Business Court\nPune - 411038'
    );
  });

  it('turns blank input into an explicit clear', () => {
    expect(normalizePayslipCompanyAddress(' \n ')).toBeNull();
  });

  it('rejects oversized addresses and non-printable characters', () => {
    expect(() => normalizePayslipCompanyAddress('a'.repeat(1001))).toThrow(/1,000/);
    expect(() => normalizePayslipCompanyAddress('Pune\u0000')).toThrow(/non-printable/);
    expect(normalizePayslipCompanyAddress('a'.repeat(1000))).toHaveLength(1000);
  });
});
