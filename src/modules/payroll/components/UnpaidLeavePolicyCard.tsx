import type { GraphQLClient } from 'graphql-request';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import { useUnpaidLeavePolicy } from '../hooks/useUnpaidLeavePolicy';
import type { UnpaidLeavePolicy } from '../unpaidLeaveDocuments';

const FormulaFields = ({
  form,
  busy,
  change,
}: {
  form: UnpaidLeavePolicy;
  busy: boolean;
  change: (values: Partial<UnpaidLeavePolicy>) => void;
}) => (
  <>
    <div className="grid gap-3 md:grid-cols-3">
      <Input
        label="Basic earning component code"
        value={form.basicComponentCode ?? ''}
        required
        maxLength={50}
        disabled={busy}
        onChange={(event) => change({ basicComponentCode: event.target.value })}
      />
      <Input
        label="Divide monthly basic by (days)"
        type="number"
        step="0.0001"
        min="0.0001"
        max="999999.9999"
        value={form.dayDivisor ?? ''}
        required
        disabled={busy}
        onChange={(event) => change({ dayDivisor: event.target.value || null })}
      />
      <label className="space-y-1 text-sm font-medium">
        Apply deduction
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          value={form.treatment ?? ''}
          required
          disabled={busy}
          onChange={(event) =>
            change({ treatment: event.target.value as UnpaidLeavePolicy['treatment'] })
          }
        >
          <option value="" disabled>
            Select treatment
          </option>
          <option value="BEFORE_STATUTORY">Before statutory calculation</option>
          <option value="AFTER_STATUTORY">After statutory calculation</option>
        </select>
      </label>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Deduction = monthly basic ÷ configured days × approved unpaid days. Changes apply to future
      payroll runs.
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Before statutory calculation reduces the basic earning shown on the payslip. After statutory
      calculation adds a separate deduction. TDS continues to use the tax module’s monthly amount.
    </p>
  </>
);

const UnpaidLeavePolicyCard = ({
  client,
  ownerKey,
}: {
  client: GraphQLClient;
  ownerKey: string;
}) => {
  const policy = useUnpaidLeavePolicy(client, ownerKey);
  return (
    <Card title="Unpaid leave deduction">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void policy.save();
        }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={policy.form.enabled}
            disabled={policy.blocked}
            onChange={(event) => policy.change({ enabled: event.target.checked })}
          />
          Deduct approved unpaid leave when generating payroll
        </label>
        {policy.form.enabled ? (
          <FormulaFields form={policy.form} busy={policy.busy} change={policy.change} />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Unpaid leave deductions are optional for this company.
          </p>
        )}
        {policy.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {policy.error}
          </p>
        )}
        {policy.saved && (
          <p role="status" className="text-sm text-green-700 dark:text-green-400">
            Unpaid leave policy saved.
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={policy.blocked}>
            {policy.busy ? 'Saving…' : 'Save unpaid leave policy'}
          </Button>
          {!policy.loaded && !policy.loading && (
            <Button type="button" size="sm" variant="outline" onClick={policy.retry}>
              Retry
            </Button>
          )}
          {policy.loading && (
            <span role="status" className="text-sm text-gray-500">
              Loading policy…
            </span>
          )}
        </div>
      </form>
    </Card>
  );
};
export default UnpaidLeavePolicyCard;
