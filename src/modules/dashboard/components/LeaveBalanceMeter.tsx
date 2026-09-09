interface LeaveBalanceMeterProps {
  name: string;
  balanceDays: string;
  entitledDays: string;
}

const LeaveBalanceMeter = ({ name, balanceDays, entitledDays }: LeaveBalanceMeterProps) => {
  const balance = Number(balanceDays);
  const entitlement = Number(entitledDays);
  if (
    !balanceDays.trim() ||
    !entitledDays.trim() ||
    !Number.isFinite(balance) ||
    !Number.isFinite(entitlement) ||
    entitlement <= 0
  )
    return null;
  // Preserve exact adjusted balances in text while bounding the visual and ARIA range.
  const visualBalance = Math.max(0, Math.min(balance, entitlement));
  return (
    <div
      role="meter"
      aria-label={`${name} remaining`}
      aria-valuemin={0}
      aria-valuemax={entitlement}
      aria-valuenow={visualBalance}
      aria-valuetext={`${balanceDays} days remaining; ${entitledDays} days entitlement`}
      className="mt-3 h-2 overflow-hidden rounded-full bg-surface-selected"
    >
      <div
        className={`h-full rounded-full ${balance <= 0 ? 'bg-status-warning' : 'bg-accent'}`}
        style={{ width: `${(visualBalance / entitlement) * 100}%` }}
      />
    </div>
  );
};

export default LeaveBalanceMeter;
