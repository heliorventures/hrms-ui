import type {
  ConfirmJoinedDraft,
  PrejoiningCandidate,
  PrejoiningConfig,
  PrejoiningInvitation,
  PrejoiningStatus,
} from './prejoiningAdminTypes';

export const PAGE_SIZE = 20;
export const ALL_SCOPE = ['ALL'] as const;
export const MANDATORY_FIELDS = new Set(['firstName', 'lastName', 'email']);
export const FIELD_CLASS =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

export const emptyConfig = (): PrejoiningConfig => ({ expiryHours: 48, fields: [], documents: [] });
export const emptyConfirm = (): ConfirmJoinedDraft => ({
  employeeCode: '',
  dateOfJoining: '',
  departmentId: '',
  designationId: '',
  reportingManagerId: '',
  employmentType: '',
  username: '',
  initialPassword: '',
  confirmPassword: '',
  roleIds: [],
});

export const statusTone = (status: PrejoiningStatus) => {
  if (status === 'JOINED' || status === 'APPROVED') return 'success' as const;
  if (status === 'CANCELLED') return 'danger' as const;
  if (status === 'CHANGES_REQUESTED') return 'warning' as const;
  if (status === 'SUBMITTED') return 'info' as const;
  return 'neutral' as const;
};

export const invitationTone = (status: PrejoiningInvitation['emailStatus']) => {
  if (status === 'SENT') return 'success' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'neutral' as const;
};

export const prettyStatus = (status: string) =>
  status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (value: string) => value.toUpperCase());
export const bytesLabel = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function normalizeConfig(value: unknown): PrejoiningConfig {
  if (!value || typeof value !== 'object') return emptyConfig();
  const row = value as Partial<PrejoiningConfig>;
  return {
    expiryHours: Number(row.expiryHours ?? 48),
    fields: Array.isArray(row.fields) ? row.fields : [],
    documents: Array.isArray(row.documents) ? row.documents : [],
  };
}

export function replaceCandidate(rows: PrejoiningCandidate[], next: PrejoiningCandidate) {
  return rows.map((row) => (row.id === next.id ? next : row));
}

export function downloadBase64(filename: string, mimeType: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
