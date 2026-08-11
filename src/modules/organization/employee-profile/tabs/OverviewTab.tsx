import { Briefcase, Building2, Coins, Sparkles } from 'lucide-react';

import type { EmployeeProfileModel } from '../types';
import { InfoCard } from '../components/InfoCard';
import { formatCompactDate, formatInrAnnual } from '../lib/masking';
import { Timeline } from '../components/Timeline';

interface OverviewTabProps {
  model: EmployeeProfileModel;
  showSalary: boolean;
}

export function OverviewTab({ model, showSalary }: OverviewTabProps) {
  const previewNodes = model.growthTimeline.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Current Role" subtitle="Primary assignment">
          <div className="flex items-start gap-2">
            <Briefcase className="mt-0.5 h-4 w-4 text-indigo-500" aria-hidden />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {model.roleAssignment.designation}
            </p>
          </div>
        </InfoCard>
        <InfoCard title="Department" subtitle="Org unit">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 text-indigo-500" aria-hidden />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {model.roleAssignment.department}
            </p>
          </div>
        </InfoCard>
        <InfoCard title="Annual Compensation" subtitle={showSalary ? 'Full detail in Growth' : 'Visible to HR only'}>
          <div className="flex items-start gap-2">
            <Coins className="mt-0.5 h-4 w-4 text-indigo-500" aria-hidden />
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatInrAnnual(model.compensation.baseSalaryAnnual, showSalary)}
            </p>
          </div>
        </InfoCard>
        <InfoCard title="Leave Balance" subtitle="From employee profile">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-indigo-500" aria-hidden />
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {model.leaveBalanceDays != null ? `${model.leaveBalanceDays} days` : '—'}
            </p>
          </div>
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard title="Recent Activity" subtitle="Latest profile events">
          <ul className="space-y-2">
            {model.recentActivity.map((a) => (
              <li
                key={a.id}
                className="flex justify-between gap-2 rounded-xl bg-slate-50/80 px-3 py-2 text-sm dark:bg-slate-800/40"
              >
                <span className="text-slate-800 dark:text-slate-200">{a.label}</span>
                <time className="shrink-0 text-xs text-slate-500">{formatCompactDate(a.at)}</time>
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard title="Growth Preview" subtitle="From joining to latest change">
          <Timeline
            items={previewNodes.map((n) => ({
              id: n.id,
              dateLabel: formatCompactDate(n.date),
              title: n.title,
              description:
                n.salaryChangePercent != null
                  ? `Salary ${n.salaryChangePercent >= 0 ? '+' : ''}${n.salaryChangePercent.toFixed(1)}%`
                  : n.notes,
            }))}
          />
        </InfoCard>
      </div>
    </div>
  );
}
