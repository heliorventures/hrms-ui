import Input from '../../../components/common/Input';
import type { PeriodInput } from '../periodInputTypes';

const MonthlyWithholdingFields = ({
  draft,
  onChange,
}: {
  draft: PeriodInput;
  onChange: (value: PeriodInput) => void;
}) => {
  const { automatic } = draft;
  if (!automatic) return null;
  return (
    <>
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={Boolean(automatic.withholding_override)}
          onChange={(e) =>
            onChange({
              ...draft,
              automatic: {
                ...automatic,
                withholding_override: e.target.checked ? { amount: '', reason: '' } : null,
              },
            })
          }
        />
        Override this month’s withholding with an HR reason
      </label>
      {automatic.withholding_override && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            required
            label="Reviewed TDS amount"
            value={automatic.withholding_override.amount}
            onChange={(e) =>
              onChange({
                ...draft,
                automatic: {
                  ...automatic,
                  withholding_override: {
                    amount: e.target.value,
                    reason: automatic.withholding_override?.reason ?? '',
                  },
                },
              })
            }
          />
          <Input
            required
            label="Monthly TDS override reason"
            value={automatic.withholding_override.reason}
            onChange={(e) =>
              onChange({
                ...draft,
                automatic: {
                  ...automatic,
                  withholding_override: {
                    amount: automatic.withholding_override?.amount ?? '',
                    reason: e.target.value,
                  },
                },
              })
            }
          />
        </div>
      )}
    </>
  );
};
export default MonthlyWithholdingFields;
