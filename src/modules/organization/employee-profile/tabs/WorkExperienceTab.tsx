import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { Briefcase, Paperclip, Plus, Trash2 } from 'lucide-react';

import type { TenantDocumentTypeOption, VerificationStatus, WorkExperienceEntry } from '../types';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Modal from '../../../../components/common/Modal';
import { EmptySection } from '../components/SectionStates';
import { VerificationBadge } from '../components/StatusBadge';
import { UploadModal } from '../components/UploadModal';
import { ConfirmProfileActionModal } from '../components/ConfirmProfileActionModal';
import { formatCompactDate } from '../lib/masking';
import { formatWorkDuration } from '../lib/workDuration';
import {
  DeleteEmployeeWorkExperienceDocument,
  ResolveEmployeeWorkExperienceDocument,
  UploadEmployeeWorkExperienceEvidenceDocument,
  UpsertEmployeeWorkExperienceDocument,
} from '../../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

interface WorkExperienceTabProps {
  employeeId: string;
  client: GraphQLClient;
  initial: WorkExperienceEntry[];
  documentTypes: TenantDocumentTypeOption[];
  canReview?: boolean;
  onChanged?: () => void;
}

const blankForm = () => ({
  company: '',
  roleTitle: '',
  employmentType: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
});

export function WorkExperienceTab({
  employeeId,
  client,
  initial,
  documentTypes,
  canReview = false,
  onChanged,
}: WorkExperienceTabProps) {
  const [entries, setEntries] = useState(initial);
  const [editing, setEditing] = useState<WorkExperienceEntry | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidenceTarget, setEvidenceTarget] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<{ kind: 'delete' | 'reject'; id: string } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => setEntries(initial), [initial]);

  const evidenceTypes = useMemo(
    () =>
      documentTypes.filter((type) =>
        `${type.systemKey ?? ''} ${type.category ?? ''} ${type.name}`
          .toUpperCase()
          .match(/EXPERIENCE|RELIEVING/)
      ),
    [documentTypes]
  );

  const openNew = () => {
    setEditing(null);
    setForm(blankForm());
    setError(null);
    setModal(true);
  };

  const openEdit = (entry: WorkExperienceEntry) => {
    setEditing(entry);
    setForm({
      company: entry.company,
      roleTitle: entry.roleTitle,
      employmentType: entry.employmentType,
      location: entry.location,
      startDate: entry.startDate.slice(0, 10),
      endDate: entry.endDate?.slice(0, 10) ?? '',
      isCurrent: entry.isCurrent,
      description: entry.description,
    });
    setError(null);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await client.request(UpsertEmployeeWorkExperienceDocument, {
        input: {
          id: editing?.id,
          employeeId,
          company: form.company.trim(),
          roleTitle: form.roleTitle.trim(),
          employmentType: form.employmentType.trim() || undefined,
          location: form.location.trim() || undefined,
          startDate: form.startDate,
          endDate: form.isCurrent ? undefined : form.endDate,
          isCurrent: form.isCurrent,
          description: form.description.trim() || undefined,
        },
      });
      const row = result.upsertEmployeeWorkExperience;
      const mapped: WorkExperienceEntry = {
        id: row.id,
        company: row.company,
        roleTitle: row.roleTitle,
        employmentType: row.employmentType ?? '',
        location: row.location ?? '',
        startDate: String(row.startDate),
        endDate: row.endDate == null ? null : String(row.endDate),
        isCurrent: row.isCurrent,
        description: row.description ?? '',
        verificationStatus: row.verificationStatus as VerificationStatus,
        evidenceDocumentIds: [...row.evidenceDocumentIds],
        rejectionReason: row.rejectionReason,
      };
      setEntries((current) => {
        const exists = current.some((entry) => entry.id === mapped.id);
        return exists
          ? current.map((entry) => (entry.id === mapped.id ? mapped : entry))
          : [mapped, ...current];
      });
      onChanged?.();
      setModal(false);
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setActionBusy(true);
    setError(null);
    try {
      await client.request(DeleteEmployeeWorkExperienceDocument, {
        employeeId,
        workExperienceId: id,
      });
      setEntries((current) => current.filter((entry) => entry.id !== id));
      onChanged?.();
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setActionBusy(false);
      setActionTarget(null);
    }
  };

  const uploadEvidence = async (payload: {
    documentTypeId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) => {
    if (!evidenceTarget) return;
    const linked = await client.request(UploadEmployeeWorkExperienceEvidenceDocument, {
      workExperienceId: evidenceTarget,
      input: { employeeId, ...payload },
    });
    setEntries((current) =>
      current.map((entry) =>
        entry.id === evidenceTarget
          ? {
              ...entry,
              verificationStatus: linked.uploadEmployeeWorkExperienceEvidence
                .verificationStatus as VerificationStatus,
              evidenceDocumentIds: [
                ...linked.uploadEmployeeWorkExperienceEvidence.evidenceDocumentIds,
              ],
            }
          : entry
      )
    );
    onChanged?.();
  };

  const review = async (id: string, approved: boolean, rejectionReason?: string) => {
    setActionBusy(true);
    setError(null);
    try {
      const result = await client.request(ResolveEmployeeWorkExperienceDocument, {
        workExperienceId: id,
        approved,
        rejectionReason,
      });
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                verificationStatus: result.resolveEmployeeWorkExperience
                  .verificationStatus as VerificationStatus,
                rejectionReason: result.resolveEmployeeWorkExperience.rejectionReason,
              }
            : entry
        )
      );
      onChanged?.();
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setActionBusy(false);
      setActionTarget(null);
      setActionReason('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="primary" className="gap-1" onClick={openNew}>
          <Plus className="h-4 w-4" aria-hidden /> Add Work Experience
        </Button>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {entries.length === 0 ? (
        <EmptySection
          title="No Work Experience On File"
          description="Add previous employers, roles, dates, responsibilities, and supporting experience letters."
        />
      ) : (
        <ol className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Briefcase className="mt-1 h-5 w-5 text-indigo-500" aria-hidden />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {entry.roleTitle}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {entry.company}
                      {entry.location ? ` · ${entry.location}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatCompactDate(entry.startDate)} —{' '}
                      {entry.endDate ? formatCompactDate(entry.endDate) : 'Present'}
                      {entry.employmentType ? ` · ${entry.employmentType}` : ''}
                      {` · ${formatWorkDuration(entry.startDate, entry.endDate)}`}
                    </p>
                    {entry.description ? (
                      <p className="mt-2 text-sm text-slate-600">{entry.description}</p>
                    ) : null}
                    {entry.rejectionReason ? (
                      <p className="mt-2 text-xs text-red-600">
                        Review note: {entry.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                </div>
                <VerificationBadge status={entry.verificationStatus} />
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {canReview && entry.verificationStatus === 'PENDING' ? (
                  <>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => void review(entry.id, true)}
                    >
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActionTarget({ kind: 'reject', id: entry.id })}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setEvidenceTarget(entry.id)}
                >
                  <Paperclip className="h-3.5 w-3.5" aria-hidden /> Upload evidence
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(entry)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!px-2 text-rose-600"
                  onClick={() => setActionTarget({ kind: 'delete', id: entry.id })}
                >
                  <Trash2 className="h-4 w-4" aria-label="Delete" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Work Experience' : 'Add Work Experience'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Company"
            value={form.company}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Role / Designation"
            value={form.roleTitle}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, roleTitle: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Employment Type"
            value={form.employmentType}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, employmentType: event.target.value }))
            }
            placeholder="Full-time, Contract, Internship"
            fullWidth
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, startDate: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, endDate: event.target.value }))
            }
            disabled={form.isCurrent}
            fullWidth
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 md:col-span-2">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isCurrent: event.target.checked,
                  endDate: event.target.checked ? '' : current.endDate,
                }))
              }
            />{' '}
            I currently work here
          </label>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role description and responsibilities
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void save()}
            disabled={
              saving ||
              !form.company.trim() ||
              !form.roleTitle.trim() ||
              !form.startDate ||
              (!form.isCurrent && !form.endDate)
            }
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      <UploadModal
        isOpen={evidenceTarget !== null}
        onClose={() => setEvidenceTarget(null)}
        title="Upload Experience Letter"
        hideCategory
        documentTypes={evidenceTypes}
        onSubmit={uploadEvidence}
      />
      <ConfirmProfileActionModal
        isOpen={actionTarget !== null}
        title={actionTarget?.kind === 'reject' ? 'Reject work evidence' : 'Delete work experience'}
        description={actionTarget?.kind === 'reject' ? 'The evidence and record will be marked rejected. Provide a clear reason.' : 'This removes the work-experience record from the employee profile.'}
        confirmLabel={actionTarget?.kind === 'reject' ? 'Reject evidence' : 'Delete record'}
        busy={actionBusy}
        reason={actionReason}
        reasonRequired={actionTarget?.kind === 'reject'}
        onReasonChange={setActionReason}
        onClose={() => { setActionTarget(null); setActionReason(''); }}
        onConfirm={() => {
          if (!actionTarget) return;
          if (actionTarget.kind === 'reject') void review(actionTarget.id, false, actionReason.trim());
          else void remove(actionTarget.id);
        }}
      />
    </div>
  );
}
