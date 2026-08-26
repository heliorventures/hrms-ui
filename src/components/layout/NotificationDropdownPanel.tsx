import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

import { NAV_LABELS } from '../../constants/uiText';
import AsyncState from '../common/AsyncState';
import Button from '../common/Button';
import PageNotice from '../common/PageNotice';
import type { useAnchoredPopoverPosition } from '../common/useAnchoredPopoverPosition';
import type { usePopover } from '../common/usePopover';
import { notificationActionDestination } from '../../utils/actionUrl';

import type { BoardNotification } from './useNotificationDropdownData';

type Popover = ReturnType<typeof usePopover>;
type PopoverPosition = ReturnType<typeof useAnchoredPopoverPosition>;

interface NotificationDropdownPanelProps {
  countError: string | null;
  headingId: string;
  notifications: BoardNotification[];
  onClose: () => void;
  onNotificationOpen: (notification: BoardNotification) => void;
  panelProps: Popover['panelProps'];
  panelRef: Popover['panelRef'];
  position: PopoverPosition;
  previewError: string | null;
  previewLoaded: boolean;
  previewLoading: boolean;
  previewMayBeCapped: boolean;
  refreshCount: () => Promise<void>;
  refreshPreview: () => Promise<void>;
  unreadCount: number;
}

interface NotificationPreviewProps {
  notifications: BoardNotification[];
  onNotificationOpen: (notification: BoardNotification) => void;
  previewError: string | null;
  previewLoaded: boolean;
  previewLoading: boolean;
  previewMayBeCapped: boolean;
  refreshPreview: () => Promise<void>;
}

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

function formatRelativeDate(dateString: string): string {
  const elapsedMinutes = Math.round((new Date(dateString).getTime() - Date.now()) / 60_000);
  if (Math.abs(elapsedMinutes) < 60) return relativeTime.format(elapsedMinutes, 'minute');
  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (Math.abs(elapsedHours) < 24) return relativeTime.format(elapsedHours, 'hour');
  return relativeTime.format(Math.round(elapsedHours / 24), 'day');
}

const InitialNotificationPreview = ({
  previewError,
  previewLoaded,
  previewLoading,
  refreshPreview,
}: Pick<
  NotificationPreviewProps,
  'previewError' | 'previewLoaded' | 'previewLoading' | 'refreshPreview'
>) => {
  if (previewLoaded) return null;

  if (previewLoading) {
    return (
      <div className="p-3">
        <AsyncState
          kind="loading"
          title="Loading Notifications…"
          description="Your latest notifications are being prepared."
        />
      </div>
    );
  }

  if (!previewError) return null;

  return (
    <div className="p-3">
      <AsyncState
        kind="error"
        title="Notifications Could Not Be Loaded"
        description={previewError}
        action={
          <Button variant="outline" size="sm" onClick={() => void refreshPreview()}>
            Retry Notification Preview
          </Button>
        }
      />
    </div>
  );
};

const NotificationPreviewItem = ({
  notification,
  onOpen,
}: {
  notification: BoardNotification;
  onOpen: (notification: BoardNotification) => void;
}) => {
  const iconClassName = notification.isRead
    ? 'bg-surface-selected text-content-muted'
    : 'bg-accent/10 text-accent';

  return (
    <li>
      <button
        type="button"
        data-popover-item
        onClick={() => onOpen(notification)}
        className="min-h-11 w-full px-4 py-3 text-left transition-colors hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus motion-reduce:transition-none"
      >
        <div className="flex gap-3">
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
          >
            <Bell className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              data-notification-title
              className="block break-words text-sm font-medium"
            >
              {notification.title ?? 'Notification'}
            </span>
            <span
              data-notification-message
              className="mt-1 block break-words text-xs text-content-muted"
            >
              {notification.message ?? 'No additional details.'}
            </span>
            <span className="mt-1 block text-xs text-content-muted">
              {formatRelativeDate(String(notification.createdAt))}
            </span>
            {notification.actionUrl ? (
              <span className="mt-1 block break-words text-xs text-content-muted">
                Action URL:{' '}
                <span className="font-mono">
                  {notificationActionDestination(notification.actionUrl)}
                </span>
              </span>
            ) : null}
            {!notification.isRead ? <span className="sr-only">Unread notification</span> : null}
          </span>
          {!notification.isRead ? (
            <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
          ) : null}
        </div>
      </button>
    </li>
  );
};

const NotificationPreviewList = ({
  notifications,
  onNotificationOpen,
}: Pick<NotificationPreviewProps, 'notifications' | 'onNotificationOpen'>) => {
  if (notifications.length === 0) return null;

  return (
    <ul aria-label="Notification previews" className="divide-y divide-line-subtle">
      {notifications.map((notification) => (
        <NotificationPreviewItem
          key={notification.id}
          notification={notification}
          onOpen={onNotificationOpen}
        />
      ))}
    </ul>
  );
};

const LoadedNotificationPreview = (props: NotificationPreviewProps) => {
  if (!props.previewLoaded) return null;

  return (
    <>
      {props.previewError ? (
        <PageNotice
          variant="warning"
          title="Notifications May Be Out of Date"
          className="m-3"
          action={
            <Button variant="quiet" size="sm" onClick={() => void props.refreshPreview()}>
              Retry Notification Preview
            </Button>
          }
        >
          Showing the last loaded data.
        </PageNotice>
      ) : null}

      {props.previewLoading ? (
        <p role="status" aria-atomic="true" className="px-4 py-2 text-xs text-content-muted">
          Refreshing notifications…
        </p>
      ) : null}

      <NotificationPreviewList
        notifications={props.notifications}
        onNotificationOpen={props.onNotificationOpen}
      />

      {props.notifications.length === 0 ? (
        <div className="p-3">
          <AsyncState
            kind="empty"
            title="No Notifications"
            description="New notifications will appear here."
          />
        </div>
      ) : null}

      {props.previewMayBeCapped ? (
        <PageNotice variant="info" className="m-3">
          Showing up to 15 recent items. More may be available.
        </PageNotice>
      ) : null}
    </>
  );
};

const NotificationDropdownPanel = (props: NotificationDropdownPanelProps) => (
  <div
    ref={props.panelRef}
    {...props.panelProps}
    role="region"
    aria-labelledby={props.headingId}
    tabIndex={-1}
    data-popover-panel="true"
    data-placement={props.position.placement}
    style={props.position.style}
    className="fixed z-50 flex max-h-[calc(100dvh-2rem)] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden overscroll-contain rounded-lg border border-line bg-surface text-content-primary shadow-xl"
  >
    <header className="shrink-0 border-b border-line px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id={props.headingId} className="text-sm font-semibold">
          {NAV_LABELS.notifications}
        </h2>
        {props.unreadCount > 0 ? (
          <span className="rounded-full bg-status-danger/10 px-2 py-0.5 text-xs font-medium text-status-danger">
            {props.unreadCount} unread
          </span>
        ) : null}
      </div>
    </header>

    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {props.countError ? (
        <PageNotice
          variant="warning"
          className="m-3"
          action={
            <Button variant="quiet" size="sm" onClick={() => void props.refreshCount()}>
              Retry Unread Count
            </Button>
          }
        >
          Unread count may be out of date.
        </PageNotice>
      ) : null}

      <InitialNotificationPreview
        previewError={props.previewError}
        previewLoaded={props.previewLoaded}
        previewLoading={props.previewLoading}
        refreshPreview={props.refreshPreview}
      />
      <LoadedNotificationPreview
        notifications={props.notifications}
        onNotificationOpen={props.onNotificationOpen}
        previewError={props.previewError}
        previewLoaded={props.previewLoaded}
        previewLoading={props.previewLoading}
        previewMayBeCapped={props.previewMayBeCapped}
        refreshPreview={props.refreshPreview}
      />
    </div>

    <footer className="shrink-0 border-t border-line px-4 py-3">
      <Link
        to="/notifications"
        onClick={props.onClose}
        className="block min-h-11 rounded-md px-3 py-2.5 text-center text-sm font-medium text-accent hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        View all notifications
      </Link>
    </footer>
  </div>
);

export default NotificationDropdownPanel;
