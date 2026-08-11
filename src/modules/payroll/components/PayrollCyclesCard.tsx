import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import { formatPayrollPaymentDate, formatPayrollPeriod, PAYROLL_MONTHS } from '../payrollFormatters';
import type { PayrollCycleFormState, PayrollCycleRow } from '../payrollTypes';

interface PayrollCyclesCardProps {
  rows: PayrollCycleRow[];
  form: PayrollCycleFormState;
  loading: boolean;
  createBusy: boolean;
  createError: string | null;
  createOk: string | null;
  runBusy: string | null;
  runError: string | null;
  runOk: string | null;
  onChange: (field: keyof PayrollCycleFormState, value: string | number) => void;
  onCreate: () => void;
  onRun: (payrollCycleId: string) => void;
}

const PayrollCyclesCard = ({
  rows,
  form,
  loading,
  createBusy,
  createError,
  createOk,
  runBusy,
  runError,
  runOk,
  onChange,
  onCreate,
  onRun,
}: PayrollCyclesCardProps) => (
  <Card title="Payroll Cycles">
    <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New cycle</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Opens a <span className="font-mono">DRAFT</span> row for one calendar month. You cannot
        add a second cycle for the same month and year.
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
          onChange={(event) => onChange('newCycleYear', Number(event.target.value) || form.newCycleYear)}
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
    {runError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{runError}</p>}
    {runOk && !runError && <p className="mb-3 text-sm text-green-700 dark:text-green-400">{runOk}</p>}
    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
      <strong>Run pay</strong> creates missing payslips from the latest{' '}
      <span className="font-mono">employment_history.salary</span> (BASIC), optional{' '}
      <span className="font-mono">PENDING</span> <strong>arrear</strong> (ARREAR line), then
      India statutory <strong>stub</strong> (12% EPF on capped wage, ESI if gross ≤ 21k, fixed PT
      &gt; 10k, TDS from <span className="font-mono">tax_computation.tdsPerMonth</span> for the
      India FY of the pay month), then <span className="font-mono">PROCESSED</span>. HR /
      statutory-export role.
    </p>
    <Table
      data={rows}
      loading={loading}
      loadingMessage="Loading Payroll Cycles..."
      emptyMessage="No Payroll Cycles Found."
      keyExtractor={(row) => row.id}
      columns={[
        { key: 'name', label: 'Cycle', render: (row: PayrollCycleRow) => row.name },
        { key: 'month', label: 'Period', render: (row: PayrollCycleRow) => formatPayrollPeriod(row) },
        {
          key: 'status',
          label: 'Status',
          render: (row: PayrollCycleRow) => <Badge variant="info">{row.status}</Badge>,
        },
        {
          key: 'paymentDate',
          label: 'Payment Date',
          render: (row: PayrollCycleRow) => formatPayrollPaymentDate(row.paymentDate),
        },
        {
          key: 'actions',
          label: 'Run',
          render: (row: PayrollCycleRow) =>
            row.status.toUpperCase() === 'DRAFT' ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={runBusy === row.id}
                onClick={() => onRun(row.id)}
              >
                {runBusy === row.id ? 'Running…' : 'Run pay (v1)'}
              </Button>
            ) : (
              '—'
            ),
        },
      ]}
    />
  </Card>
);

export default PayrollCyclesCard;
