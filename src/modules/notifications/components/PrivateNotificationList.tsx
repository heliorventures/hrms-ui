import { Link } from 'react-router-dom';

import { sessionMatchesTenant } from '../../../auth/tenantSession';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { authorizedNotificationActionUrl } from '../../../utils/actionUrl';
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
  const { can, clientSession, tenantId } = useAuth();
  const { currentTenant } = useTenant();
  const navAccess = sessionMatchesTenant(tenantId, currentTenant.id)
    ? { can, clientSession }
    : null;

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
        const actionUrl = navAccess
          ? authorizedNotificationActionUrl(notification.actionUrl, navAccess)
          : null;
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
                      <h3 className="min-w-0 break-words font-semibold text-gray-900 [overflow-wrap:anywhere] dark:text-white">
                        {notification.title ?? 'Untitled notification'}
                      </h3>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                      )}
                    </div>
                    <p className="mt-1 break-words text-sm text-gray-600 [overflow-wrap:anywhere] dark:text-gray-400">
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

                  <div className="flex shrink-0 flex-col gap-2">
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
                      <Link
                        to={actionUrl}
                        onClick={() => {
                          if (!notification.isRead) onMarkRead(notification.id);
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-content-inverse shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas md:min-h-8 md:py-1.5"
                      >
                        View
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
