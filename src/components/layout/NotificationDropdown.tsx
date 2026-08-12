import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UI_EMPTY_TEXT, NAV_LABELS } from '../../constants/uiText';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { notificationActionDestination } from '../../utils/actionUrl';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  NotificationBoardDocument,
  MarkNotificationReadDocument,
  type NotificationBoardQuery,
} from '../../api/graphql/graphql';

type BoardNotification = NotificationBoardQuery['notifications'][number];

const PREVIEW_LIMIT = 15;
const REFRESH_MS = 60_000;

const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const client = useGraphClient('client');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<BoardNotification[]>([]);
  const [serverUnread, setServerUnread] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setServerUnread(0);
      return;
    }
    setLoadError(null);
    try {
      const data = await client.request<NotificationBoardQuery>(NotificationBoardDocument, {
        limit: PREVIEW_LIMIT,
      });
      setNotifications(data.notifications ?? []);
      setServerUnread(data.unreadNotificationCount ?? 0);
    } catch (e) {
      setLoadError(graphQlUserMessage(e));
      setNotifications([]);
      setServerUnread(0);
    }
  }, [client, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchNotifications();
    const t = setInterval(() => void fetchNotifications(), REFRESH_MS);
    return () => clearInterval(t);
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      void fetchNotifications();
    }
  }, [isOpen, isAuthenticated, fetchNotifications]);

  const unreadCount = serverUnread;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (n: BoardNotification) => {
    try {
      if (!n.isRead) {
        await client.request(MarkNotificationReadDocument, { id: n.id });
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
        setServerUnread((u) => Math.max(0, u - 1));
      }
    } catch {
      /* still navigate */
    }
    navigate(notificationActionDestination(n.actionUrl));
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={NAV_LABELS.notifications}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{NAV_LABELS.notifications}</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadError && (
              <p className="px-4 py-3 text-xs text-amber-700 dark:text-amber-300">{loadError}</p>
            )}
            {!loadError && notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleNotificationClick(notification)}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            notification.isRead
                              ? 'bg-gray-100 dark:bg-gray-700'
                              : 'bg-primary-100 dark:bg-primary-900'
                          }`}
                        >
                          <svg
                            className={`h-5 w-5 ${
                              notification.isRead
                                ? 'text-gray-600 dark:text-gray-400'
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
                        <p
                          className={`text-sm font-medium ${
                            notification.isRead
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {notification.title ?? 'Notification'}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                          {notification.message ?? '—'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(String(notification.createdAt))}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary-600" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              !loadError && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{UI_EMPTY_TEXT.notifications}</p>
                </div>
              )
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
