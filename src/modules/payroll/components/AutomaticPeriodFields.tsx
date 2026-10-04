import Input from '../../../components/common/Input';
import type { PeriodInput } from '../periodInputTypes';

import AdditionalDeductionFields from './AdditionalDeductionFields';
import MonthlyWithholdingFields from './MonthlyWithholdingFields';

const AutomaticPeriodFields = ({
  draft,
  disabled,
  onChange,
}: {
  draft: PeriodInput;
  disabled: boolean;
  onChange: (value: PeriodInput) => void;
}) => {
  const { automatic } = draft;
  if (!automatic) return null;
  const changeEligibility = (
    key: keyof typeof automatic.eligibility,
    value: string | boolean | null
  ) =>
    onChange({
      ...draft,
      automatic: { ...automatic, eligibility: { ...automatic.eligibility, [key]: value } },
    });
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <p className="text-sm">
        Salary comes from the effective assignment. Company rules calculate PF, ESI and PT; employee
        tax settings calculate TDS. Enter zero only for confirmed unused monthly amounts.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(['pf_applicable', 'esi_applicable', 'disability'] as const).map((key) => (
          <label key={key}>
            {
              {
                pf_applicable: 'PF applies',
                esi_applicable: 'ESI applies',
                disability: 'ESI disability ceiling applies',
              }[key]
            }
            <select
              className="block w-full rounded border p-2"
              value={automatic.eligibility[key] === null ? '' : String(automatic.eligibility[key])}
              onChange={(e) =>
                changeEligibility(key, e.target.value === '' ? null : e.target.value === 'true')
              }
            >
              <option value="">Not confirmed</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        ))}
        <Input
          label="ESI continuation through"
          type="date"
          value={automatic.eligibility.esi_continuation_until ?? ''}
          onChange={(e) => changeEligibility('esi_continuation_until', e.target.value || null)}
        />
        <Input
          label="ESI average daily wage"
          value={automatic.eligibility.average_daily_wage ?? ''}
          onChange={(e) => changeEligibility('average_daily_wage', e.target.value || null)}
        />
        {(
          [
            ['lwp_days', 'Unpaid leave days'],
            ['variable_allowance_ot', 'Overtime / variable allowance'],
            ['incentive', 'Monthly incentive'],
            ['advance_already_paid', 'Salary advance already paid'],
          ] as const
        ).map(([key, label]) => (
          <Input
            key={key}
            label={label}
            value={draft[key] ?? ''}
            onChange={(e) => onChange({ ...draft, [key]: e.target.value || null })}
          />
        ))}
      </div>
      <MonthlyWithholdingFields draft={draft} onChange={onChange} />
      <AdditionalDeductionFields draft={draft} disabled={disabled} onChange={onChange} />
    </fieldset>
  );
};
export default AutomaticPeriodFields;
