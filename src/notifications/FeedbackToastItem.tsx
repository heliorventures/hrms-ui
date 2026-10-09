import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { UI_A11Y_TEXT } from '../constants/uiText';

import type { FeedbackEntry, FeedbackVariant } from './feedbackContext';

const icons = { error: AlertCircle, success: CheckCircle2, info: Info, warning: TriangleAlert };
const colors: Record<FeedbackVariant, string> = {
  error: 'border-status-danger/40',
  success: 'border-status-success/40',
  info: 'border-status-info/40',
  warning: 'border-status-warning/40',
};
const iconColors: Record<FeedbackVariant, string> = {
  error: 'text-status-danger',
  success: 'text-status-success',
  info: 'text-status-info',
  warning: 'text-status-warning',
};

const FeedbackToastItem = ({
  entry,
  onDismiss,
}: {
  entry: FeedbackEntry;
  onDismiss: (key: string, notifyOwner?: boolean, expectedRevision?: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onDismiss);
  const revisionRef = useRef(entry.revision);
  callbackRef.current = onDismiss;
  revisionRef.current = entry.revision;

  useEffect(() => {
    const previousFocus = document.activeElement;
    let active = true;
    if (entry.focusOnMount) ref.current?.focus();
    const timer = window.setTimeout(
      () => {
        if (!active || revisionRef.current !== entry.revision) return;
        if (
          ref.current?.contains(document.activeElement) &&
          previousFocus instanceof HTMLElement &&
          previousFocus.isConnected
        ) {
          previousFocus.focus();
        }
        callbackRef.current(entry.key, false, entry.revision);
      },
      Math.max(0, entry.expiresAt - Date.now())
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [entry.key, entry.revision, entry.expiresAt, entry.focusOnMount]);

  const Icon = icons[entry.variant];
  const error = entry.variant === 'error';
  return (
    <div
      ref={ref}
      role={error ? 'alert' : 'status'}
      aria-live={error ? undefined : 'polite'}
      aria-atomic="true"
      tabIndex={entry.focusOnMount ? -1 : undefined}
      className={`pointer-events-auto rounded-lg border bg-surface-raised px-4 py-3 text-sm text-content-primary shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-focus ${colors[entry.variant]}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          className={`mt-0.5 h-5 w-5 shrink-0 ${iconColors[entry.variant]}`}
        />
        <div className="min-w-0 flex-1 break-words leading-relaxed">
          {entry.title ? <p className="font-semibold">{entry.title}</p> : null}
          <div className={entry.title ? 'mt-1' : undefined}>{entry.content}</div>
          {entry.action ? <div className="mt-2 flex flex-wrap gap-2">{entry.action}</div> : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(entry.key)}
          aria-label={UI_A11Y_TEXT.dismiss}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-xs font-semibold opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current md:min-h-6 md:min-w-6"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackToastItem;
