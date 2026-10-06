import { useId } from 'react';

import { payslipTemplatePreview } from '../payslipTemplatePreview';
import { PAYSLIP_TEMPLATES, resolvePayslipTemplate } from '../payslipTemplates';
import type { PayslipTemplateId } from '../payslipTemplates';

import { PAYSLIP_SHEETS } from './payslipSheetRegistry';

interface Props {
  value: PayslipTemplateId;
  disabled: boolean;
  onChange: (value: PayslipTemplateId) => void;
}

const PayslipTemplateSelector = ({ value, disabled, onChange }: Props) => {
  const id = useId();
  const Sheet = PAYSLIP_SHEETS[value];
  return (
    <div className="mb-5 space-y-3">
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          Company payslip template
        </label>
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(resolvePayslipTemplate(event.target.value))}
          className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-content-primary sm:max-w-sm"
          aria-describedby={`${id}-help`}
        >
          {PAYSLIP_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
        <p id={`${id}-help`} className="mt-1 text-sm text-content-secondary">
          Applies to every employee in this company after saving.
        </p>
      </div>
      <details className="rounded-md border border-line bg-surface p-3">
        <summary className="cursor-pointer text-sm font-medium">Preview selected template</summary>
        <p className="my-3 text-xs text-content-secondary">
          Example data only. Your company&apos;s payslips use its saved payroll data.
        </p>
        <Sheet
          headerTitle="Example Company"
          employeeName="Example Employee"
          employeeCode="EMP001"
          periodLabel="January 2026"
          slip={payslipTemplatePreview(value)}
          labelForLine={() => ''}
          preview
        />
      </details>
    </div>
  );
};

export default PayslipTemplateSelector;
