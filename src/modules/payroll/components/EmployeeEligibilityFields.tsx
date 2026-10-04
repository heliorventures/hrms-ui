import Input from '../../../components/common/Input';
import type { PeriodInput } from '../periodInputTypes';

type Eligibility = NonNullable<PeriodInput['automatic']>['eligibility'];
export const EmployeeEligibilityFields = ({
  eligibility,
  onChange,
}: {
  eligibility: Eligibility;
  onChange: (value: Eligibility) => void;
}) => (
  <>
    <Input
      label="Recurring professional tax override"
      value={eligibility.professional_tax ?? ''}
      placeholder="Company rule when blank; 0 means no PT"
      onChange={(event) =>
        onChange({ ...eligibility, professional_tax: event.target.value || null })
      }
    />
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
          value={eligibility[key] === null ? '' : String(eligibility[key])}
          onChange={(event) =>
            onChange({
              ...eligibility,
              [key]: event.target.value === '' ? null : event.target.value === 'true',
            })
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
      value={eligibility.esi_continuation_until ?? ''}
      onChange={(event) =>
        onChange({ ...eligibility, esi_continuation_until: event.target.value || null })
      }
    />
    <Input
      label="ESI average daily wage"
      value={eligibility.average_daily_wage ?? ''}
      onChange={(event) =>
        onChange({ ...eligibility, average_daily_wage: event.target.value || null })
      }
    />
  </>
);
