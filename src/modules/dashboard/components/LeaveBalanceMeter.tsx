import { formatLeaveDays } from './leaveBalanceFormat';

interface LeaveBalanceMeterProps {
  name: string;
  balanceDays: string;
  entitledDays: string;
}

const hasValidEntitlement = (balance: string, entitlement: string) =>
  Boolean(balance.trim() && entitlement.trim()) &&
  Number.isFinite(Number(balance)) &&
  Number.isFinite(Number(entitlement)) &&
  Number(entitlement) > 0;

const LeaveBalanceMeter = ({ name, balanceDays, entitledDays }: LeaveBalanceMeterProps) => {
  const balance = Number(balanceDays);
  const entitlement = Number(entitledDays);
  const valid = hasValidEntitlement(balanceDays, entitledDays);
  const visualBalance = valid ? Math.max(0, Math.min(balance, entitlement)) : 0;
  const label = formatLeaveDays(balanceDays);
  const percentage = valid ? (visualBalance / entitlement) * 100 : 0;
  return (
    <div
      className="space-y-2"
      {...(valid
        ? {
            role: 'meter',
            'aria-label': `${name} remaining`,
            'aria-valuemin': 0,
            'aria-valuemax': entitlement,
            'aria-valuenow': visualBalance,
            'aria-valuetext': `${label} days remaining; ${formatLeaveDays(entitledDays)} days entitlement`,
          }
        : {})}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium text-content-primary">{name}</span>
        <span
          className={`tabular-nums ${balance < 0 ? 'text-status-danger' : 'text-content-secondary'}`}
        >
          <strong>{label}</strong> days left {valid ? `/ ${formatLeaveDays(entitledDays)}` : ''}
        </span>
      </div>
      {valid ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-line-subtle" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} />
        </div>
      ) : null}
    </div>
  );
};
export default LeaveBalanceMeter;
