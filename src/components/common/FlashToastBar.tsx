import { AlertCircle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';

import { UI_A11Y_TEXT } from '../../constants/uiText';
import type { FlashToastState } from '../../hooks/useFlashToast';

type Props = {
  toast: FlashToastState | null;
  onDismiss: () => void;
};

const variantStyles: Record<FlashToastState['variant'], string> = {
  error: 'border-status-danger/40 bg-surface-raised text-content-primary',
  success: 'border-status-success/40 bg-surface-raised text-content-primary',
  info: 'border-status-info/40 bg-surface-raised text-content-primary',
};

const variantIcons: Record<FlashToastState['variant'], LucideIcon> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const variantIconStyles: Record<FlashToastState['variant'], string> = {
  error: 'text-status-danger',
  success: 'text-status-success',
  info: 'text-status-info',
};

/** Floating toast — sibling to main layout; keep above modals with high z-index. */
const FlashToastBar = ({ toast, onDismiss }: Props) => {
  if (!toast) return null;
  const isError = toast.variant === 'error';
  const ToastIcon = variantIcons[toast.variant];
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? undefined : 'polite'}
      aria-atomic="true"
      className={`fixed bottom-6 left-1/2 z-[100] max-w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border px-4 py-3 shadow-lg ${variantStyles[toast.variant]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <ToastIcon
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 ${variantIconStyles[toast.variant]}`}
        />
        <p className="whitespace-pre-wrap text-sm font-medium leading-snug">{toast.text}</p>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded px-2 py-0.5 text-xs font-semibold opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current md:min-h-6 md:min-w-6 md:px-1"
          onClick={onDismiss}
          aria-label={UI_A11Y_TEXT.dismiss}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default FlashToastBar;
