import type { UpsertPayrollComplianceSettingInput } from '../../api/graphql/graphql';

import type { PayrollComplianceFormState } from './payrollTypes';
import { normalizePayslipCompanyAddress } from './payslipCompanyAddress';
import { decodePayslipEmployeeFields } from './payslipEmployeeFields';
import { resolvePayslipTemplate } from './payslipTemplates';

const componentCode = (value: string) => {
  const code = value.trim().toUpperCase();
  if (code && !/^[A-Z][A-Z0-9_]{1,31}$/.test(code)) {
    throw new Error(
      'Salary component codes must start with a letter and use A-Z, 0-9, or underscore.'
    );
  }
  return code || null;
};

export const payrollComplianceInput = (
  form: PayrollComplianceFormState
): UpsertPayrollComplianceSettingInput => {
  const employerTan = form.employerTanInput.trim().toUpperCase();
  if (employerTan && !/^[A-Z]{4}\d{5}[A-Z]$/.test(employerTan)) {
    throw new Error('Employer TAN must match the Indian TAN format, for example ABCD12345E.');
  }
  const baseSalaryComponentCode = componentCode(form.baseComponentInput);
  const arrearSalaryComponentCode = componentCode(form.arrearComponentInput);
  if (baseSalaryComponentCode && baseSalaryComponentCode === arrearSalaryComponentCode) {
    throw new Error('Base and arrear component codes must be different.');
  }
  return {
    employerTan: employerTan || null,
    employerLegalName: form.employerLegalNameInput.trim() || null,
    baseSalaryComponentCode,
    arrearSalaryComponentCode,
    payslipHeaderTitle: form.payslipHeaderInput.trim() || null,
    payslipCompanyAddress: normalizePayslipCompanyAddress(form.payslipCompanyAddressInput),
    payslipLogoFileStorageId: form.payslipLogoIdInput.trim() || null,
    payslipTemplate: resolvePayslipTemplate(form.payslipTemplateInput),
    payslipEmployeeFields: decodePayslipEmployeeFields(form.payslipEmployeeFieldsInput),
  };
};
