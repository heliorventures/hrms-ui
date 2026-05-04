import type { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Rounded-2xl surface with soft shadow — 8px rhythm inside (gap-2 / p-4). */
export function InfoCard({ title, subtitle, action, children, className = '' }: InfoCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/60 ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
