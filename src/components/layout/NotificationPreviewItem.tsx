import { ChevronDown } from 'lucide-react';

import type { BoardNotification } from './useNotificationDropdownData';

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
function formatRelativeDate(dateString: string): string {
  const elapsedMinutes = Math.round((new Date(dateString).getTime() - Date.now()) / 60_000);
  if (!Number.isFinite(elapsedMinutes)) return '';
  if (Math.abs(elapsedMinutes) < 60) return relativeTime.format(elapsedMinutes, 'minute');
  const hours = Math.round(elapsedMinutes / 60);
  return Math.abs(hours) < 24
    ? relativeTime.format(hours, 'hour')
    : relativeTime.format(Math.round(hours / 24), 'day');
}

const NotificationPreviewItem = ({
  notification,
  onOpen,
}: {
  notification: BoardNotification;
  onOpen: (notification: BoardNotification) => void;
}) => {
  const title = notification.title || 'Notification';
  return (
    <li className="py-3">
      <details className="group rounded-lg border border-line bg-surface">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-3 hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
          {!notification.isRead ? (
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          ) : null}
          <span data-notification-title className="min-w-0 flex-1 break-words text-sm font-medium">
            {title}
          </span>
          {!notification.isRead ? <span className="sr-only">Unread notification</span> : null}
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t border-line px-3 py-3">
          <p
            data-notification-message
            className="whitespace-pre-wrap break-words text-sm text-content-secondary"
          >
            {notification.message || 'No additional details.'}
          </p>
          <p className="text-xs text-content-muted">
            {formatRelativeDate(String(notification.createdAt))}
          </p>
        </div>
      </details>
      <button
        type="button"
        aria-label={`Open ${title}`}
        onClick={() => onOpen(notification)}
        className="mt-1 min-h-11 rounded-md px-3 py-2 text-xs font-medium text-accent hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        Open item
      </button>
    </li>
  );
};

export default NotificationPreviewItem;
