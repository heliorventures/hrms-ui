import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { canManageNotifications } from '../../auth/navAccess';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import AnnouncementList from './components/AnnouncementList';
import PrivateNotificationList from './components/PrivateNotificationList';
import { useNotificationBoard } from './useNotificationBoard';

const NotificationsPage = () => {
  const { can, clientSession } = useAuth();
  const navOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const showAdminNotifLink = canManageNotifications(navOpts);
  const [composeOpen, setComposeOpen] = useState(false);
  const {
    actionBusy,
    announcements,
    deptNameById,
    error,
    filter,
    filteredNotifications,
    loading,
    markAllRead,
    markRead,
    refreshBoard,
    setFilter,
  } = useNotificationBoard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm">
            <Link
              to="/profile/settings"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Notification preferences
            </Link>
            <span className="text-gray-500 dark:text-gray-400">
              {' '}
              - mute categories or turn off bulletin.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {showAdminNotifLink ? (
            <Link
              to="/admin/notifications"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:focus:ring-offset-slate-900"
            >
              Admin console
            </Link>
          ) : null}
          <Button variant="primary" size="sm" onClick={() => setComposeOpen(true)}>
            New announcement
          </Button>
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
            disabled={actionBusy}
            onClick={() => void markAllRead()}
          >
            {actionBusy ? 'Working...' : 'Mark all read'}
          </Button>
        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => void refreshBoard()}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Public Announcements">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Company updates, celebrations, and posts shared with everyone. Your personal alerts appear below.
        </p>
        <AnnouncementList
          announcements={announcements}
          deptNameById={deptNameById}
          loading={loading}
        />
      </Card>

      <Card title="Your Private Notifications">
        <PrivateNotificationList
          actionBusy={actionBusy}
          filter={filter}
          loading={loading}
          notifications={filteredNotifications}
          onMarkRead={(id) => void markRead(id)}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
