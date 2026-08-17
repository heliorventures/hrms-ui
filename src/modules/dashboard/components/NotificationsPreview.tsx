import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useGraphClient } from '../../../hooks/useGraphClient';
import CreateAnnouncementModal from '../../notifications/CreateAnnouncementModal';
import {
  announcementImageSrc,
  downloadAnnouncementAttachment,
} from '../../notifications/announcementAttachment';
import { NotificationBoardWithAttachmentsDocument } from '../../notifications/notificationQueries';
import type { AnnouncementAttachment } from '../../notifications/notificationTypes';

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
  imageAttachment?: AnnouncementAttachment | null;
  documentAttachment?: AnnouncementAttachment | null;
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

const shortId = (id: string | null | undefined, len = 8) => {
  if (!id) return '';
  const t = id.replace(/-/g, '');
  return t.length <= len ? id : `${t.slice(0, len)}…`;
};

const NotificationsPreview = ({ fullHeight = false }: NotificationsPreviewProps) => {
  const client = useGraphClient('client');
  const limit = fullHeight ? 20 : 3;
  const [board, setBoard] = useState<NotificationBoardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  const loadBoard = useCallback(async () => {
    const result = await client.request<NotificationBoardResult>(
      NotificationBoardWithAttachmentsDocument,
      { limit }
    );
    return result;
  }, [client, limit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const result = await loadBoard();
        if (!cancelled) setBoard(result);
      } catch {
        if (!cancelled) setBoard(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  const announcements = board?.announcements ?? [];
  const notifications = board?.notifications ?? [];
  const unread = board?.unreadNotificationCount ?? 0;

  if (loading) {
    return (
      <Card title="Announcements & Notifications" className={fullHeight ? 'h-full flex flex-col' : ''}>
        <div className={fullHeight ? 'flex-1 min-h-0 flex items-center justify-center' : ''}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </Card>
    );
  }

  const header = (
    <div className="mb-4 flex shrink-0 items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Announcements & notifications
        </h3>
        {unread > 0 ? (
          <p className="mt-0.5 text-xs text-primary-600 dark:text-primary-400">{unread} unread</p>
        ) : (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Company posts and your alerts</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setComposeOpen(true)}>
          Team post
        </Button>
        <Link
          to="/notifications"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          View all
        </Link>
      </div>
    </div>
  );

  const announcementBlock =
    announcements.length > 0 ? (
      <div className="mb-5 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Public announcements
        </p>
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-lg border border-indigo-200/80 bg-indigo-50/40 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/25"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{announcement.title}</p>
                <p className="mt-1 line-clamp-3 text-xs text-gray-600 dark:text-gray-300">
                  {announcement.body ?? 'No Body Provided.'}
                </p>
                {announcement.imageAttachment ? (
                  <img
                    src={announcementImageSrc(announcement.imageAttachment) ?? undefined}
                    alt=""
                    className="mt-2 max-h-32 max-w-full rounded border border-gray-200 object-contain dark:border-gray-600"
                  />
                ) : null}
                {announcement.documentAttachment ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (announcement.documentAttachment) {
                        downloadAnnouncementAttachment(announcement.documentAttachment);
                      }
                    }}
                    className="mt-2 inline-block text-xs text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Download attachment
                  </button>
                ) : null}
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
            {(announcement.targetDepartmentId || announcement.targetLocationId) ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {announcement.targetDepartmentId ? (
                  <Badge variant="neutral" size="sm">
                    Dept {shortId(announcement.targetDepartmentId)}
                  </Badge>
                ) : null}
                {announcement.targetLocationId ? (
                  <Badge variant="neutral" size="sm">
                    Loc {shortId(announcement.targetLocationId)}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    )
    : null;

  const notificationsBlock =
    announcements.length === 0 && notifications.length === 0 ? null : (
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          For you
        </p>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      notification.isRead
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'bg-primary-100 dark:bg-primary-900'
                    }`}
                  >
                    <svg
                      className={`h-4 w-4 ${
                        notification.isRead
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title ?? 'Untitled notification'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {notification.message ?? 'No Message Body Provided.'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Private Notifications Yet.</p>
        )}
      </div>
    );

  const listContent = (
    <>
      {announcementBlock}
      {notificationsBlock}
      {!announcementBlock && !notificationsBlock ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No Announcements Or Notifications.</p>
      ) : null}
    </>
  );

  if (fullHeight) {
    return (
      <>
        <CreateAnnouncementModal
          isOpen={composeOpen}
          onClose={() => setComposeOpen(false)}
          onCreated={() => void loadBoard().then((r) => setBoard(r))}
        />
        <Card className="flex h-full flex-col overflow-hidden">
          {header}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">{listContent}</div>
        </Card>
      </>
    );
  }

  return (
    <>
      <CreateAnnouncementModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => void loadBoard().then((r) => setBoard(r))}
      />
      <Card>
        {header}
        {listContent}
      </Card>
    </>
  );
};

export default NotificationsPreview;
