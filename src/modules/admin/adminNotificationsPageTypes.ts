import type { FormEvent } from 'react';

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
  adminAnnouncements: AdminAnnouncementRow[];
  adminNotifications: AdminNotificationRow[];
  employees: AdminNotificationEmployeeRow[];
  departments: AdminNotificationDepartmentRow[];
}

export interface AnnouncementEditorState {
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
  setField: <Key extends AnnouncementEditorField>(
    field: Key,
    value: AnnouncementEditorState[Key]
  ) => void;
  startEdit: (id: string) => void;
  cancelEdit: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
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
