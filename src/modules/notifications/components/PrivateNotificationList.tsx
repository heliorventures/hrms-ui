import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { normalizeInternalActionUrl } from '../../../utils/actionUrl';
import {
  emptyNotificationsIcon,
  formatTimeAgo,
  normalizeNotificationKind,
  notificationKindClassName,
  notificationKindIcon,
} from '../notificationPresentation';
import type { NotificationFilter, NotificationRow } from '../notificationTypes';

interface PrivateNotificationListProps {
  actionBusy: boolean;
  filter: NotificationFilter;
  loading: boolean;
  notifications: NotificationRow[];
  onMarkRead: (id: string) => void;
}

const PrivateNotificationList = ({
  actionBusy,
  filter,
  loading,
  notifications,
  onMarkRead,
}: PrivateNotificationListProps) => {
  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading Notifications...</p>;
  }

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        {emptyNotificationsIcon}
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const kind = normalizeNotificationKind(notification.kind);
        const actionUrl = normalizeInternalActionUrl(notification.actionUrl);
        return (
          <div
            key={notification.id}
            className={`rounded-lg border p-4 transition-colors ${
              notification.isRead
                ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                : 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${notificationKindClassName(kind)}`}
              >
                {notificationKindIcon(kind)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title ?? 'Untitled notification'}
                      </h3>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {notification.message ?? 'No Message Body Provided.'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Badge variant="neutral" size="sm">
                        {notification.kind ?? 'personal'}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    {actionUrl ? (
                      <p className="mt-2 break-all text-xs text-gray-500 dark:text-gray-400">
                        Destination: <span className="font-mono">{actionUrl}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionBusy}
                        onClick={() => onMarkRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    {actionUrl && (
                      <Link to={actionUrl}>
                        <Button variant="primary" size="sm">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrivateNotificationList;
