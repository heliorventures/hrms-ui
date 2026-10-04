import Input from '../../../components/common/Input';
import type { PeriodInput } from '../periodInputTypes';

const AutomaticLwpFields = ({
  draft,
  onChange,
}: {
  draft: PeriodInput;
  onChange: (value: PeriodInput) => void;
}) => {
  const { automatic } = draft;
  if (!automatic) return null;
  return (
    <div>
      {automatic.use_employee_configuration ? (
        <div className="space-y-2">
          <p>Approved unpaid leave: {draft.lwp_days ?? 'Calculated with payroll'} days</p>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={!!automatic.lwp_override}
              onChange={(event) =>
                onChange({
                  ...draft,
                  automatic: {
                    ...automatic,
                    lwp_override: event.target.checked
                      ? { days: draft.lwp_days ?? '0', reason: '' }
                      : null,
                  },
                })
              }
            />
            Override this month’s total unpaid leave
          </label>
          {automatic.lwp_override && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Total unpaid leave days"
                value={automatic.lwp_override.days}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    automatic: {
                      ...automatic,
                      lwp_override: {
                        days: event.target.value,
                        reason: automatic.lwp_override?.reason ?? '',
                      },
                    },
                  })
                }
              />
              <Input
                label="Unpaid leave override reason"
                value={automatic.lwp_override.reason}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    automatic: {
                      ...automatic,
                      lwp_override: {
                        days: automatic.lwp_override?.days ?? '',
                        reason: event.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      ) : (
        <Input
          label="Unpaid leave days"
          value={draft.lwp_days ?? ''}
          onChange={(event) => onChange({ ...draft, lwp_days: event.target.value || null })}
        />
      )}
    </div>
  );
};
export default AutomaticLwpFields;
