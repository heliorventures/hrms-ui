import { Bell, Building2, Settings, User } from 'lucide-react';
import type { NotificationKind } from './notificationTypes';

export const shortId = (id: string | null | undefined, length = 8) => {
  if (!id) return '';
  const normalized = id.replace(/-/g, '');
  return normalized.length <= length ? id : `${normalized.slice(0, length)}...`;
};

export const normalizeNotificationKind = (kind?: string | null): NotificationKind => {
  const normalized = (kind ?? '').toLowerCase();
  if (normalized.includes('company') || normalized.includes('announcement')) return 'company';
  if (normalized.includes('system')) return 'system';
  return 'personal';
};

export const notificationKindClassName = (type: NotificationKind) => {
  switch (type) {
    case 'company':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
    case 'personal':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
    case 'system':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
  }
};

export const notificationKindIcon = (type: NotificationKind) => {
  switch (type) {
    case 'company':
      return <Building2 className="h-5 w-5" aria-hidden="true" />;
    case 'personal':
      return <User className="h-5 w-5" aria-hidden="true" />;
    case 'system':
      return <Settings className="h-5 w-5" aria-hidden="true" />;
  }
};

export const emptyNotificationsIcon = <Bell className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />;

export const formatTimeAgo = (dateString: string) => {
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
