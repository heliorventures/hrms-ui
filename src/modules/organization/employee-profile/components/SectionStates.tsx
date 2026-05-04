import Button from '../../../../components/common/Button';

export function ProfileSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2 rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700/80">
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export function EmptySection({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
      <p className="mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" className="mt-4" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorSection({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/30"
      role="alert"
    >
      <p className="text-sm text-rose-800 dark:text-rose-200">{message}</p>
      {onRetry ? (
        <Button type="button" className="mt-3" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
