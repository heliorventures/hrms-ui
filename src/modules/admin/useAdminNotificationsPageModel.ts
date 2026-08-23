import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import {
  CreateDirectNotificationsDocument,
  DeleteAnnouncementDocument,
  DeleteNotificationAdminDocument,
} from '../../api/graphql/graphql';
import { useDialogs, type ConfirmOptions } from '../../contexts/DialogContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { directNotificationActionUrl } from '../../utils/actionUrl';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { AdminNotificationsConsoleSafeDocument } from '../notifications/notificationQueries';

import {
  saveAnnouncement,
  validateAnnouncementEditor,
} from './adminNotificationsAnnouncementActions';
import type {
  AdminAnnouncementEditorModel,
  AdminAnnouncementRow,
  AdminDirectNotificationModel,
  AdminNotificationEmployeeRow,
  AdminNotificationsConsoleData,
  AnnouncementEditorField,
  AnnouncementEditorState,
  DirectNotificationField,
  DirectNotificationState,
} from './adminNotificationsPageTypes';
import { roleCodeFromTargetAudience } from './announcementUpdateInput';

const EMPTY_ANNOUNCEMENT: AnnouncementEditorState = {
  title: '',
  body: '',
  departmentId: '',
  locationId: '',
  roleCode: '',
  clearRoleAudience: false,
  publishAt: '',
  expiresAt: '',
  employeePost: false,
  imageFile: null,
  documentFile: null,
  editId: null,
};

const EMPTY_DIRECT_NOTIFICATION: DirectNotificationState = {
  selectedUserIds: [],
  title: '',
  message: '',
  kind: 'hr_broadcast',
  url: '',
};

interface FeedbackModel {
  busy: boolean;
  error: string | null;
  success: string | null;
  setBusy: (busy: boolean) => void;
  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
}

const useFeedback = (): FeedbackModel => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  return { busy, error, success, setBusy, setError, setSuccess };
};

interface ConsoleModel {
  data: AdminNotificationsConsoleData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const useNotificationsConsole = (
  client: GraphQLClient,
  setError: FeedbackModel['setError']
): ConsoleModel => {
  const [data, setData] = useState<AdminNotificationsConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const load = useCallback(
    () => client.request<AdminNotificationsConsoleData>(AdminNotificationsConsoleSafeDocument, {}),
    [client]
  );
  const refresh = useCallback(async () => setData(await load()), [load]);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);
    void load()
      .then((response) => {
        if (requestIdRef.current === requestId) setData(response);
      })
      .catch((error: unknown) => {
        if (requestIdRef.current === requestId) setError(graphQlUserMessage(error));
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false);
      });
    return () => {
      requestIdRef.current += 1;
    };
  }, [load, setError]);
  return { data, loading, refresh };
};

const announcementStateFor = (announcement: AdminAnnouncementRow): AnnouncementEditorState => ({
  ...EMPTY_ANNOUNCEMENT,
  editId: announcement.id,
  title: announcement.title,
  body: announcement.body ?? '',
  departmentId: announcement.targetDepartmentId ?? '',
  locationId: announcement.targetLocationId ?? '',
  roleCode: roleCodeFromTargetAudience(announcement.targetAudience),
  publishAt: announcement.publishAt ? String(announcement.publishAt).slice(0, 16) : '',
  expiresAt: announcement.expiresAt ? String(announcement.expiresAt).slice(0, 16) : '',
  employeePost: announcement.postSource === 'employee_post',
});

const useAnnouncementEditor = ({
  client,
  confirm,
  consoleModel,
  feedback,
}: {
  client: GraphQLClient;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  consoleModel: ConsoleModel;
  feedback: FeedbackModel;
}): AdminAnnouncementEditorModel => {
  const [state, setState] = useState<AnnouncementEditorState>(EMPTY_ANNOUNCEMENT);
  const setField = useCallback(
    <Key extends AnnouncementEditorField>(field: Key, value: AnnouncementEditorState[Key]) =>
      setState((current) => ({ ...current, [field]: value })),
    []
  );
  const cancelEdit = useCallback(() => setState(EMPTY_ANNOUNCEMENT), []);
  const startEdit = useCallback(
    (id: string) => {
      const announcement = consoleModel.data?.adminAnnouncements.find((item) => item.id === id);
      if (announcement) setState(announcementStateFor(announcement));
    },
    [consoleModel.data]
  );
  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitAnnouncement({ client, confirm, consoleModel, feedback, state, cancelEdit });
    },
    [cancelEdit, client, confirm, consoleModel, feedback, state]
  );
  const existingRoleCode = roleCodeFromTargetAudience(
    consoleModel.data?.adminAnnouncements.find((item) => item.id === state.editId)?.targetAudience
  );
  return { state, existingRoleCode, setField, startEdit, cancelEdit, submit };
};

const submitAnnouncement = async ({
  client,
  confirm,
  consoleModel,
  feedback,
  state,
  cancelEdit,
}: {
  client: GraphQLClient;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  consoleModel: ConsoleModel;
  feedback: FeedbackModel;
  state: AnnouncementEditorState;
  cancelEdit: () => void;
}): Promise<void> => {
  feedback.setError(null);
  feedback.setSuccess(null);
  const validation = validateAnnouncementEditor(state);
  if (!validation.valid) {
    feedback.setError(validation.message);
    return;
  }
  const existingAnnouncement = state.editId
    ? consoleModel.data?.adminAnnouncements.find((item) => item.id === state.editId)
    : undefined;
  if (state.editId && !existingAnnouncement) {
    cancelEdit();
    feedback.setError(
      'This announcement is no longer available. Review the current announcements and start the edit again.'
    );
    return;
  }
  feedback.setBusy(true);
  try {
    const saved = await saveAnnouncement({
      client,
      confirm,
      state,
      values: validation.values,
      existingAnnouncement,
    });
    if (!saved) return;
    cancelEdit();
    await consoleModel.refresh();
  } catch (error) {
    feedback.setError(graphQlUserMessage(error));
  } finally {
    feedback.setBusy(false);
  }
};

interface CreateDirectNotificationsResult {
  createDirectNotifications: number;
}

const useDirectNotifications = (
  client: GraphQLClient,
  consoleModel: ConsoleModel,
  feedback: FeedbackModel
): AdminDirectNotificationModel => {
  const [state, setState] = useState<DirectNotificationState>(EMPTY_DIRECT_NOTIFICATION);
  const setField = useCallback(
    <Key extends DirectNotificationField>(field: Key, value: DirectNotificationState[Key]) =>
      setState((current) => ({ ...current, [field]: value })),
    []
  );
  const setSelectedUserIds = useCallback(
    (selectedUserIds: string[]) => setState((current) => ({ ...current, selectedUserIds })),
    []
  );
  const submit = useCallback(
    (event: FormEvent<Element>) => {
      event.preventDefault();
      void sendDirectNotifications(client, consoleModel, feedback, state, setState);
    },
    [client, consoleModel, feedback, state]
  );
  return { state, setField, setSelectedUserIds, submit };
};

const sendDirectNotifications = async (
  client: GraphQLClient,
  consoleModel: ConsoleModel,
  feedback: FeedbackModel,
  state: DirectNotificationState,
  reset: (state: DirectNotificationState) => void
): Promise<void> => {
  feedback.setError(null);
  feedback.setSuccess(null);
  if (state.selectedUserIds.length === 0) {
    feedback.setError('Select at least one user');
    return;
  }
  if (!state.title.trim() && !state.message.trim()) {
    feedback.setError('Direct notification requires a title or message.');
    return;
  }
  feedback.setBusy(true);
  try {
    const response = await client.request<CreateDirectNotificationsResult>(
      CreateDirectNotificationsDocument,
      {
        input: {
          userIds: state.selectedUserIds,
          title: state.title.trim() || null,
          message: state.message.trim() || null,
          kind: state.kind.trim() || null,
          actionUrl: directNotificationActionUrl(state.url),
        },
      }
    );
    reset({ ...EMPTY_DIRECT_NOTIFICATION, kind: state.kind });
    feedback.setSuccess(`Created ${response.createDirectNotifications} direct notification(s).`);
    await refreshAfterDirectSend(consoleModel, feedback);
  } catch (error) {
    feedback.setSuccess(null);
    feedback.setError(graphQlUserMessage(error));
  } finally {
    feedback.setBusy(false);
  }
};

const refreshAfterDirectSend = async (
  consoleModel: ConsoleModel,
  feedback: FeedbackModel
): Promise<void> => {
  try {
    await consoleModel.refresh();
  } catch (error) {
    feedback.setError(
      `Direct notification was sent, but the admin list could not refresh: ${graphQlUserMessage(error)}`
    );
  }
};

const useDeleteActions = (
  client: GraphQLClient,
  confirm: (options: ConfirmOptions) => Promise<boolean>,
  consoleModel: ConsoleModel,
  feedback: FeedbackModel
) => {
  const removeAnnouncement = useCallback(
    async (id: string) => {
      const announcement = consoleModel.data?.adminAnnouncements.find((row) => row.id === id);
      const approved = await confirm({
        title: 'Delete announcement',
        message: `This will remove "${announcement?.title ?? 'this announcement'}" and stop it from appearing to employees.`,
        confirmLabel: 'Delete announcement',
        variant: 'danger',
      });
      if (!approved) return;
      await runDelete(
        () => client.request(DeleteAnnouncementDocument, { id }),
        consoleModel,
        feedback
      );
    },
    [client, confirm, consoleModel, feedback]
  );
  const removeInAppNotification = useCallback(
    async (id: string) => {
      const notification = consoleModel.data?.adminNotifications.find((row) => row.id === id);
      const approved = await confirm({
        title: 'Delete notification',
        message: `This removes the in-app notification "${notification?.title ?? 'selected item'}" from history and delivery lists.`,
        confirmLabel: 'Delete notification',
        variant: 'danger',
      });
      if (!approved) return;
      await runDelete(
        () => client.request(DeleteNotificationAdminDocument, { id }),
        consoleModel,
        feedback
      );
    },
    [client, confirm, consoleModel, feedback]
  );
  return { removeAnnouncement, removeInAppNotification };
};

const runDelete = async (
  deleteRequest: () => Promise<unknown>,
  consoleModel: ConsoleModel,
  feedback: FeedbackModel
): Promise<void> => {
  feedback.setSuccess(null);
  feedback.setBusy(true);
  try {
    await deleteRequest();
    await consoleModel.refresh();
  } catch (error) {
    feedback.setError(graphQlUserMessage(error));
  } finally {
    feedback.setBusy(false);
  }
};

export interface AdminNotificationsPageModel {
  data: AdminNotificationsConsoleData | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  success: string | null;
  employeesWithUser: AdminNotificationEmployeeRow[];
  announcement: AdminAnnouncementEditorModel;
  directNotification: AdminDirectNotificationModel;
  removeAnnouncement: (id: string) => Promise<void>;
  removeInAppNotification: (id: string) => Promise<void>;
}

export const useAdminNotificationsPageModel = (): AdminNotificationsPageModel => {
  const client = useGraphClient('client');
  const { confirm } = useDialogs();
  const feedback = useFeedback();
  const consoleModel = useNotificationsConsole(client, feedback.setError);
  const announcement = useAnnouncementEditor({ client, confirm, consoleModel, feedback });
  const directNotification = useDirectNotifications(client, consoleModel, feedback);
  const deleteActions = useDeleteActions(client, confirm, consoleModel, feedback);
  const employeesWithUser = useMemo(
    () => consoleModel.data?.employees.filter((employee) => Boolean(employee.userId)) ?? [],
    [consoleModel.data]
  );
  return {
    data: consoleModel.data,
    loading: consoleModel.loading,
    busy: feedback.busy,
    error: feedback.error,
    success: feedback.success,
    employeesWithUser,
    announcement,
    directNotification,
    ...deleteActions,
  };
};
