import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { canManageNotifications } from '../../auth/navAccess';
import {
  CreateAnnouncementDocument,
  OrgDepartmentsDocument,
  type OrgDepartmentsQuery,
} from '../../api/graphql/graphql';

async function fileToBase64Content(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r !== 'string') {
        reject(new Error('Could not read file'));
        return;
      }
      const comma = r.indexOf(',');
      resolve(comma >= 0 ? r.slice(comma + 1) : r);
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateAnnouncementModal = ({ isOpen, onClose, onCreated }: CreateAnnouncementModalProps) => {
  const client = useGraphClient('client');
  const { can, clientSession } = useAuth();
  const navOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const hrCompose = canManageNotifications(navOpts);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [employeePost, setEmployeePost] = useState(true);
  const [annDept, setAnnDept] = useState('');
  const [annLoc, setAnnLoc] = useState('');
  const [annRole, setAnnRole] = useState('');
  const [annPublish, setAnnPublish] = useState('');
  const [annExpire, setAnnExpire] = useState('');
  const [departments, setDepartments] = useState<OrgDepartmentsQuery['departments']>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDepartments = useCallback(async () => {
    const r = await client.request<OrgDepartmentsQuery>(OrgDepartmentsDocument, { limit: 100 });
    return r.departments ?? [];
  }, [client]);

  useEffect(() => {
    if (!isOpen || !hrCompose) return;
    let cancelled = false;
    void (async () => {
      try {
        const d = await loadDepartments();
        if (!cancelled) setDepartments(d);
      } catch {
        if (!cancelled) setDepartments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, hrCompose, loadDepartments]);

  const reset = () => {
    setTitle('');
    setBody('');
    setTargetAudience('');
    setEmployeePost(true);
    setAnnDept('');
    setAnnLoc('');
    setAnnRole('');
    setAnnPublish('');
    setAnnExpire('');
    setImageFile(null);
    setDocumentFile(null);
    setSubmitError(null);
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      let imageContentBase64: string | null = null;
      let imageFileName: string | null = null;
      let imageMimeType: string | null = null;
      if (imageFile) {
        imageContentBase64 = await fileToBase64Content(imageFile);
        imageFileName = imageFile.name;
        imageMimeType = imageFile.type || null;
      }

      let documentContentBase64: string | null = null;
      let documentFileName: string | null = null;
      let documentMimeType: string | null = null;
      if (documentFile) {
        documentContentBase64 = await fileToBase64Content(documentFile);
        documentFileName = documentFile.name;
        documentMimeType = documentFile.type || null;
      }

      const roleTrim = annRole.trim();
      const publishAt = hrCompose && annPublish ? new Date(annPublish).toISOString() : null;
      const expiresAt = hrCompose && annExpire ? new Date(annExpire).toISOString() : null;

      await client.request(CreateAnnouncementDocument, {
        input: {
          title: title.trim(),
          body: body.trim() === '' ? null : body.trim(),
          targetAudience:
            roleTrim !== '' ? null : targetAudience.trim() === '' ? null : targetAudience.trim(),
          targetDepartmentId: hrCompose && annDept.trim() !== '' ? annDept.trim() : null,
          targetLocationId: hrCompose && annLoc.trim() !== '' ? annLoc.trim() : null,
          targetRoleCode: hrCompose && roleTrim !== '' ? roleTrim : null,
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
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={hrCompose ? 'New announcement (HR)' : 'New announcement'}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

        <Input
          label="Title"
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {hrCompose ? (
          <>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={employeePost}
                onChange={(e) => setEmployeePost(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Employee / team post (uncheck for company-wide HR style)
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                value={annDept}
                onChange={(e) => setAnnDept(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">— All departments —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Location id (optional UUID)"
              type="text"
              value={annLoc}
              onChange={(e) => setAnnLoc(e.target.value)}
              fullWidth
            />
            <Input
              label="Target role code (optional, e.g. HR_ADMIN)"
              type="text"
              value={annRole}
              onChange={(e) => setAnnRole(e.target.value)}
              fullWidth
            />
            {annRole.trim() === '' ? (
              <Input
                label="Target audience (optional)"
                placeholder="e.g. ALL, Engineering"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                fullWidth
              />
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Role-based targeting is set; free-form audience is ignored until role code is cleared.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Publish at
                </label>
                <input
                  type="datetime-local"
                  value={annPublish}
                  onChange={(e) => setAnnPublish(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expires at
                </label>
                <input
                  type="datetime-local"
                  value={annExpire}
                  onChange={(e) => setAnnExpire(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <Input
              label="Target audience (optional)"
              placeholder="e.g. ALL, Engineering"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              fullWidth
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={employeePost}
                onChange={(e) => setEmployeePost(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Employee / team post (uncheck for company-wide HR style)
            </label>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:text-gray-400 dark:file:bg-primary-900/40 dark:file:text-primary-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document
          </label>
          <input
            type="file"
            onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:text-gray-400 dark:file:bg-primary-900/40 dark:file:text-primary-200"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAnnouncementModal;
