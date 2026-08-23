import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { NotificationBoardSummaryDocument } from '../../../api/graphql/graphql';
import AsyncState from '../../../components/common/AsyncState';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';
import AnnouncementAttachmentAction from '../../notifications/components/AnnouncementAttachmentAction';
import CreateAnnouncementModal from '../../notifications/CreateAnnouncementModal';

import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';

interface AnnouncementRow {
  id: string;
  title: string;
  body?: string | null;
  targetAudience?: string | null;
  targetDepartmentId?: string | null;
  targetLocationId?: string | null;
  postSource?: string | null;
  publishAt?: string | null;
  expiresAt?: string | null;
  hasImageAttachment: boolean;
  hasDocumentAttachment: boolean;
}

interface NotificationRow {
  id: string;
  title?: string | null;
  message?: string | null;
  isRead: boolean;
}

interface NotificationBoardResult {
  unreadNotificationCount?: number | null;
  announcements: AnnouncementRow[];
  notifications: NotificationRow[];
}

interface NotificationsPreviewProps {
  fullHeight?: boolean;
}

interface NotificationsPreviewHeaderProps {
  onCompose: () => void;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
  unread: number;
}

const NotificationsPreviewHeader = ({
  onCompose,
  onRefresh,
  phase,
  unread,
}: NotificationsPreviewHeaderProps) => (
  <div className="mb-4 flex shrink-0 flex-wrap items-start justify-between gap-2">
    <div className="min-w-0">
      <h3 className="break-words text-lg font-semibold text-gray-900 [overflow-wrap:anywhere] dark:text-white">
        Announcements & Notifications
      </h3>
      {unread > 0 ? (
        <p className="mt-0.5 text-xs text-primary-600 dark:text-primary-400">{unread} unread</p>
      ) : (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Company posts and your alerts
        </p>
      )}
    </div>
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <Button
        variant="quiet"
        size="sm"
        busy={phase === 'refreshing'}
        busyLabel="Refreshing Announcements and Notifications…"
        onClick={onRefresh}
      >
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={onCompose}>
        Team Post
      </Button>
      <Link
        to="/notifications"
        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        View All
      </Link>
    </div>
  </div>
);

interface AnnouncementsBlockProps {
  announcements: AnnouncementRow[];
  limit: number;
}

const AnnouncementsBlock = ({ announcements, limit }: AnnouncementsBlockProps) => {
  if (announcements.length === 0) return null;

  return (
    <div className="mb-5 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Public Announcements
      </p>
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-lg border border-indigo-200/80 bg-indigo-50/40 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/25"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold text-gray-900 [overflow-wrap:anywhere] dark:text-white">
                {announcement.title}
              </p>
              <p className="mt-1 line-clamp-3 break-words text-xs text-gray-600 [overflow-wrap:anywhere] dark:text-gray-300">
                {announcement.body ?? 'No Body Provided.'}
              </p>
              <AnnouncementAttachmentAction
                announcementId={announcement.id}
                available={announcement.hasImageAttachment}
                kind="IMAGE"
                compact
              />
              <AnnouncementAttachmentAction
                announcementId={announcement.id}
                available={announcement.hasDocumentAttachment}
                kind="DOCUMENT"
                compact
              />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="info" size="sm">
                {announcement.targetAudience ?? 'ALL'}
              </Badge>
              {announcement.postSource ? (
                <Badge variant="neutral" size="sm">
                  {announcement.postSource === 'employee_post' ? 'Team' : 'Company'}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      ))}
      {announcements.length === limit ? (
        <p role="status" className="text-xs text-content-secondary">
          Showing up to {limit} announcements. More may be available.
        </p>
      ) : null}
    </div>
  );
};

interface NotificationStatusIconProps {
  isRead: boolean;
}

const NotificationStatusIcon = ({ isRead }: NotificationStatusIconProps) => {
  const background = isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary-100 dark:bg-primary-900';
  const foreground = isRead
    ? 'text-gray-500 dark:text-gray-400'
    : 'text-primary-600 dark:text-primary-400';

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${background}`}>
      <svg
        aria-hidden="true"
        className={`h-4 w-4 ${foreground}`}
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
  );
};

interface PrivateNotificationsBlockProps {
  hasAnnouncements: boolean;
  limit: number;
  notifications: NotificationRow[];
}

const PrivateNotificationsBlock = ({
  hasAnnouncements,
  limit,
  notifications,
}: PrivateNotificationsBlockProps) => {
  if (!hasAnnouncements && notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        For You
      </p>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No Private Notifications Yet.</p>
      ) : (
        <>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <NotificationStatusIcon isRead={notification.isRead} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-gray-900 [overflow-wrap:anywhere] dark:text-white">
                    {notification.title ?? 'Untitled Notification'}
                  </p>
                  <p className="mt-1 break-words text-xs text-gray-500 [overflow-wrap:anywhere] dark:text-gray-400">
                    {notification.message ?? 'No Message Body Provided.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === limit ? (
            <p role="status" className="text-xs text-content-secondary">
              Showing up to {limit} notifications. More may be available.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
};

interface NotificationsListContentProps {
  announcements: AnnouncementRow[];
  limit: number;
  notifications: NotificationRow[];
}

const NotificationsListContent = ({
  announcements,
  limit,
  notifications,
}: NotificationsListContentProps) => {
  if (announcements.length === 0 && notifications.length === 0) {
    return (
      <AsyncState
        kind="empty"
        title="No Announcements or Notifications Yet."
        description="New company posts and personal alerts will appear here."
      />
    );
  }

  return (
    <>
      <AnnouncementsBlock announcements={announcements} limit={limit} />
      <PrivateNotificationsBlock
        hasAnnouncements={announcements.length > 0}
        notifications={notifications}
        limit={limit}
      />
    </>
  );
};

interface NotificationsReadyCardProps {
  announcements: AnnouncementRow[];
  error: string | null;
  fullHeight: boolean;
  limit: number;
  notifications: NotificationRow[];
  onCompose: () => void;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
  unread: number;
}

const NotificationsReadyCard = ({
  announcements,
  error,
  fullHeight,
  limit,
  notifications,
  onCompose,
  onRefresh,
  phase,
  unread,
}: NotificationsReadyCardProps) => {
  const header = (
    <NotificationsPreviewHeader
      unread={unread}
      phase={phase}
      onRefresh={onRefresh}
      onCompose={onCompose}
    />
  );
  const notice = (
    <DashboardCardRefreshNotice
      phase={phase}
      loadingTitle="Refreshing Announcements and Notifications…"
      loadingDescription="Showing the last loaded data while this updates."
      staleTitle="Announcements and Notifications May Be Out of Date"
      staleDescription="Showing the last loaded data."
      error={error}
      onRetry={onRefresh}
    />
  );
  const content = (
    <NotificationsListContent
      announcements={announcements}
      notifications={notifications}
      limit={limit}
    />
  );

  if (fullHeight) {
    return (
      <Card className="flex h-full flex-col overflow-hidden">
        {header}
        {notice}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{content}</div>
      </Card>
    );
  }

  return (
    <Card>
      {header}
      {notice}
      {content}
    </Card>
  );
};

const NotificationsPreview = ({ fullHeight = false }: NotificationsPreviewProps) => {
  const client = useGraphClient('client');
  const limit = fullHeight ? 20 : 3;
  const [composeOpen, setComposeOpen] = useState(false);
  const loadBoard = useCallback(async () => {
    const result = await client.request<NotificationBoardResult>(NotificationBoardSummaryDocument, {
      limit,
    });
    return result;
  }, [client, limit]);
  const { data: board, error, phase, refresh } = useRetainedQuery(loadBoard);
  const announcements = board?.announcements ?? [];
  const notifications = board?.notifications ?? [];
  const unread = board?.unreadNotificationCount ?? 0;
  const onRefresh = () => void refresh();

  if (phase === 'initial-loading' || phase === 'initial-error') {
    return (
      <Card
        title="Announcements & Notifications"
        className={fullHeight ? 'h-full flex flex-col' : ''}
      >
        <DashboardCardInitialState
          phase={phase}
          loadingTitle="Loading Announcements and Notifications…"
          errorTitle="Announcements and Notifications Could Not Be Loaded"
          error={error}
          onRetry={onRefresh}
        />
      </Card>
    );
  }

  return (
    <>
      <CreateAnnouncementModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={onRefresh}
      />
      <NotificationsReadyCard
        announcements={announcements}
        error={error}
        fullHeight={fullHeight}
        limit={limit}
        notifications={notifications}
        onCompose={() => setComposeOpen(true)}
        onRefresh={onRefresh}
        phase={phase}
        unread={unread}
      />
    </>
  );
};

export default NotificationsPreview;
