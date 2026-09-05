import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { canManageNotifications } from '../../auth/navAccess';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

import CreateAnnouncementModal from './CreateAnnouncementModal';
import NotificationBoardContent from './NotificationBoardContent';
import { useNotificationBoard } from './useNotificationBoard';

const NotificationsPage = () => {
  const { can, clientSession } = useAuth();
  const navOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const showAdminNotifLink = canManageNotifications(navOpts);
  const composeLabel = showAdminNotifLink ? 'New announcement' : 'New team post';
  const [composeOpen, setComposeOpen] = useState(false);
  const board = useNotificationBoard();

  return (
    <div className="space-y-4">
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
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:focus-visible:ring-offset-slate-900"
            >
              Admin console
            </Link>
          ) : null}
          <Button variant="primary" size="sm" onClick={() => setComposeOpen(true)}>
            {composeLabel}
          </Button>
        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => void board.refreshBoard()}
      />

      <NotificationBoardContent board={board} />
    </div>
  );
};

export default NotificationsPage;
