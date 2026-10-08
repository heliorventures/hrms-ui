import { PAYSLIP_EMPLOYEE_FIELDS } from '../payslipEmployeeFields';

interface Props {
  value: string[];
  disabled: boolean;
  onChange: (value: string[]) => void;
}

const PayslipEmployeeFieldSelector = ({ value, disabled, onChange }: Props) => (
  <fieldset disabled={disabled} className="mb-4 space-y-2">
    <legend className="text-sm font-semibold">Details on payslip</legend>
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Choose the fields shown for every employee in this company, in both templates, print and PDF.
      Empty fields are omitted. Profile details reflect the current employee record; saved payslip
      UAN and ESIC values take precedence when available. Status and generated date are optional and
      hidden by default.
    </p>
    <div className="grid gap-2 sm:grid-cols-3">
      {PAYSLIP_EMPLOYEE_FIELDS.map(({ id, label }) => (
        <label key={id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.includes(id)}
            onChange={(event) =>
              onChange(
                event.target.checked ? [...value, id] : value.filter((field) => field !== id)
              )
            }
          />
          {label}
        </label>
      ))}
    </div>
  </fieldset>
);

export default PayslipEmployeeFieldSelector;
