import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { GraduationCap, Paperclip, Plus, Trash2 } from 'lucide-react';

import type { EducationEntry, TenantDocumentTypeOption, VerificationStatus } from '../types';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Modal from '../../../../components/common/Modal';
import Select from '../../../../components/common/Select';
import { EmptySection } from '../components/SectionStates';
import { VerificationBadge } from '../components/StatusBadge';
import { UploadModal } from '../components/UploadModal';
import {
  DeleteEmployeeEducationDocument,
  LinkEmployeeEducationEvidenceDocument,
  ResolveEmployeeEducationDocument,
  UploadEmployeeDocumentProfileDocument,
  UpsertEmployeeEducationDocument,
} from '../../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

interface EducationTabProps {
  employeeId: string;
  client: GraphQLClient;
  initial: EducationEntry[];
  documentTypes: TenantDocumentTypeOption[];
  canReview?: boolean;
}

const levelOptions = [
  ['SECONDARY', 'Secondary'],
  ['HIGHER_SECONDARY', 'Higher Secondary'],
  ['DIPLOMA', 'Diploma'],
  ['UNDERGRADUATE', 'Undergraduate'],
  ['POSTGRADUATE', 'Postgraduate'],
  ['DOCTORATE', 'Doctorate'],
  ['CERTIFICATION', 'Certification'],
  ['OTHER', 'Other'],
].map(([value, label]) => ({ value, label }));

const blankForm = () => ({
  educationLevel: 'UNDERGRADUATE',
  qualification: '',
  fieldOfStudy: '',
  institution: '',
  boardUniversity: '',
  startDate: '',
  completionYear: String(new Date().getFullYear()),
  gradeScore: '',
  description: '',
});

export function EducationTab({
  employeeId,
  client,
  initial,
  documentTypes,
  canReview = false,
}: EducationTabProps) {
  const [entries, setEntries] = useState<EducationEntry[]>(initial);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<EducationEntry | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidenceTarget, setEvidenceTarget] = useState<string | null>(null);

  useEffect(() => setEntries(initial), [initial]);

  const evidenceTypes = useMemo(
    () =>
      documentTypes.filter((type) =>
        `${type.systemKey ?? ''} ${type.category ?? ''} ${type.name}`
          .toUpperCase()
          .match(/EDUCATION|DEGREE|CERTIFICATE/)
      ),
    [documentTypes]
  );

  const openNew = () => {
    setEditing(null);
    setForm(blankForm());
    setError(null);
    setModal(true);
  };

  const openEdit = (entry: EducationEntry) => {
    setEditing(entry);
    setForm({
      educationLevel: entry.educationLevel,
      qualification: entry.qualification,
      fieldOfStudy: entry.fieldOfStudy,
      institution: entry.institution,
      boardUniversity: entry.boardUniversity,
      startDate: entry.startDate.slice(0, 10),
      completionYear: String(entry.completionYear),
      gradeScore: entry.gradeScore,
      description: entry.description,
    });
    setError(null);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await client.request(UpsertEmployeeEducationDocument, {
        input: {
          id: editing?.id,
          employeeId,
          educationLevel: form.educationLevel,
          qualification: form.qualification.trim(),
          fieldOfStudy: form.fieldOfStudy.trim() || undefined,
          institution: form.institution.trim(),
          boardUniversity: form.boardUniversity.trim() || undefined,
          startDate: form.startDate || undefined,
          completionYear: Number(form.completionYear),
          gradeScore: form.gradeScore.trim() || undefined,
          description: form.description.trim() || undefined,
        },
      });
      const row = result.upsertEmployeeEducation;
      const mapped: EducationEntry = {
        id: row.id,
        educationLevel: row.educationLevel,
        qualification: row.qualification,
        fieldOfStudy: row.fieldOfStudy ?? '',
        institution: row.institution,
        boardUniversity: row.boardUniversity ?? '',
        startDate: row.startDate == null ? '' : String(row.startDate),
        completionYear: row.completionYear,
        gradeScore: row.gradeScore ?? '',
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
      setModal(false);
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this education record? This action removes it from your profile.'))
      return;
    setError(null);
    try {
      await client.request(DeleteEmployeeEducationDocument, { employeeId, educationId: id });
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    }
  };

  const uploadEvidence = async (payload: {
    documentTypeId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) => {
    if (!evidenceTarget) return;
    const upload = await client.request(UploadEmployeeDocumentProfileDocument, {
      input: { employeeId, ...payload },
    });
    const linked = await client.request(LinkEmployeeEducationEvidenceDocument, {
      employeeId,
      educationId: evidenceTarget,
      employeeDocumentId: upload.uploadEmployeeDocument.id,
    });
    setEntries((current) =>
      current.map((entry) =>
        entry.id === evidenceTarget
          ? {
              ...entry,
              verificationStatus: linked.linkEmployeeEducationEvidence
                .verificationStatus as VerificationStatus,
              evidenceDocumentIds: [...linked.linkEmployeeEducationEvidence.evidenceDocumentIds],
            }
          : entry
      )
    );
  };

  const review = async (id: string, approved: boolean) => {
    const rejectionReason = approved ? undefined : window.prompt('Reason for rejection:')?.trim();
    if (!approved && !rejectionReason) return;
    setError(null);
    try {
      const result = await client.request(ResolveEmployeeEducationDocument, {
        educationId: id,
        approved,
        rejectionReason,
      });
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                verificationStatus: result.resolveEmployeeEducation
                  .verificationStatus as VerificationStatus,
                rejectionReason: result.resolveEmployeeEducation.rejectionReason,
              }
            : entry
        )
      );
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="primary" className="gap-1" onClick={openNew}>
          <Plus className="h-4 w-4" aria-hidden /> Add Education
        </Button>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {entries.length === 0 ? (
        <EmptySection
          title="No Education On File"
          description="Add school, diploma, graduation, postgraduate, doctorate, or certification records."
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
                  <GraduationCap className="mt-1 h-5 w-5 text-indigo-500" aria-hidden />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {entry.qualification}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {entry.institution}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {levelOptions.find((option) => option.value === entry.educationLevel)
                        ?.label ?? entry.educationLevel}{' '}
                      · {entry.completionYear}
                      {entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ''}
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
                      onClick={() => void review(entry.id, false)}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEvidenceTarget(entry.id)}
                  className="gap-1"
                >
                  <Paperclip className="h-3.5 w-3.5" aria-hidden /> Upload certificate
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(entry)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!px-2 text-rose-600"
                  onClick={() => void remove(entry.id)}
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
        title={editing ? 'Edit Education' : 'Add Education'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select
            label="Education Level"
            name="educationLevel"
            value={form.educationLevel}
            options={levelOptions}
            fullWidth
            onChange={(event) =>
              setForm((current) => ({ ...current, educationLevel: event.target.value }))
            }
          />
          <Input
            label="Qualification"
            value={form.qualification}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, qualification: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Field Of Study"
            value={form.fieldOfStudy}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, fieldOfStudy: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Institution"
            value={form.institution}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, institution: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Board / University"
            value={form.boardUniversity}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, boardUniversity: event.target.value }))
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
            label="Completion Year"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={form.completionYear}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, completionYear: event.target.value }))
            }
            fullWidth
          />
          <Input
            label="Grade / Score"
            value={form.gradeScore}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((current) => ({ ...current, gradeScore: event.target.value }))
            }
            fullWidth
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
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
              !form.qualification.trim() ||
              !form.institution.trim() ||
              !form.completionYear
            }
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>

      <UploadModal
        isOpen={evidenceTarget !== null}
        onClose={() => setEvidenceTarget(null)}
        title="Upload Education Certificate"
        hideCategory
        documentTypes={evidenceTypes}
        onSubmit={uploadEvidence}
      />
    </div>
  );
}
