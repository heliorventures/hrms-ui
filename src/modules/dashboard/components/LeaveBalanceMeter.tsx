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
      className="relative mx-auto flex h-28 w-28 items-center justify-center"
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
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="9"
          className="stroke-current text-surface-selected"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="9"
          pathLength="100"
          strokeDasharray={`${percentage} 100`}
          strokeLinecap={percentage > 0 && percentage < 100 ? 'round' : 'butt'}
          className="stroke-current text-accent"
        />
      </svg>
      <span
        className={`relative flex max-w-[88px] flex-col items-center text-center tabular-nums ${balance < 0 ? 'text-status-danger' : 'text-content-primary'}`}
      >
        <span className="max-w-full break-words text-xl font-semibold">{label}</span>
        <span className="text-[10px] text-content-secondary">days left</span>
      </span>
    </div>
  );
};
export default LeaveBalanceMeter;
