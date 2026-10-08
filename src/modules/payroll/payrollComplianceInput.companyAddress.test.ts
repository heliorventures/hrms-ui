import { describe, expect, it } from 'vitest';

import { payrollComplianceInput } from './payrollComplianceInput';
import type { PayrollComplianceFormState } from './payrollTypes';

const form: PayrollComplianceFormState = {
  payslipTemplateInput: 'EXISTING',
  payslipEmployeeFieldsInput: [],
  employerTanInput: '',
  employerLegalNameInput: '',
  baseComponentInput: 'BASIC',
  arrearComponentInput: 'ARREAR',
  payslipHeaderInput: '',
  payslipCompanyAddressInput: '',
  payslipLogoIdInput: '',
};

describe('company address save input', () => {
  it('sends an explicit null so clearing the form clears the saved address', () => {
    expect(payrollComplianceInput(form)).toHaveProperty('payslipCompanyAddress', null);
  });

  it('sends the normalized multiline address and rejects oversized input', () => {
    expect(
      payrollComplianceInput({
        ...form,
        payslipCompanyAddressInput: '  801, Business Court\r\nPune - 411038  ',
      }).payslipCompanyAddress
    ).toBe('801, Business Court\nPune - 411038');
    expect(() =>
      payrollComplianceInput({ ...form, payslipCompanyAddressInput: 'a'.repeat(1001) })
    ).toThrow(/1,000/);
  });
});
