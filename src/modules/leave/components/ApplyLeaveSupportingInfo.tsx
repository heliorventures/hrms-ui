import type {
  ApplyBalanceRow,
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
      <ul className="space-y-1">
        {leaveType.isPaid === false ? (
          <li>Balance: unpaid leave - no balance is consumed.</li>
        ) : (
          <li>
            Available balance (this year):{' '}
            <span className="font-mono">{balance?.balanceDays ?? '-'}</span> days
          </li>
        )}
        {policy ? (
          <>
            {policy.maxConsecutiveDays != null && (
              <li>Max consecutive: {policy.maxConsecutiveDays} days</li>
            )}
            {policy.minNoticeDays != null && policy.minNoticeDays > 0 && (
              <li>Min notice: {policy.minNoticeDays} days</li>
            )}
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
            Weekends and holidays count toward this leave type.
          </li>
        ) : null}
      </ul>
    </div>
  );
};
