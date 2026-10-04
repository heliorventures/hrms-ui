import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { PAYROLL_MONTHS } from '../payrollFormatters';
import type { PayrollCycleFormState } from '../payrollTypes';

interface Props {
  form: PayrollCycleFormState;
  createBusy: boolean;
  createError: string | null;
  createOk: string | null;
  onChange: (field: keyof PayrollCycleFormState, value: string | number) => void;
  onCreate: () => void;
}
const NewPayrollCycleForm = ({
  form,
  createBusy,
  createError,
  createOk,
  onChange,
  onCreate,
}: Props) => (
  <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New cycle</h3>
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Opens a <span className="font-mono">DRAFT</span> row for one calendar month. You cannot add a
      second cycle for the same month and year.
    </p>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <Input
        label="Name"
        type="text"
        value={form.newCycleName}
        onChange={(event) => onChange('newCycleName', event.target.value)}
        placeholder="e.g. April 2026 payroll"
        className="min-w-[12rem]"
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Month</span>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={form.newCycleMonth}
          onChange={(event) => onChange('newCycleMonth', Number(event.target.value))}
        >
          {PAYROLL_MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Year"
        type="number"
        min={2000}
        max={2200}
        value={form.newCycleYear}
        onChange={(event) =>
          onChange('newCycleYear', Number(event.target.value) || form.newCycleYear)
        }
        className="w-28"
      />
      <Input
        label="Payment Date (Optional)"
        type="date"
        value={form.newCyclePayDate}
        onChange={(event) => onChange('newCyclePayDate', event.target.value)}
      />
      <Button type="button" variant="primary" size="sm" disabled={createBusy} onClick={onCreate}>
        {createBusy ? 'Creating...' : 'Create Draft Cycle'}
      </Button>
    </div>
    {createError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>}
    {createOk && !createError && (
      <p className="mt-2 text-sm text-green-700 dark:text-green-400">{createOk}</p>
    )}
  </div>
);
export default NewPayrollCycleForm;
