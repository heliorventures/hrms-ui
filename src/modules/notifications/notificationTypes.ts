export type NotificationFilter = 'all' | 'unread';

export type NotificationKind = 'company' | 'personal' | 'system';

export interface AnnouncementAttachment {
  fileName: string;
  mimeType: string;
  fileSizeBytes?: number | null;
  contentBase64: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body?: string | null;
  targetAudience?: string | null;
  targetDepartmentId?: string | null;
  targetLocationId?: string | null;
  publishAt?: string | null;
  expiresAt?: string | null;
  postSource?: string | null;
  imageAttachment?: AnnouncementAttachment | null;
  documentAttachment?: AnnouncementAttachment | null;
}

export interface NotificationRow {
  id: string;
  kind?: string | null;
  title?: string | null;
  message?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationBoardData {
  announcements: AnnouncementRow[];
  notifications: NotificationRow[];
}
