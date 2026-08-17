import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import { directNotificationActionUrl } from '../../utils/actionUrl';
import { fileToBase64 } from '../../utils/fileEncoding';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import AnnouncementEditorForm from './components/AnnouncementEditorForm';
import DirectNotificationComposer from './components/DirectNotificationComposer';
import {
  CreateDirectNotificationsDocument,
  DeleteAnnouncementDocument,
  DeleteNotificationAdminDocument,
  UpdateAnnouncementDocument,
} from '../../api/graphql/graphql';
import {
  AdminNotificationsConsoleSafeDocument,
  CreateAnnouncementSafeDocument,
} from '../notifications/notificationQueries';

interface AdminAnnouncementRow {
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

interface AdminNotificationRow {
  id: string;
  userId: string;
  kind?: string | null;
  title?: string | null;
  message?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface AdminNotificationEmployeeRow {
  id: string;
  fullName: string;
  userId?: string | null;
  linkedUserEmail?: string | null;
  linkedUserUsername?: string | null;
}

interface AdminNotificationDepartmentRow {
  id: string;
  name: string;
}

interface ConsoleData {
  adminAnnouncements: AdminAnnouncementRow[];
  adminNotifications: AdminNotificationRow[];
  employees: AdminNotificationEmployeeRow[];
  departments: AdminNotificationDepartmentRow[];
}

interface CreateDirectNotificationsResult {
  createDirectNotifications: number;
}

const MAX_ANNOUNCEMENT_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ANNOUNCEMENT_DOCUMENT_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const validateFile = (
  file: File | null,
  allowedTypes: Set<string>,
  maxBytes: number,
  label: string
) => {
  if (!file) return null;
  if (file.size > maxBytes) {
    return `${label} must be ${Math.floor(maxBytes / (1024 * 1024))} MB or smaller.`;
  }
  if (!allowedTypes.has(file.type)) {
    return `${label} file type is not allowed.`;
  }
  return null;
};

const parseOptionalDateTime = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const AdminNotificationsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annDept, setAnnDept] = useState('');
  const [annLoc, setAnnLoc] = useState('');
  const [annRole, setAnnRole] = useState('');
  const [annPublish, setAnnPublish] = useState('');
  const [annExpire, setAnnExpire] = useState('');
  const [employeePost, setEmployeePost] = useState(false);
  const [annImage, setAnnImage] = useState<File | null>(null);
  const [annDoc, setAnnDoc] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [selUsers, setSelUsers] = useState<string[]>([]);
  const [dnTitle, setDnTitle] = useState('');
  const [dnMessage, setDnMessage] = useState('');
  const [dnKind, setDnKind] = useState('hr_broadcast');
  const [dnUrl, setDnUrl] = useState('');

  const load = useCallback(async () => {
    return client.request<ConsoleData>(AdminNotificationsConsoleSafeDocument, {});
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await load();
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const employeesWithUser = useMemo(
    () => (data?.employees ?? []).filter((employee) => employee.userId),
    [data]
  );

  const startEdit = (id: string) => {
    const announcement = data?.adminAnnouncements.find((item) => item.id === id);
    if (!announcement) return;
    setEditId(id);
    setAnnTitle(announcement.title);
    setAnnBody(announcement.body ?? '');
    setAnnDept(announcement.targetDepartmentId ?? '');
    setAnnLoc(announcement.targetLocationId ?? '');
    setAnnRole('');
    setAnnPublish(announcement.publishAt ? String(announcement.publishAt).slice(0, 16) : '');
    setAnnExpire(announcement.expiresAt ? String(announcement.expiresAt).slice(0, 16) : '');
    setEmployeePost(announcement.postSource === 'employee_post');
  };

  const cancelEdit = () => {
    setEditId(null);
    setAnnTitle('');
    setAnnBody('');
    setAnnDept('');
    setAnnLoc('');
    setAnnRole('');
    setAnnPublish('');
    setAnnExpire('');
    setEmployeePost(false);
    setAnnImage(null);
    setAnnDoc(null);
  };

  const readAnnouncementFiles = async () => {
    const image = annImage ? await fileToBase64(annImage) : null;
    const document = annDoc ? await fileToBase64(annDoc) : null;
    return {
      imageFileName: image?.name ?? null,
      imageMimeType: image?.mime ?? null,
      imageContentBase64: image?.b64 ?? null,
      documentFileName: document?.name ?? null,
      documentMimeType: document?.mime ?? null,
      documentContentBase64: document?.b64 ?? null,
    };
  };

  const publishAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const title = annTitle.trim();
    if (!title) {
      setError('Announcement title is required.');
      return;
    }
    const publishAt = parseOptionalDateTime(annPublish);
    const expiresAt = parseOptionalDateTime(annExpire);
    if (publishAt === undefined || expiresAt === undefined) {
      setError('Publish and expiry dates must be valid date/time values.');
      return;
    }
    if (publishAt && expiresAt && expiresAt <= publishAt) {
      setError('Expiry date must be after publish date.');
      return;
    }
    const imageError = validateFile(
      annImage,
      ALLOWED_IMAGE_TYPES,
      MAX_ANNOUNCEMENT_IMAGE_BYTES,
      'Announcement image'
    );
    if (imageError) {
      setError(imageError);
      return;
    }
    const documentError = validateFile(
      annDoc,
      ALLOWED_DOCUMENT_TYPES,
      MAX_ANNOUNCEMENT_DOCUMENT_BYTES,
      'Announcement document'
    );
    if (documentError) {
      setError(documentError);
      return;
    }
    setBusy(true);
    try {
      const attachments = await readAnnouncementFiles();

      if (editId) {
        const existing = data?.adminAnnouncements.find((item) => item.id === editId);
        await client.request(UpdateAnnouncementDocument, {
          input: {
            id: editId,
            title,
            body: annBody.trim() === '' ? null : annBody.trim(),
            targetDepartmentId: annDept.trim() === '' ? null : annDept.trim(),
            targetLocationId: annLoc.trim() === '' ? null : annLoc.trim(),
            clearTargetDepartment: Boolean(existing?.targetDepartmentId) && annDept.trim() === '',
            clearTargetLocation: Boolean(existing?.targetLocationId) && annLoc.trim() === '',
            targetRoleCode: annRole.trim() === '' ? null : annRole.trim().toUpperCase(),
            clearRoleAudience:
              Boolean(existing?.targetAudience?.startsWith('ROLE:')) && annRole.trim() === '',
            publishAt,
            expiresAt,
            clearPublishAt: !annPublish,
            clearExpiresAt: !annExpire,
            clearImage: false,
            clearDocument: false,
            ...attachments,
          },
        });
      } else {
        await client.request(CreateAnnouncementSafeDocument, {
          input: {
            title,
            body: annBody.trim() === '' ? null : annBody.trim(),
            targetDepartmentId: annDept.trim() === '' ? null : annDept.trim(),
            targetLocationId: annLoc.trim() === '' ? null : annLoc.trim(),
            targetRoleCode: annRole.trim() === '' ? null : annRole.trim().toUpperCase(),
            publishAt,
            expiresAt,
            employeePost,
            ...attachments,
          },
        });
      }
      cancelEdit();
      setData(await load());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    setSuccess(null);
    setBusy(true);
    try {
      await client.request(DeleteAnnouncementDocument, { id });
      setData(await load());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const sendDirect = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (selUsers.length === 0) {
      setError('Select at least one user');
      return;
    }
    if (!dnTitle.trim() && !dnMessage.trim()) {
      setError('Direct notification requires a title or message.');
      return;
    }
    setBusy(true);
    try {
      const response = await client.request<CreateDirectNotificationsResult>(
        CreateDirectNotificationsDocument,
        {
          input: {
            userIds: selUsers,
            title: dnTitle.trim() === '' ? null : dnTitle.trim(),
            message: dnMessage.trim() === '' ? null : dnMessage.trim(),
            kind: dnKind.trim() === '' ? null : dnKind.trim(),
            actionUrl: directNotificationActionUrl(dnUrl),
          },
        }
      );
      setDnTitle('');
      setDnMessage('');
      setDnUrl('');
      setSelUsers([]);
      setSuccess(`Created ${response.createDirectNotifications} direct notification(s).`);
      try {
        setData(await load());
      } catch (reloadErr) {
        setError(
          `Direct notification was sent, but the admin list could not refresh: ${graphQlUserMessage(reloadErr)}`
        );
      }
    } catch (err) {
      setSuccess(null);
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeInAppRow = async (id: string) => {
    if (!window.confirm('Delete this notification row?')) return;
    setSuccess(null);
    setBusy(true);
    try {
      await client.request(DeleteNotificationAdminDocument, { id });
      setData(await load());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Admin</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Manage announcements and send private in-app notifications to selected users.
      </p>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {success && (
        <Card>
          <p className="text-sm text-green-700 dark:text-green-300" role="status" aria-live="polite">
            {success}
          </p>
        </Card>
      )}

      <Card title={editId ? 'Edit announcement' : 'New announcement (HR)'}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <AnnouncementEditorForm
            body={annBody}
            busy={busy}
            departmentId={annDept}
            departments={data?.departments ?? []}
            documentFile={annDoc}
            employeePost={employeePost}
            expiresAt={annExpire}
            imageFile={annImage}
            isEditing={Boolean(editId)}
            locationId={annLoc}
            publishAt={annPublish}
            roleCode={annRole}
            title={annTitle}
            onBodyChange={setAnnBody}
            onCancelEdit={cancelEdit}
            onDepartmentChange={setAnnDept}
            onDocumentChange={setAnnDoc}
            onEmployeePostChange={setEmployeePost}
            onExpiresAtChange={setAnnExpire}
            onImageChange={setAnnImage}
            onLocationChange={setAnnLoc}
            onPublishAtChange={setAnnPublish}
            onRoleCodeChange={setAnnRole}
            onSubmit={(submitEvent) => void publishAnnouncement(submitEvent)}
            onTitleChange={setAnnTitle}
          />
        )}
      </Card>

      <Card title="Direct Notifications To Users">
        <DirectNotificationComposer
          busy={busy}
          employees={employeesWithUser}
          kind={dnKind}
          message={dnMessage}
          selectedUserIds={selUsers}
          title={dnTitle}
          url={dnUrl}
          onKindChange={setDnKind}
          onMessageChange={setDnMessage}
          onSelectedUserIdsChange={setSelUsers}
          onSubmit={(submitEvent) => void sendDirect(submitEvent)}
          onTitleChange={setDnTitle}
          onUrlChange={setDnUrl}
        />
      </Card>

      <Card title="Recent Announcements">
        <div className="space-y-2">
          {(data?.adminAnnouncements ?? []).map((announcement) => (
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
                  {announcement.targetDepartmentId && <Badge size="sm">Dept</Badge>}
                  {announcement.targetLocationId && <Badge size="sm">Loc</Badge>}
                  {announcement.targetAudience?.startsWith('ROLE:') && <Badge size="sm">Role</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit(announcement.id)} disabled={busy}>
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void removeAnnouncement(announcement.id)}
                  disabled={busy}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent In-App Notifications (Tenant)">
        <div className="max-h-96 space-y-2 overflow-y-auto text-sm">
          {(data?.adminNotifications ?? []).map((notification) => (
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
                onClick={() => void removeInAppRow(notification.id)}
                disabled={busy}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminNotificationsPage;
