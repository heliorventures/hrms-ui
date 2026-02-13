import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMockApi } from '../../hooks/useMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { mockNotifications } from '../../mocks/notifications';
import { NotificationType } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications, loading } = useMockApi(
    () =>
      mockNotifications
        .filter(
          (n) =>
            n.tenantId === currentTenant.id &&
            (!n.userId || n.userId === user?.id)
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    { delay: 400 }
  );

  const filteredNotifications =
    filter === 'unread'
      ? notifications?.filter((n) => !n.read)
      : notifications;

  const handleMarkAsRead = (notificationId: string) => {
    alert(`Notification ${notificationId} marked as read`);
  };

  const handleMarkAllAsRead = () => {
    alert('All notifications marked as read');
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'company':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case 'personal':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case 'system':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'personal':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'system':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : filteredNotifications && filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition-colors ${
                  notification.read
                    ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    : 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getTypeColor(notification.type)}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge variant="neutral" size="sm">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        {notification.link && (
                          <Link to={notification.link}>
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
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications found'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
