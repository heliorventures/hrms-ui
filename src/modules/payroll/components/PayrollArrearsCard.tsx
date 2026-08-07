import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import type { PayrollArrearFormState, PayrollArrearRow } from '../payrollTypes';

interface PayrollArrearsCardProps {
  arrears: PayrollArrearRow[];
  form: PayrollArrearFormState;
  loading: boolean;
  busy: boolean;
  error: string | null;
  ok: string | null;
  onChange: (field: keyof PayrollArrearFormState, value: string) => void;
  onCreate: () => void;
}

const PayrollArrearsCard = ({
  arrears,
  form,
  loading,
  busy,
  error,
  ok,
  onChange,
  onCreate,
}: PayrollArrearsCardProps) => (
  <Card title="PENDING payroll arrears (back-pay)">
    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
      One-off accruals (salary catch-up) are paid in the next <strong>Run pay</strong> as a
      separate <span className="font-mono">ARREAR</span> line. The tenant must have an active
      EARNING component with code <span className="font-mono">ARREAR</span>. India statutory
      (EPF/ESI/PT/TDS) is computed on <strong>base + arrear</strong> in the run.
    </p>
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading arrears…</p>
    ) : arrears.length > 0 ? (
      <ul className="mb-4 divide-y divide-gray-200 dark:divide-gray-600">
        {arrears.map((arrear) => (
          <li key={arrear.id} className="py-2 text-sm">
            <span className="font-mono text-xs text-gray-500">{arrear.employeeId}</span> —{' '}
            <span className="font-medium">₹{arrear.amount}</span> — {arrear.status}
            {arrear.reason ? <span className="text-gray-500"> — {arrear.reason}</span> : null}
          </li>
        ))}
      </ul>
    ) : (
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">No PENDING arrear accruals.</p>
    )}
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <Input
        label="Employee id (UUID)"
        value={form.arrearEmployeeId}
        onChange={(event) => onChange('arrearEmployeeId', event.target.value)}
        placeholder="00000000-0000-0000-0000-000000000000"
        className="min-w-[14rem] font-mono"
      />
      <Input
        label="Amount (₹)"
        value={form.arrearAmount}
        onChange={(event) => onChange('arrearAmount', event.target.value)}
        placeholder="5000.00"
        className="w-32"
      />
      <Input
        label="Reason (optional)"
        value={form.arrearReason}
        onChange={(event) => onChange('arrearReason', event.target.value)}
        className="min-w-[12rem]"
      />
      <Button type="button" variant="primary" size="sm" disabled={busy} onClick={() => onCreate()}>
        {busy ? 'Saving…' : 'Add PENDING arrear'}
      </Button>
    </div>
    {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    {ok && !error && <p className="mt-2 text-sm text-green-700 dark:text-green-400">{ok}</p>}
  </Card>
);

export default PayrollArrearsCard;
