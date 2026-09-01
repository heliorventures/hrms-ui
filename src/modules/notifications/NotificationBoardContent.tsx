import AsyncState from '../../components/common/AsyncState';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageNotice from '../../components/common/PageNotice';

import AnnouncementList from './components/AnnouncementList';
import PrivateNotificationList from './components/PrivateNotificationList';
import type { useNotificationBoard } from './useNotificationBoard';

type NotificationBoardModel = ReturnType<typeof useNotificationBoard>;

interface NotificationBoardContentProps {
  board: NotificationBoardModel;
}

const CAP_MESSAGE = 'Showing up to 20 recent items. More may be available.';

const InitialNotificationBoard = ({ board }: NotificationBoardContentProps) => {
  if (board.phase === 'initial-error') {
    return (
      <AsyncState
        kind="error"
        title="Notifications Could Not Be Loaded"
        description={board.error ?? 'Try again.'}
        action={
          <Button variant="outline" onClick={() => void board.refreshBoard()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <AsyncState
      kind="loading"
      title="Loading Notifications…"
      description="Your latest notifications are being prepared."
    />
  );
};

const NotificationBoardNotices = ({ board }: NotificationBoardContentProps) => (
  <>
    {board.phase === 'stale-error' ? (
      <PageNotice
        variant="warning"
        title="Notifications May Be Out of Date"
        action={
          <Button variant="outline" size="sm" onClick={() => void board.refreshBoard()}>
            Retry
          </Button>
        }
      >
        Showing the last loaded data.
      </PageNotice>
    ) : null}

    {board.phase === 'refreshing' ? (
      <PageNotice variant="info" title="Refreshing Notifications…">
        The current lists remain visible.
      </PageNotice>
    ) : null}

    {board.phase === 'ready' && board.error ? (
      <PageNotice variant="error" title="Notification Update Was Not Completed">
        {board.error}
      </PageNotice>
    ) : null}
  </>
);

const AnnouncementBoardCard = ({ board }: NotificationBoardContentProps) => (
  <Card title="Public Announcements">
    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
      Company updates, celebrations, and posts shared with everyone. Your personal alerts appear
      below.
    </p>
    <AnnouncementList
      announcements={board.announcements}
      deptNameById={board.deptNameById}
      loading={false}
    />
    {board.announcementsMayBeCapped ? (
      <PageNotice variant="info" className="mt-4">
        {CAP_MESSAGE}
      </PageNotice>
    ) : null}
  </Card>
);

const PrivateNotificationBoardCard = ({ board }: NotificationBoardContentProps) => {
  const nextFilter = board.filter === 'all' ? 'unread' : 'all';
  const filterLabel = board.filter === 'all' ? 'Show unread private' : 'Show all private';

  return (
    <Card title="Your Private Notifications">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Unread filtering and read status apply only to your private notifications.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => board.setFilter(nextFilter)}>
            {filterLabel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={board.actionBusy}
            onClick={() => void board.markAllRead()}
          >
            {board.actionBusy ? 'Working...' : 'Mark all private read'}
          </Button>
        </div>
      </div>
      <PrivateNotificationList
        actionBusy={board.actionBusy}
        filter={board.filter}
        loading={false}
        notifications={board.filteredNotifications}
        onMarkRead={(id) => void board.markRead(id)}
      />
      {board.notificationsMayBeCapped ? (
        <PageNotice variant="info" className="mt-4">
          {CAP_MESSAGE}
        </PageNotice>
      ) : null}
    </Card>
  );
};

const NotificationBoardContent = ({ board }: NotificationBoardContentProps) => {
  if (!board.hasLoadedData) return <InitialNotificationBoard board={board} />;

  return (
    <>
      <NotificationBoardNotices board={board} />
      <AnnouncementBoardCard board={board} />
      <PrivateNotificationBoardCard board={board} />
    </>
  );
};

export default NotificationBoardContent;
