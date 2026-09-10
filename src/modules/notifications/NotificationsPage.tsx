import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { canManageNotifications } from '../../auth/navAccess';
import Button from '../../components/common/Button';
import PageActions from '../../components/common/PageActions';
import PageTabs from '../../components/common/PageTabs';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTabs } from '../../hooks/usePageTabs';

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
  const tabs = [
    { id: 'private', label: 'My Notifications' },
    { id: 'announcements', label: 'Announcements & Team Posts' },
  ];
  const { tab, setTab } = usePageTabs(tabs);

  return (
    <div className="space-y-4">
      <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      <PageActions>
        <div>
          <h1 className="sr-only">Notifications</h1>
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
          {tab === 'announcements' ? (
            <Button variant="primary" size="sm" onClick={() => setComposeOpen(true)}>
              {composeLabel}
            </Button>
          ) : null}
        </div>
      </PageActions>

      <CreateAnnouncementModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => void board.refreshBoard()}
      />

      <NotificationBoardContent board={board} activeTab={tab} />
    </div>
  );
};

export default NotificationsPage;
