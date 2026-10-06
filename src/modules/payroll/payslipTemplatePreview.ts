import type { PayslipDocModel } from './components/PayslipDocument';
import type { PayslipTemplateId } from './payslipTemplates';

export const payslipTemplatePreview = (template: PayslipTemplateId): PayslipDocModel => ({
  id: 'template-preview',
  grossSalary: '40000',
  totalDeductions: '2000',
  netSalary: '38000',
  status: 'GENERATED',
  generatedAt: '2026-01-31T12:00:00Z',
  lines: [],
  presentation: {
    template,
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
