import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import type { AdminAnnouncementRow, AdminNotificationRow } from './adminNotificationsPageTypes';

interface AnnouncementHistoryProps {
  announcements: AdminAnnouncementRow[];
  busy: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementHistory = ({
  announcements,
  busy,
  onEdit,
  onDelete,
}: AnnouncementHistoryProps) => (
  <Card title="Recent Announcements">
    <div className="space-y-2">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="flex flex-wrap items-start justify-between gap-2 rounded border border-gray-200 p-3 dark:border-gray-700"
        >
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white">{announcement.title}</p>
            <p className="text-xs text-gray-500">
              {announcement.postSource} -{' '}
              {announcement.publishAt ? new Date(announcement.publishAt).toLocaleString() : '-'}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {announcement.targetDepartmentId ? <Badge size="sm">Dept</Badge> : null}
              {announcement.targetLocationId ? <Badge size="sm">Loc</Badge> : null}
              {announcement.targetAudience?.startsWith('ROLE:') ? (
                <Badge size="sm">Role</Badge>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(announcement.id)}
              disabled={busy}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onDelete(announcement.id)}
              disabled={busy}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

interface NotificationHistoryProps {
  notifications: AdminNotificationRow[];
  busy: boolean;
  onDelete: (id: string) => void;
}

export const NotificationHistory = ({
  notifications,
  busy,
  onDelete,
}: NotificationHistoryProps) => (
  <Card title="Recent In-App Notifications (Tenant)">
    <div className="max-h-96 space-y-2 overflow-y-auto text-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start justify-between gap-2 rounded border border-gray-100 p-2 dark:border-gray-800"
        >
          <div className="min-w-0">
            <p className="font-medium">{notification.title ?? '-'}</p>
            <p className="text-xs text-gray-500">
              user {notification.userId.slice(0, 8)}... - {notification.kind ?? '-'}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDelete(notification.id)}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  </Card>
);
