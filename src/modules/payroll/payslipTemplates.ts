export type PayslipTemplateId = 'EXISTING' | 'TABLE';
export const PAYSLIP_SETTINGS_CHANGED = 'company-payslip-settings-changed';

export const PAYSLIP_TEMPLATES: { id: PayslipTemplateId; label: string; description: string }[] = [
  {
    id: 'EXISTING',
    label: 'Existing Format',
    description: 'Current layout with a single component list.',
  },
  {
    id: 'TABLE',
    label: 'Table Format',
    description: 'Earnings and deductions in adjacent bordered columns.',
  },
];

export const resolvePayslipTemplate = (value: string | null | undefined): PayslipTemplateId => {
  if (value === null || value === undefined) return 'EXISTING';
  if (value === 'EXISTING' || value === 'TABLE') return value;
  throw new Error(
    'The company payslip template is unsupported. Contact your payroll administrator.'
  );
};
