import type { LifecycleEventType } from '../types';
import { formatCompactDate } from '../lib/masking';

const typeMeta: Record<
  LifecycleEventType,
  { label: string; dot: string; border: string }
> = {
  JOINING: {
    label: 'Joining',
    dot: 'bg-slate-500',
    border: 'border-slate-200 dark:border-slate-700',
  },
  PROMOTION: {
    label: 'Promotion',
    dot: 'bg-indigo-500',
    border: 'border-indigo-200/80 dark:border-indigo-900/50',
  },
  SALARY_CHANGE: {
    label: 'Salary',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200/80 dark:border-emerald-900/40',
  },
  DEPARTMENT_CHANGE: {
    label: 'Org change',
    dot: 'bg-amber-500',
    border: 'border-amber-200/80 dark:border-amber-900/40',
  },
  TERMINATION: {
    label: 'Termination',
    dot: 'bg-rose-500',
    border: 'border-rose-200/80 dark:border-rose-900/40',
  },
};

export function LifecycleTimeline({
  events,
}: {
  events: {
    id: string;
    type: LifecycleEventType;
    date: string;
    label: string;
    detail?: string;
  }[];
}) {
  return (
    <ol className="relative space-y-2">
      {events.map((ev) => {
        const meta = typeMeta[ev.type];
        return (
          <li
            key={ev.id}
            className={`relative flex gap-3 rounded-2xl border p-3 pl-4 shadow-sm ${meta.border} bg-white/90 dark:bg-slate-900/40`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
              title={meta.label}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {meta.label}
                </span>
                <span className="text-xs text-slate-400">{formatCompactDate(ev.date)}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                {ev.label}
              </p>
              {ev.detail ? (
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{ev.detail}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
