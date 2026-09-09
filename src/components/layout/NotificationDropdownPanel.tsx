import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useNotificationOwnerKey } from '../../modules/notifications/useNotificationOwnerKey';
import AsyncState from '../common/AsyncState';
import Button from '../common/Button';
import PageNotice from '../common/PageNotice';

import AnnouncementDrawerContent from './AnnouncementDrawerContent';
import NotificationPreviewItem from './NotificationPreviewItem';
import type { BoardNotification } from './useNotificationDropdownData';

interface NotificationDropdownPanelProps {
  countError: string | null;
  notifications: BoardNotification[];
  onClose: () => void;
  onNotificationOpen: (notification: BoardNotification) => void;
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

const NotificationDropdownPanel = (props: NotificationDropdownPanelProps) => {
  const ownerKey = useNotificationOwnerKey();
  const [section, setSection] = useState<'personal' | 'announcements'>('personal');
  return (
    <div className="space-y-4">
      <div
        aria-label="Notification sections"
        className="grid grid-cols-2 gap-1 rounded-lg bg-surface-selected p-1"
      >
        {(['personal', 'announcements'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={section === value}
            onClick={() => setSection(value)}
            className={`min-h-11 rounded-md px-2 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${section === value ? 'bg-surface text-accent shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}
          >
            {value === 'personal' ? 'For you' : 'Announcements'}
          </button>
        ))}
      </div>
      {section === 'announcements' ? (
        <AnnouncementDrawerContent key={ownerKey} onClose={props.onClose} />
      ) : (
        <>
          {props.unreadCount > 0 ? (
            <p className="text-xs font-medium text-accent">{props.unreadCount} unread</p>
          ) : null}
          <div>
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
        </>
      )}
    </div>
  );
};

export default NotificationDropdownPanel;
