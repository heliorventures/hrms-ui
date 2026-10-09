import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import Input from '../../../components/common/Input';
import { PAYROLL_MONTHS } from '../payrollFormatters';
import type { PayrollCycleFormState } from '../payrollTypes';

import PayrollHelp from './PayrollHelp';

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
  <div className="mb-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">New payroll cycle</h3>
      <PayrollHelp label="About payroll cycles">
        Create one draft per calendar month. Effective salary, recurring settings and approved
        unpaid leave prepare routine payroll automatically. Use Monthly Adjustments only for
        exceptions.
      </PayrollHelp>
    </div>
    <div className="grid items-end gap-3 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_8rem_6rem_11rem_auto]">
      <Input
        label="Name"
        type="text"
        value={form.newCycleName}
        onChange={(event) => onChange('newCycleName', event.target.value)}
        placeholder="e.g. April 2026 payroll"
        className="min-w-0 w-full"
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Month</span>
        <select
          className="min-w-0 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
        className="min-w-0 w-full"
      />
      <Input
        label="Payment Date (Optional)"
        type="date"
        className="min-w-0 w-full"
        value={form.newCyclePayDate}
        onChange={(event) => onChange('newCyclePayDate', event.target.value)}
      />
      <Button type="button" variant="primary" size="sm" disabled={createBusy} onClick={onCreate}>
        {createBusy ? 'Creating...' : 'Create Draft Cycle'}
      </Button>
    </div>
    {createError && (
      <FeedbackToast variant={'error'} messageKey={createError}>
        {createError}
      </FeedbackToast>
    )}
    {createOk && !createError && (
      <FeedbackToast variant={'success'} messageKey={createOk}>
        {createOk}
      </FeedbackToast>
    )}
  </div>
);
export default NewPayrollCycleForm;
