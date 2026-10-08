import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatPayrollPaymentDate, formatPayrollPeriod } from '../payrollFormatters';
import type { PayrollCycleFormState, PayrollCycleRow } from '../payrollTypes';

import NewPayrollCycleForm from './NewPayrollCycleForm';

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
    <NewPayrollCycleForm {...{ form, createBusy, createError, createOk, onChange, onCreate }} />
    {runError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{runError}</p>}
    {runOk && !runError && (
      <p className="mb-3 text-sm text-green-700 dark:text-green-400">{runOk}</p>
    )}
    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
      Calculate a draft, review every employee and finalize when ready. You can recalculate any
      draft cycle. Finalized cycles are locked.
    </p>
    <Table
      data={rows}
      loading={loading}
      loadingMessage="Loading Payroll Cycles..."
      emptyMessage="No Payroll Cycles Found."
      keyExtractor={(row) => row.id}
      columns={[
        { key: 'name', label: 'Cycle', render: (row: PayrollCycleRow) => row.name },
        {
          key: 'month',
          label: 'Period',
          render: (row: PayrollCycleRow) => formatPayrollPeriod(row),
        },
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
          label: 'Review',
          render: (row: PayrollCycleRow) =>
            row.status.toUpperCase() === 'DRAFT' ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={runBusy === row.id}
                onClick={() => onRun(row.id)}
              >
                {runBusy === row.id ? 'Calculating…' : 'Calculate draft'}
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
