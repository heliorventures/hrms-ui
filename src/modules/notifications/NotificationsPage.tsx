import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { canManageNotifications } from '../../auth/navAccess';
import {
  NotificationBoardDocument,
  MarkNotificationReadDocument,
  MarkAllNotificationsReadDocument,
  OrgDepartmentsDocument,
  type OrgDepartmentsQuery,
} from '../../api/graphql/graphql';
import CreateAnnouncementModal from './CreateAnnouncementModal';

type NotificationKind = 'company' | 'personal' | 'system';

interface AnnouncementRow {
  id: string;
  title: string;
  body?: string | null;
  targetAudience?: string | null;
  targetDepartmentId?: string | null;
  targetLocationId?: string | null;
  publishAt?: string | null;
  expiresAt?: string | null;
  postSource?: string | null;
  imageReadUrl?: string | null;
  documentReadUrl?: string | null;
}

interface NotificationRow {
  id: string;
  kind?: string | null;
  title?: string | null;
  message?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBoardData {
  announcements: AnnouncementRow[];
  notifications: NotificationRow[];
}

const shortId = (id: string | null | undefined, len = 8) => {
  if (!id) return '';
  const t = id.replace(/-/g, '');
  return t.length <= len ? id : `${t.slice(0, len)}…`;
};

const NotificationsPage = () => {
  const client = useGraphClient('client');
  const { can, clientSession } = useAuth();
  const navOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const showAdminNotifLink = canManageNotifications(navOpts);
  const [deptNameById, setDeptNameById] = useState<Map<string, string>>(new Map());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [data, setData] = useState<NotificationBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const loadBoard = useCallback(async () => {
    const result = await client.request<NotificationBoardData>(NotificationBoardDocument, {
      limit: 20,
    });
    return result;
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await client.request<OrgDepartmentsQuery>(OrgDepartmentsDocument, { limit: 100 });
        if (cancelled) return;
        const m = new Map<string, string>();
        for (const d of r.departments ?? []) m.set(d.id, d.name);
        setDeptNameById(m);
      } catch {
        if (!cancelled) setDeptNameById(new Map());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadBoard();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load notifications');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  const filteredNotifications = useMemo(
    () =>
      filter === 'unread'
        ? (data?.notifications?.filter((n) => !n.isRead) ?? [])
        : (data?.notifications ?? []),
    [data, filter]
  );

  const normalizeKind = (kind?: string | null): NotificationKind => {
    const normalized = (kind ?? '').toLowerCase();
    if (normalized.includes('company') || normalized.includes('announcement')) return 'company';
    if (normalized.includes('system')) return 'system';
    return 'personal';
  };

  const getTypeIcon = (type: NotificationKind) => {
    switch (type) {
      case 'company':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const getTypeColor = (type: NotificationKind) => {
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
              — mute categories or turn off bulletin.
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
            onClick={async () => {
              setActionBusy(true);
              try {
                await client.request(MarkAllNotificationsReadDocument);
                setData(await loadBoard());
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to mark all read');
              } finally {
                setActionBusy(false);
              }
            }}
          >
            {actionBusy ? 'Working…' : 'Mark all read'}
          </Button>
        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={() => void loadBoard().then((r) => setData(r))}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Public announcements">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Company updates, celebrations, and posts shared with everyone. Your personal alerts (leave,
          expenses, attendance) appear below.
        </p>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading announcements...</p>
        ) : data?.announcements?.length ? (
          <div className="space-y-3">
            {data.announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {announcement.body ?? 'No announcement body provided.'}
                    </p>
                    {announcement.imageReadUrl && (
                      <div className="mt-3">
                        <img
                          src={announcement.imageReadUrl}
                          alt=""
                          className="max-h-48 max-w-full rounded-md border border-gray-200 object-contain dark:border-gray-600"
                        />
                      </div>
                    )}
                    {announcement.documentReadUrl && (
                      <div className="mt-2">
                        <a
                          href={announcement.documentReadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                        >
                          View attachment
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="info">{announcement.targetAudience ?? 'ALL'}</Badge>
                    {announcement.postSource && (
                      <Badge variant="neutral" size="sm">
                        {announcement.postSource === 'employee_post' ? 'Team post' : 'Company'}
                      </Badge>
                    )}
                  </div>
                </div>
                {(announcement.targetDepartmentId ||
                  announcement.targetLocationId ||
                  (announcement.targetAudience?.startsWith('ROLE:') ?? false)) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {announcement.targetDepartmentId ? (
                      <Badge variant="neutral" size="sm">
                        Dept{' '}
                        {deptNameById.get(announcement.targetDepartmentId) ??
                          shortId(announcement.targetDepartmentId)}
                      </Badge>
                    ) : null}
                    {announcement.targetLocationId ? (
                      <Badge variant="neutral" size="sm">
                        Location {shortId(announcement.targetLocationId)}
                      </Badge>
                    ) : null}
                    {announcement.targetAudience?.startsWith('ROLE:') ? (
                      <Badge variant="neutral" size="sm">
                        Role {announcement.targetAudience.slice('ROLE:'.length)}
                      </Badge>
                    ) : null}
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Publish at:{' '}
                  {announcement.publishAt
                    ? new Date(announcement.publishAt).toLocaleString('en-IN')
                    : 'Immediate'}
                  {announcement.expiresAt
                    ? ` · Expires ${new Date(announcement.expiresAt).toLocaleString('en-IN')}`
                    : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No announcements found.</p>
        )}
      </Card>

      <Card title="Your private notifications">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
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
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getTypeColor(normalizeKind(notification.kind))}`}
                  >
                    {getTypeIcon(normalizeKind(notification.kind))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {notification.title ?? 'Untitled notification'}
                          </h3>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message ?? 'No message body provided.'}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge variant="neutral" size="sm">
                            {notification.kind ?? 'personal'}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionBusy}
                            onClick={async () => {
                              setActionBusy(true);
                              try {
                                await client.request(MarkNotificationReadDocument, {
                                  id: notification.id,
                                });
                                setData(await loadBoard());
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Failed to mark read');
                              } finally {
                                setActionBusy(false);
                              }
                            }}
                          >
                            Mark read
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Link to={notification.actionUrl}>
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
              {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
