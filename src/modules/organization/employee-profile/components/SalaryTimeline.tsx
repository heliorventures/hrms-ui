import type { SalaryHistoryEntry } from '../types';
import { formatCompactDate, formatInrAnnual } from '../lib/masking';
import { TrendingUp } from 'lucide-react';

interface SalaryTimelineProps {
  entries: SalaryHistoryEntry[];
  showAmounts: boolean;
}

export function SalaryTimeline({ entries, showAmounts }: SalaryTimelineProps) {
  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <div
          key={e.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900/30"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">
              Effective {formatCompactDate(e.effectiveDate)}
            </p>
            <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{e.reason}</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              {e.changePercent >= 0 ? '+' : ''}
              {e.changePercent.toFixed(1)}% change
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">New annual</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatInrAnnual(e.newAnnual, showAmounts)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              was {formatInrAnnual(e.previousAnnual, showAmounts)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
