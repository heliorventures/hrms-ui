import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
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

async function fileToBase64(file: File): Promise<{ b64: string; name: string; mime: string | null }> {
  const b64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result;
      if (typeof s !== 'string') reject(new Error('read failed'));
      else {
        const i = s.indexOf(',');
        resolve(i >= 0 ? s.slice(i + 1) : s);
      }
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  return { b64, name: file.name, mime: file.type || null };
}

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
    const r = await client.request<ConsoleData>(AdminNotificationsConsoleDocument, {});
    return r;
  }, [client]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) setData(r);
      } catch (e) {
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const employeesWithUser = useMemo(
    () => (data?.employees ?? []).filter((e) => e.userId),
    [data]
  );

  const startEdit = (id: string) => {
    const a = data?.adminAnnouncements.find((x) => x.id === id);
    if (!a) return;
    setEditId(id);
    setAnnTitle(a.title);
    setAnnBody(a.body ?? '');
    setAnnDept(a.targetDepartmentId ?? '');
    setAnnLoc(a.targetLocationId ?? '');
    setAnnRole('');
    setAnnPublish(a.publishAt ? String(a.publishAt).slice(0, 16) : '');
    setAnnExpire(a.expiresAt ? String(a.expiresAt).slice(0, 16) : '');
    setEmployeePost(a.postSource === 'employee_post');
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

  const publishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let imageFileName: string | null = null;
      let imageMimeType: string | null = null;
      let imageContentBase64: string | null = null;
      if (annImage) {
        const u = await fileToBase64(annImage);
        imageFileName = u.name;
        imageMimeType = u.mime;
        imageContentBase64 = u.b64;
      }
      let documentFileName: string | null = null;
      let documentMimeType: string | null = null;
      let documentContentBase64: string | null = null;
      if (annDoc) {
        const u = await fileToBase64(annDoc);
        documentFileName = u.name;
        documentMimeType = u.mime;
        documentContentBase64 = u.b64;
      }

      const publishAt = annPublish ? new Date(annPublish).toISOString() : null;
      const expiresAt = annExpire ? new Date(annExpire).toISOString() : null;

        const ex = data?.adminAnnouncements.find((x) => x.id === editId);
        if (editId) {
          await client.request(UpdateAnnouncementDocument, {
            input: {
              id: editId,
              title: annTitle.trim(),
              body: annBody.trim() === '' ? null : annBody.trim(),
              targetDepartmentId: annDept.trim() === '' ? null : annDept.trim(),
              targetLocationId: annLoc.trim() === '' ? null : annLoc.trim(),
              clearTargetDepartment: Boolean(ex?.targetDepartmentId) && annDept.trim() === '',
              clearTargetLocation: Boolean(ex?.targetLocationId) && annLoc.trim() === '',
              targetRoleCode: annRole.trim() === '' ? null : annRole.trim(),
              clearRoleAudience:
                Boolean(ex?.targetAudience?.startsWith('ROLE:')) && annRole.trim() === '',
              publishAt,
              expiresAt,
              clearPublishAt: !annPublish,
              clearExpiresAt: !annExpire,
              imageFileName,
              imageMimeType,
              imageContentBase64,
              documentFileName,
              documentMimeType,
              documentContentBase64,
              clearImage: false,
              clearDocument: false,
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
            imageFileName,
            imageMimeType,
            imageContentBase64,
            documentFileName,
            documentMimeType,
            documentContentBase64,
          },
        });
      }
      cancelEdit();
      setData(await load());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
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
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const sendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(err instanceof Error ? err.message : 'Send failed');
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
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification admin</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Manage announcements (including audience and schedule) and send private in-app notifications to selected users.
      </p>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title={editId ? 'Edit announcement' : 'New announcement (HR)'}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <form onSubmit={(e) => void publishAnnouncement(e)} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {editId && (
                <Button type="button" variant="outline" size="sm" onClick={cancelEdit} disabled={busy}>
                  Cancel edit
                </Button>
              )}
            </div>
            <Input label="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required fullWidth />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
              <textarea
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {!editId && (
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={employeePost}
                  onChange={(e) => setEmployeePost(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Employee-style post (unchecked = company announcement)
              </label>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Department</label>
              <select
                value={annDept}
                onChange={(e) => setAnnDept(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">— All departments —</option>
                {(data?.departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Location id (optional UUID)"
              value={annLoc}
              onChange={(e) => setAnnLoc(e.target.value)}
              fullWidth
            />
            <Input
              label="Target role code (e.g. HR_ADMIN → audience ROLE:HR_ADMIN)"
              value={annRole}
              onChange={(e) => setAnnRole(e.target.value)}
              fullWidth
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Publish at</label>
                <input
                  type="datetime-local"
                  value={annPublish}
                  onChange={(e) => setAnnPublish(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Expires at</label>
                <input
                  type="datetime-local"
                  value={annExpire}
                  onChange={(e) => setAnnExpire(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <input type="file" accept="image/*" onChange={(e) => setAnnImage(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Document</label>
              <input type="file" onChange={(e) => setAnnDoc(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" />
            </div>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Saving…' : editId ? 'Update announcement' : 'Create announcement'}
            </Button>
          </form>
        )}
      </Card>

      <Card title="Direct notifications to users">
        <form onSubmit={(e) => void sendDirect(e)} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Recipients (linked user)</label>
            <select
              multiple
              size={6}
              value={selUsers}
              onChange={(e) => {
                const o = [...e.target.selectedOptions].map((x) => x.value);
                setSelUsers(o);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {employeesWithUser.map((em) => (
                <option key={em.id} value={em.userId!}>
                  {em.fullName} {em.linkedUserEmail ? `(${em.linkedUserEmail})` : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
          </div>
          <Input label="Kind" value={dnKind} onChange={(e) => setDnKind(e.target.value)} fullWidth />
          <Input label="Title" value={dnTitle} onChange={(e) => setDnTitle(e.target.value)} fullWidth />
          <Input label="Message" value={dnMessage} onChange={(e) => setDnMessage(e.target.value)} fullWidth />
          <Input label="Action URL" value={dnUrl} onChange={(e) => setDnUrl(e.target.value)} fullWidth />
          <Button type="submit" variant="primary" disabled={busy}>
            Send
          </Button>
        </form>
      </Card>

      <Card title="Recent announcements">
        <div className="space-y-2">
          {(data?.adminAnnouncements ?? []).map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-xs text-gray-500">
                  {a.postSource} · {a.publishAt ? new Date(a.publishAt).toLocaleString() : '—'}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.targetDepartmentId && <Badge size="sm">Dept</Badge>}
                  {a.targetLocationId && <Badge size="sm">Loc</Badge>}
                  {a.targetAudience?.startsWith('ROLE:') && <Badge size="sm">Role</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit(a.id)} disabled={busy}>
                  Edit
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void removeAnnouncement(a.id)} disabled={busy}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent in-app notifications (tenant)">
        <div className="max-h-96 space-y-2 overflow-y-auto text-sm">
          {(data?.adminNotifications ?? []).map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between gap-2 rounded border border-gray-100 p-2 dark:border-gray-800"
            >
              <div className="min-w-0">
                <p className="font-medium">{n.title ?? '—'}</p>
                <p className="text-xs text-gray-500">
                  user {n.userId.slice(0, 8)}… · {n.kind ?? '—'}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => void removeInAppRow(n.id)} disabled={busy}>
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
