import { useState } from 'react';

import Button from '../../../components/common/Button';
import type { AdditionalDeduction, PeriodInput } from '../periodInputTypes';

interface Props {
  draft: PeriodInput;
  disabled: boolean;
  onChange: (draft: PeriodInput) => void;
}
const reserved = new Set(['ADVANCE', 'LWP', 'UNPAID_LEAVE', 'PF', 'ESI', 'PT', 'TDS']);
const AdditionalDeductionFields = ({ draft, disabled, onChange }: Props) => {
  const [code, setCode] = useState('');
  const valid =
    /^[A-Z][A-Z0-9_]{1,63}$/.test(code) &&
    !reserved.has(code) &&
    !draft.additional_deductions.some((item) => item.code === code);
  const update = (index: number, change: Partial<AdditionalDeduction>) =>
    onChange({
      ...draft,
      additional_deductions: draft.additional_deductions.map((item, position) =>
        position === index ? { ...item, ...change } : item
      ),
    });
  const add = () => {
    onChange({
      ...draft,
      additional_deductions: [
        ...draft.additional_deductions,
        { code, amount: null, reason: null, origin: 'HR_CONFIGURATION' },
      ],
    });
    setCode('');
  };
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-semibold">Additional deductions</legend>
      {draft.additional_deductions.map((item, index) => (
        <div
          key={item.code}
          className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-3"
        >
          <p className="text-sm font-medium">{item.code}</p>
          <label className="flex flex-col gap-1 text-sm">
            Amount
            <input
              aria-label={`${item.code} amount`}
              inputMode="decimal"
              value={item.amount ?? ''}
              onChange={(event) => update(index, { amount: event.target.value.trim() || null })}
              className="rounded border border-slate-300 p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Deduction reason
            <input
              aria-label={`${item.code} reason`}
              value={item.reason ?? ''}
              onChange={(event) => update(index, { reason: event.target.value || null })}
              className="rounded border border-slate-300 p-2"
            />
          </label>
        </div>
      ))}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          New deduction code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().trim())}
            placeholder="OTHER_DEDUCTION"
            className="rounded border border-slate-300 p-2"
          />
        </label>
        <Button type="button" disabled={disabled || !valid} onClick={add}>
          Add deduction
        </Button>
      </div>
      <p className="text-xs text-slate-600">
        Enter an amount and a reason before payroll can use an additional deduction. PF, ESI, PT and
        TDS are entered above. Advances and LWP have their own calculation fields.
      </p>
    </fieldset>
  );
};
export default AdditionalDeductionFields;
