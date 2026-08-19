import { useEffect, useRef, type ReactNode } from 'react';

import { UI_A11Y_TEXT } from '../../constants/uiText';

export type PageNoticeVariant = 'error' | 'info' | 'success' | 'warning';

export interface PageNoticeProps {
  variant?: PageNoticeVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  focusOnMount?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<PageNoticeVariant, string> = {
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-100',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100',
};

const PageNotice = ({
  variant = 'info',
  title,
  children,
  action,
  onDismiss,
  focusOnMount = false,
  className = '',
}: PageNoticeProps) => {
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusOnMount) return undefined;
    const focusFrame = window.requestAnimationFrame(() => noticeRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusOnMount]);

  const isError = variant === 'error';

  return (
    <div
      ref={noticeRef}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? undefined : 'polite'}
      tabIndex={focusOnMount ? -1 : undefined}
      className={`rounded-lg border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={`${title ? 'mt-1' : ''} break-words leading-relaxed`}>{children}</div>
          {action ? <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md px-2 py-1 font-semibold opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label={UI_A11Y_TEXT.dismiss}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PageNotice;
