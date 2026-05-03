import type { FlashToastState } from '../../hooks/useFlashToast';

type Props = {
  toast: FlashToastState | null;
  onDismiss: () => void;
};

const variantStyles: Record<FlashToastState['variant'], string> = {
  error:
    'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/90 dark:text-red-100',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/90 dark:text-emerald-100',
  info: 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
};

/** Floating toast — sibling to main layout; keep above modals with high z-index. */
const FlashToastBar = ({ toast, onDismiss }: Props) => {
  if (!toast) return null;
  return (
    <div
      role="alert"
      className={`fixed bottom-6 left-1/2 z-[100] max-w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border px-4 py-3 shadow-lg ${variantStyles[toast.variant]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-sm font-medium leading-snug">{toast.text}</p>
        <button
          type="button"
          className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold opacity-70 hover:opacity-100"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default FlashToastBar;
