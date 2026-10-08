import type { useWeeklyOffSettings } from './useWeeklyOffSettings';
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WeeklyOffRuleFields = ({ model }: { model: ReturnType<typeof useWeeklyOffSettings> }) => {
  const { busy } = model;
  return (
    <fieldset disabled={busy || model.inherits} className="space-y-3">
      <legend className="font-medium">Weekly offs</legend>
      <div className="flex flex-wrap gap-3">
        {weekdays.map((name, index) => (
          <label key={name} className="text-sm">
            <input
              type="checkbox"
              checked={model.weekdays.includes(index + 1)}
              disabled={index === 5 && model.saturdays.length > 0}
              onChange={() => model.change(model.setWeekdays, model.weekdays, index + 1)}
            />{' '}
            {name}
          </label>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm">Selected Saturdays in each month</p>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((ordinal) => (
            <label key={ordinal} className="text-sm">
              <input
                type="checkbox"
                checked={model.saturdays.includes(ordinal)}
                disabled={model.weekdays.includes(6)}
                onChange={() => model.change(model.setSaturdays, model.saturdays, ordinal)}
              />{' '}
              {['First', 'Second', 'Third', 'Fourth', 'Fifth'][ordinal - 1]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Choose every Saturday or selected Saturdays. Fifth applies only in months with five
          Saturdays. Empty selections mean no recurring weekly off.
        </p>
      </div>
    </fieldset>
  );
};
export default WeeklyOffRuleFields;
