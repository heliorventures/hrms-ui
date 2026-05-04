import type { ReactNode } from 'react';

export interface TimelineItemProps {
  id: string;
  dateLabel: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  accentClass?: string;
  onSelect?: () => void;
}

/** Vertical timeline with optional click handlers on nodes. */
export function Timeline({ items }: { items: TimelineItemProps[] }) {
  return (
    <ol className="relative space-y-0 border-l border-slate-200 pl-6 dark:border-slate-700">
      {items.map((item, i) => (
        <li key={item.id} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
              item.accentClass ?? 'bg-indigo-500'
            }`}
            aria-hidden
          />
          <div
            className={`rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 ${
              item.onSelect
                ? 'cursor-pointer transition hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800'
                : ''
            }`}
            onClick={item.onSelect}
            onKeyDown={
              item.onSelect
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      item.onSelect?.();
                    }
                  }
                : undefined
            }
            role={item.onSelect ? 'button' : undefined}
            tabIndex={item.onSelect ? 0 : undefined}
          >
            <div className="flex flex-wrap items-center gap-2">
              <time className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.dateLabel}
              </time>
              {item.badge}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.title}
            </p>
            {item.description ? (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
            ) : null}
          </div>
          {i < items.length - 1 ? null : null}
        </li>
      ))}
    </ol>
  );
}
