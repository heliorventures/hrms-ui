import { Link } from 'react-router-dom';
import { useMockApi } from '../../../hooks/useMockApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { mockNotifications } from '../../../mocks/notifications';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface NotificationsPreviewProps {
  fullHeight?: boolean;
}

const NotificationsPreview = ({ fullHeight = false }: NotificationsPreviewProps) => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  const limit = fullHeight ? 20 : 3;
  const { data: notifications, loading } = useMockApi(
    () =>
      mockNotifications
        .filter(
          (n) =>
            n.tenantId === currentTenant.id &&
            (!n.userId || n.userId === user?.id)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit),
    { delay: 300 }
  );

  if (loading) {
    return (
      <Card title="Recent Notifications" className={fullHeight ? 'h-full flex flex-col' : ''}>
        <div className={fullHeight ? 'flex-1 min-h-0 flex items-center justify-center' : ''}>
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  const header = (
    <div className="mb-4 flex shrink-0 items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Notifications
      </h3>
      <Link
        to="/notifications"
        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        View all
      </Link>
    </div>
  );

  const listContent =
    notifications && notifications.length > 0 ? (
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    notification.read
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'bg-primary-100 dark:bg-primary-900'
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${
                      notification.read
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-primary-600 dark:text-primary-400'
                    }`}
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
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No notifications
      </p>
    );

  if (fullHeight) {
    return (
      <Card className="flex h-full flex-col overflow-hidden">
        {header}
        <div className="flex-1 min-h-0 overflow-y-auto">{listContent}</div>
      </Card>
    );
  }

  return (
    <Card>
      {header}
      {listContent}
    </Card>
  );
};

export default NotificationsPreview;
