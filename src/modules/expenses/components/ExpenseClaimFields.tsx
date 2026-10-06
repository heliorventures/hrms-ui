import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';
import type { ExpenseSubmissionForm } from '../hooks/useExpenseSubmission';
import { normalizeCurrencyCode } from '../utils/amountValidation';
import { formatCurrency } from '../utils/formatters';

interface Props {
  form: ExpenseSubmissionForm;
  disabled: boolean;
  categoryOptions: { value: string; label: string }[];
  travelOptions: { value: string; label: string }[];
}

const PolicyHints = ({ form }: { form: ExpenseSubmissionForm }) => {
  const { hints, draft } = form;
  if (!hints) return null;
  const currency = normalizeCurrencyCode(draft.currency) ?? EXPENSE_DEFAULT_CURRENCY;
  return (
    <div className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-xs">
      {hints.maxAmountPerClaim ? (
        <p>
          Max per claim: <strong>{formatCurrency(hints.maxAmountPerClaim, currency)}</strong>
        </p>
      ) : null}
      {hints.limitPerMonth ? (
        <p>
          Monthly limit: <strong>{formatCurrency(hints.limitPerMonth, currency)}</strong>
        </p>
      ) : null}
      <p className="mt-1 font-medium">Receipt upload is required for every claim.</p>
    </div>
  );
};

const ExpenseClaimFields = ({ form, disabled, categoryOptions, travelOptions }: Props) => {
  const { draft, change } = form;
  return (
    <>
      <Select
        label="Category"
        value={draft.categoryId}
        onChange={(event) => change({ categoryId: event.target.value })}
        options={categoryOptions}
        required
        disabled={disabled}
        fullWidth
      />
      <PolicyHints form={form} />
      <Input
        label="Title"
        value={draft.title}
        onChange={(event) => change({ title: event.target.value })}
        disabled={disabled}
        fullWidth
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Amount"
          value={draft.amount}
          onChange={(event) => change({ amount: event.target.value })}
          disabled={disabled}
          fullWidth
          required
          inputMode="decimal"
          autoComplete="off"
        />
        <Input
          label="Currency"
          value={draft.currency}
          onChange={(event) => change({ currency: event.target.value })}
          disabled={disabled}
          fullWidth
          maxLength={3}
          autoComplete="off"
        />
      </div>
      <Input
        type="date"
        label="Expense Date"
        value={draft.expenseDate}
        onChange={(event) => change({ expenseDate: event.target.value })}
        disabled={disabled}
        fullWidth
        required
      />
      <label className="block text-sm font-medium text-content-secondary">
        Receipt
        <input
          key={form.fileInputKey}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(event) => form.setReceipt(event.target.files?.[0] ?? null)}
          className="mt-1 block w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
          required
          disabled={disabled}
        />
        <span className="mt-1 block text-xs text-content-muted">
          Required for every claim. PDF, JPG, or PNG up to 6 MB.
        </span>
      </label>
      <Select
        label="Linked Travel Request"
        value={draft.travelRequestId}
        onChange={(event) => change({ travelRequestId: event.target.value })}
        options={travelOptions}
        disabled={disabled}
        fullWidth
      />
    </>
  );
};

export default ExpenseClaimFields;
