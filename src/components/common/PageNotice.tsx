import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
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
  error: 'border-status-danger/30 bg-status-danger/10 text-content-primary',
  info: 'border-status-info/30 bg-status-info/10 text-content-primary',
  success: 'border-status-success/30 bg-status-success/10 text-content-primary',
  warning: 'border-status-warning/30 bg-status-warning/10 text-content-primary',
};

const VARIANT_ICONS: Record<PageNoticeVariant, LucideIcon> = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
};

const VARIANT_ICON_CLASSES: Record<PageNoticeVariant, string> = {
  error: 'text-status-danger',
  info: 'text-status-info',
  success: 'text-status-success',
  warning: 'text-status-warning',
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
  const NoticeIcon = VARIANT_ICONS[variant];

  return (
    <div
      ref={noticeRef}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? undefined : 'polite'}
      aria-atomic="true"
      tabIndex={focusOnMount ? -1 : undefined}
      className={`rounded-lg border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <NoticeIcon
          aria-hidden="true"
          className={`mt-0.5 h-5 w-5 shrink-0 ${VARIANT_ICON_CLASSES[variant]}`}
        />
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
