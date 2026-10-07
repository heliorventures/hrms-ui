import { describe, expect, it } from 'vitest';

import { decodePayslipEmployeeFields } from './payslipEmployeeFields';

describe('tenant payslip employee fields', () => {
  it('preserves the default but allows hiding every employee field', () => {
    expect(decodePayslipEmployeeFields(undefined)).toEqual([
      'EMPLOYEE_NAME',
      'EMPLOYEE_CODE',
      'UAN',
      'ESIC',
    ]);
    expect(decodePayslipEmployeeFields([])).toEqual([]);
  });

  it('rejects unsupported configuration instead of showing extra employee data', () => {
    expect(() => decodePayslipEmployeeFields(['BANK_ACCOUNT'])).toThrow();
    expect(() => decodePayslipEmployeeFields('GENDER')).toThrow();
    expect(() => decodePayslipEmployeeFields(['GENDER', 'GENDER'])).toThrow();
  });
});
