import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  LockKeyhole,
  Trash2,
  Upload,
} from 'lucide-react';
import type { ReactNode } from 'react';

import Button from '../../../components/common/Button';
import FormField from '../../../components/common/FormField';
import Input from '../../../components/common/Input';

import { formatFileSize } from './prejoiningForm';
import type { PrejoiningDocument, PrejoiningField, PrejoiningForm } from './types';
import type { PageFailure } from './usePrejoiningFormController';

const multilineFields = new Set(['currentAddress', 'permanentAddress']);
const phoneFields = new Set(['personalPhone', 'emergencyContactPhone']);
export const PublicShell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-screen bg-canvas px-4 py-6 text-content-primary sm:px-6 sm:py-10">
    <div className="mx-auto w-full max-w-3xl">{children}</div>
  </main>
);
const failureCopy: Record<PageFailure, [string, string]> = {
  'missing-token': ['This link is incomplete', 'Open the full private link sent by your HR team.'],
  unavailable: [
    'This link is unavailable',
    'The invitation may have expired, been replaced, or is no longer available. Ask HR for a new link.',
  ],
  network: [
    'We could not load your form',
    'Check your connection and try again. Your link remains private.',
  ],
  unknown: ['We could not load your form', 'Try again or contact HR if the problem continues.'],
};
export const FailurePage = ({ kind, retry }: { kind: PageFailure; retry?: () => void }) => {
  const copy = failureCopy[kind];
  return (
    <PublicShell>
      <section className="mx-auto mt-[12vh] max-w-lg rounded-2xl border border-line bg-surface p-6 text-center shadow-card sm:p-8">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-status-warning/10 text-status-warning">
          <LockKeyhole aria-hidden="true" className="size-6" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{copy[0]}</h1>
        <p className="mt-2 text-sm leading-6 text-content-secondary">{copy[1]}</p>
        {retry ? (
          <Button className="mt-5" onClick={retry}>
            Try again
          </Button>
        ) : null}
      </section>
    </PublicShell>
  );
};
export const StatusPage = ({ form }: { form: PrejoiningForm }) => {
  const states: Partial<Record<PrejoiningForm['status'], [string, string]>> = {
    SUBMITTED: ['Details submitted', 'HR has received your information. You can close this page.'],
    APPROVED: [
      'Details approved',
      'Your information has been approved. HR will contact you about the next step.',
    ],
    JOINED: [
      'Pre-joining complete',
      'Your joining process is complete. This private link is no longer editable.',
    ],
    CANCELLED: [
      'Invitation unavailable',
      'This pre-joining invitation has been cancelled. Contact HR if you need help.',
    ],
  };
  const content = states[form.status];
  if (!content) return null;
  return (
    <PublicShell>
      <section className="mx-auto mt-[12vh] max-w-lg rounded-2xl border border-line bg-surface p-6 text-center shadow-card sm:p-8">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-status-success/10 text-status-success">
          <CheckCircle2 aria-hidden="true" className="size-7" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{content[0]}</h1>
        <p className="mt-2 text-sm leading-6 text-content-secondary">{content[1]}</p>
      </section>
    </PublicShell>
  );
};
const fieldType = (field: PrejoiningField) => {
  if (field.key === 'dateOfBirth') return 'date';
  if (field.key === 'email') return 'email';
  if (phoneFields.has(field.key)) return 'tel';
  return 'text';
};
export const CandidateField = ({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: PrejoiningField;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) =>
  multilineFields.has(field.key) ? (
    <FormField
      id={`prejoining-${field.key}`}
      label={field.label}
      required={field.required}
      error={error}
    >
      {({ inputId, describedBy, invalid }) => (
        <textarea
          id={inputId}
          value={value}
          disabled={disabled}
          required={field.required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-content-primary disabled:bg-canvas md:text-sm"
        />
      )}
    </FormField>
  ) : (
    <Input
      id={`prejoining-${field.key}`}
      label={field.label}
      type={fieldType(field)}
      autoComplete={field.key === 'email' ? 'email' : undefined}
      value={value}
      disabled={disabled}
      required={field.required}
      error={error}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
    />
  );
interface DocumentRowProps {
  label: string;
  required: boolean;
  document?: PrejoiningDocument;
  disabled: boolean;
  progress: number | null;
  error?: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onDownload: () => void;
}
export const DocumentRow = ({
  label,
  required,
  document,
  disabled,
  progress,
  error,
  onUpload,
  onDelete,
  onDownload,
}: DocumentRowProps) => (
  <div>
    <div className="rounded-lg border border-line p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {label}
            {required ? (
              <span className="ml-1 text-status-danger" aria-hidden="true">
                *
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-content-muted">PDF, JPEG or PNG · up to 10 MB</p>
          {document ? (
            <p className="mt-2 break-words text-sm text-content-secondary">
              <FileText aria-hidden="true" className="mr-1 inline size-4" />
              {document.filename} · {formatFileSize(document.sizeBytes)}
            </p>
          ) : null}
        </div>
        <div className="flex gap-1">
          {document ? (
            <>
              <Button
                size="sm"
                variant="quiet"
                disabled={disabled}
                startIcon={<Download className="size-4" />}
                onClick={onDownload}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="quiet"
                disabled={disabled}
                startIcon={<Trash2 className="size-4" />}
                onClick={onDelete}
              >
                Remove
              </Button>
            </>
          ) : (
            <label
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium md:min-h-8 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-selected'}`}
            >
              <Upload aria-hidden="true" className="size-4" />
              {progress === null ? 'Choose file' : `Uploading ${progress}%`}
              <input
                className="sr-only"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                disabled={disabled}
                aria-label={`${label} file`}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(file);
                  event.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
    {error ? (
      <p role="alert" className="mt-1 text-sm font-medium text-status-danger">
        {error}
      </p>
    ) : null}
  </div>
);
export const ChangesNotice = ({ feedback }: { feedback: string | null }) => (
  <section
    className="mb-4 rounded-xl border border-status-warning/30 bg-status-warning/10 p-4"
    aria-labelledby="changes-title"
  >
    <div className="flex gap-3">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-status-warning" />
      <div>
        <h2 id="changes-title" className="font-semibold">
          Changes requested
        </h2>
        <p className="mt-1 whitespace-pre-wrap text-sm text-content-secondary">
          {feedback || 'HR asked you to review and resubmit your details.'}
        </p>
      </div>
    </div>
  </section>
);
