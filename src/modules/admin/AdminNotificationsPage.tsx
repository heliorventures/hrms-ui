import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import { fileToBase64 } from '../../utils/fileEncoding';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import AnnouncementEditorForm from './components/AnnouncementEditorForm';
import DirectNotificationComposer from './components/DirectNotificationComposer';
import {
  AdminNotificationsConsoleDocument,
  CreateAnnouncementDocument,
  CreateDirectNotificationsDocument,
  DeleteAnnouncementDocument,
  DeleteNotificationAdminDocument,
  UpdateAnnouncementDocument,
  type AdminNotificationsConsoleQuery,
} from '../../api/graphql/graphql';

type ConsoleData = AdminNotificationsConsoleQuery;

const AdminNotificationsPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    return client.request<ConsoleData>(AdminNotificationsConsoleDocument, {});
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
    setBusy(true);
    setError(null);
    try {
      const attachments = await readAnnouncementFiles();
      const publishAt = annPublish ? new Date(annPublish).toISOString() : null;
      const expiresAt = annExpire ? new Date(annExpire).toISOString() : null;

      if (editId) {
        const existing = data?.adminAnnouncements.find((item) => item.id === editId);
        await client.request(UpdateAnnouncementDocument, {
          input: {
            id: editId,
            title: annTitle.trim(),
            body: annBody.trim() === '' ? null : annBody.trim(),
            targetDepartmentId: annDept.trim() === '' ? null : annDept.trim(),
            targetLocationId: annLoc.trim() === '' ? null : annLoc.trim(),
            clearTargetDepartment: Boolean(existing?.targetDepartmentId) && annDept.trim() === '',
            clearTargetLocation: Boolean(existing?.targetLocationId) && annLoc.trim() === '',
            targetRoleCode: annRole.trim() === '' ? null : annRole.trim(),
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
        await client.request(CreateAnnouncementDocument, {
          input: {
            title: annTitle.trim(),
            body: annBody.trim() === '' ? null : annBody.trim(),
            targetDepartmentId: annDept.trim() === '' ? null : annDept.trim(),
            targetLocationId: annLoc.trim() === '' ? null : annLoc.trim(),
            targetRoleCode: annRole.trim() === '' ? null : annRole.trim(),
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
    if (selUsers.length === 0) {
      setError('Select at least one user');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await client.request(CreateDirectNotificationsDocument, {
        input: {
          userIds: selUsers,
          title: dnTitle.trim() === '' ? null : dnTitle.trim(),
          message: dnMessage.trim() === '' ? null : dnMessage.trim(),
          kind: dnKind.trim() === '' ? null : dnKind.trim(),
          actionUrl: dnUrl.trim() === '' ? null : dnUrl.trim(),
        },
      });
      setDnTitle('');
      setDnMessage('');
      setDnUrl('');
      setSelUsers([]);
      setData(await load());
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeInAppRow = async (id: string) => {
    if (!window.confirm('Delete this notification row?')) return;
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification admin</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Manage announcements and send private in-app notifications to selected users.
      </p>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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

      <Card title="Direct notifications to users">
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

      <Card title="Recent announcements">
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

      <Card title="Recent in-app notifications (tenant)">
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
