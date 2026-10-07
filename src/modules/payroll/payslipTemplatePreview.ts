import type { PayslipDocModel } from './components/PayslipDocument';
import { DEFAULT_PAYSLIP_EMPLOYEE_FIELDS, PAYSLIP_EMPLOYEE_FIELDS } from './payslipEmployeeFields';
import type { PayslipTemplateId } from './payslipTemplates';

const SAMPLE_DETAILS: Record<string, string> = {
  EMPLOYEE_NAME: 'Example Employee',
  EMPLOYEE_CODE: 'EMP001',
  DEPARTMENT: 'Operations',
  DESIGNATION: 'Executive',
  JOINING_DATE: '01 Apr 2025',
  GENDER: 'Female',
  MARITAL_STATUS: 'Married',
  UAN: '100000000001',
  ESIC: '1234567890',
};

export const payslipTemplatePreview = (
  template: PayslipTemplateId,
  fields: string[] = DEFAULT_PAYSLIP_EMPLOYEE_FIELDS
): PayslipDocModel => ({
  id: 'template-preview',
  grossSalary: '40000',
  totalDeductions: '2000',
  netSalary: '38000',
  status: 'GENERATED',
  generatedAt: '2026-01-31T12:00:00Z',
  lines: [],
  presentation: {
    template,
    employeeDetails: PAYSLIP_EMPLOYEE_FIELDS.filter(({ id }) => fields.includes(id)).map(
      ({ id, label }) => ({ field: id, label, value: SAMPLE_DETAILS[id] })
    ),
    lines: [
      {
        id: 'basic',
        code: 'BASIC',
        name: 'Basic salary',
        componentType: 'EARNING',
        amount: '30000',
      },
      {
        id: 'hra',
        code: 'HRA',
        name: 'House rent allowance',
        componentType: 'EARNING',
        amount: '10000',
      },
      { id: 'pf', code: 'PF', name: 'Provident fund', componentType: 'DEDUCTION', amount: '1800' },
      { id: 'pt', code: 'PT', name: 'Professional tax', componentType: 'DEDUCTION', amount: '200' },
    ],
    statement: null,
  },
});
