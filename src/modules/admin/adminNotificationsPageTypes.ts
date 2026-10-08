import type { FormEvent } from 'react';

import type { AnnouncementVideoValue } from '../notifications/components/AnnouncementVideoFields';
import type { NotificationAutomationSettings } from '../notifications/notificationAutomationQueries';

export interface AdminAnnouncementRow {
  id: string;
  title: string;
  body?: string | null;
  targetAudience?: string | null;
  targetDepartmentId?: string | null;
  targetLocationId?: string | null;
  postSource: string;
  publishAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  hasVideoAttachment?: boolean;
  videoLink?: string | null;
}

export interface AdminNotificationRow {
  id: string;
  userId: string;
  kind?: string | null;
  title?: string | null;
  message?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationEmployeeRow {
  id: string;
  fullName: string;
  userId?: string | null;
  linkedUserEmail?: string | null;
  linkedUserUsername?: string | null;
}

export interface AdminNotificationDepartmentRow {
  id: string;
  name: string;
}

export interface AdminNotificationsConsoleData {
  notificationAutomationSettings: NotificationAutomationSettings;
  adminAnnouncements: AdminAnnouncementRow[];
  adminNotifications: AdminNotificationRow[];
  employees: AdminNotificationEmployeeRow[];
  departments: AdminNotificationDepartmentRow[];
}

export interface AnnouncementEditorState extends AnnouncementVideoValue {
  title: string;
  body: string;
  departmentId: string;
  locationId: string;
  roleCode: string;
  clearRoleAudience: boolean;
  publishAt: string;
  expiresAt: string;
  employeePost: boolean;
  imageFile: File | null;
  documentFile: File | null;
  editId: string | null;
}

export interface DirectNotificationState {
  selectedUserIds: string[];
  title: string;
  message: string;
  kind: string;
  url: string;
}

export type AnnouncementEditorField = Exclude<keyof AnnouncementEditorState, 'editId'>;
export type DirectNotificationField = Exclude<keyof DirectNotificationState, 'selectedUserIds'>;

export interface AdminAnnouncementEditorModel {
  state: AnnouncementEditorState;
  existingRoleCode: string;
  hasExistingVideo: boolean;
  setField: <Key extends AnnouncementEditorField>(
    field: Key,
    value: AnnouncementEditorState[Key]
  ) => void;
  startEdit: (id: string) => void;
  cancelEdit: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  videoProgress: number | null;
  cancelVideoUpload: () => void;
}

export interface AdminDirectNotificationModel {
  state: DirectNotificationState;
  setField: <Key extends DirectNotificationField>(
    field: Key,
    value: DirectNotificationState[Key]
  ) => void;
  setSelectedUserIds: (userIds: string[]) => void;
  submit: (event: FormEvent<Element>) => void;
}
