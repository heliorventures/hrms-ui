import { amountFields, type PeriodAmountField, type PeriodInput } from '../periodInputTypes';

import AdditionalDeductionFields from './AdditionalDeductionFields';

interface Props {
  draft: PeriodInput;
  disabled: boolean;
  onChange: (draft: PeriodInput) => void;
}
const moneyValue = (value: string) => value.trim() || null;
const mapLabels = {
  expected_earned_components: 'Earned components',
  statutory_overrides: 'Employee deductions',
  expected_employer_contributions: 'Employer costs (excluded from employee net pay)',
};
const MoneyMaps = ({ draft, disabled, onChange }: Props) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {(
      [
        'expected_earned_components',
        'statutory_overrides',
        'expected_employer_contributions',
      ] as const
    ).map((key) => (
      <fieldset
        key={key}
        disabled={disabled}
        className="space-y-2 rounded border border-slate-200 p-3"
      >
        <legend className="text-sm font-semibold">{mapLabels[key]}</legend>
        {Object.entries(draft[key]).map(([code, amount]) => (
          <label key={code} className="flex items-center justify-between gap-2 text-sm">
            {code}
            <input
              aria-label={`${mapLabels[key]} ${code}`}
              inputMode="decimal"
              value={amount ?? ''}
              onChange={(event) =>
                onChange({
                  ...draft,
                  [key]: { ...draft[key], [code]: moneyValue(event.target.value) },
                })
              }
              className="w-32 rounded border border-slate-300 px-2 py-1"
            />
          </label>
        ))}
      </fieldset>
    ))}
  </div>
);

const PeriodInputFields = ({ draft, disabled, onChange }: Props) => {
  const change = (field: PeriodAmountField, value: string) =>
    onChange({ ...draft, [field]: moneyValue(value) });
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm">
        Earned gross calculation
        <select
          value={draft.gross_rule}
          disabled={disabled}
          onChange={(event) => onChange({ ...draft, gross_rule: event.target.value })}
          className="rounded border border-slate-300 p-2"
        >
          <option value="FIXED_MINUS_LWP">Fixed gross minus LWP</option>
          <option value="PAID_DAYS_PLUS_OT">Paid days plus OT</option>
          <option value="SOURCE_OVERRIDE">Reviewed source gross override</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {amountFields.map(([field, label]) => (
          <label key={field} className="flex flex-col gap-1 text-sm">
            {label}
            <input
              inputMode="decimal"
              value={draft[field] ?? ''}
              disabled={disabled}
              onChange={(event) => change(field, event.target.value)}
              className="rounded border border-slate-300 p-2"
            />
          </label>
        ))}
      </div>
      <MoneyMaps draft={draft} disabled={disabled} onChange={onChange} />
      <AdditionalDeductionFields draft={draft} disabled={disabled} onChange={onChange} />
      <p className="text-xs text-slate-600">
        Blank amounts remain unknown. A positive additional deduction requires a reason. Advance is
        a salary settlement, not a deduction or recurring component.
      </p>
    </div>
  );
};
export default PeriodInputFields;
