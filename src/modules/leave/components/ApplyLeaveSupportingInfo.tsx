import type {
  ApplyBalanceRow,
  ApplyHolidayRow,
  ApplyLeavePolicyRow,
  ApplyLeaveTypeOption,
} from './applyLeavePolicy';

interface ApplyLeaveContextPanelProps {
  balance?: ApplyBalanceRow;
  leaveType?: ApplyLeaveTypeOption;
  policy?: ApplyLeavePolicyRow;
  requiresDocument: boolean;
}

export const ApplyLeaveContextPanel = ({
  balance,
  leaveType,
  policy,
  requiresDocument,
}: ApplyLeaveContextPanelProps) => {
  if (!leaveType) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
      <p className="font-medium text-gray-900 dark:text-white">Context</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {leaveType.isPaid === false ? (
          <li>Balance: unpaid leave - no balance is consumed.</li>
        ) : (
          <li>
            Available balance (this year): <span className="font-mono">{balance?.balanceDays ?? '-'}</span> days
          </li>
        )}
        {policy ? (
          <>
            {policy.annualEntitlement != null && (
              <li>Policy annual entitlement: {policy.annualEntitlement} days</li>
            )}
            {policy.accrualFrequency && (
              <li>
                Accrual: {policy.accrualFrequency}
                {policy.accrualDays ? ` (${policy.accrualDays} days)` : ''}
              </li>
            )}
            {policy.maxConsecutiveDays != null && (
              <li>Max consecutive: {policy.maxConsecutiveDays} days</li>
            )}
            {policy.minNoticeDays != null && <li>Min notice: {policy.minNoticeDays} days</li>}
          </>
        ) : (
          <li>No published policy row for this type - check with HR.</li>
        )}
        {requiresDocument && (
          <li className="font-medium text-amber-800 dark:text-amber-200">
            Document reference required when submitting.
          </li>
        )}
        {leaveType.sandwichRule ? (
          <li className="font-medium text-amber-800 dark:text-amber-200">
            Sandwich rule is on: charged days follow the full calendar span between from and to.
          </li>
        ) : (
          <li className="text-gray-600 dark:text-gray-400">
            Sandwich rule is off: charged days are weekdays only, excluding public holidays.
          </li>
        )}
      </ul>
    </div>
  );
};

export const UpcomingHolidaysList = ({ holidays }: { holidays: ApplyHolidayRow[] }) => {
  if (!holidays.length) return null;

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Upcoming holidays
      </p>
      <ul className="max-h-28 overflow-y-auto rounded border border-gray-200 text-xs dark:border-gray-600">
        {holidays.slice(0, 12).map((holiday) => (
          <li
            key={holiday.id}
            className="flex justify-between border-b border-gray-100 px-2 py-1 last:border-0 dark:border-gray-800"
          >
            <span>{holiday.name}</span>
            <span className="font-mono text-gray-500">
              {new Date(holiday.holidayDate).toLocaleDateString('en-IN')} - {holiday.calendarName}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
