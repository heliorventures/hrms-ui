export type PrejoiningStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'JOINED'
  | 'CANCELLED';

export type PrejoiningFieldKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'dateOfBirth'
  | 'gender'
  | 'bloodGroup'
  | 'nationality'
  | 'personalPhone'
  | 'currentAddress'
  | 'permanentAddress'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'emergencyContactRelation';

export interface PrejoiningField {
  key: PrejoiningFieldKey;
  label: string;
  required: boolean;
}

export interface PrejoiningDocumentRequirement {
  id: string;
  documentTypeId: string;
  label: string;
  required: boolean;
}

export interface PrejoiningDocument {
  id: string;
  requirementId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PrejoiningForm {
  status: PrejoiningStatus;
  revision: number;
  config: {
    expiryHours: number;
    fields: PrejoiningField[];
    documents: PrejoiningDocumentRequirement[];
  };
  answers: Record<string, string>;
  feedback: string | null;
  documents: PrejoiningDocument[];
  expiresAt: string | null;
}

export interface PrejoiningWriteInput {
  revision: number;
  answers: Record<string, string>;
}

export type PrejoiningClientErrorKind =
  | 'unavailable'
  | 'stale'
  | 'invalid-state'
  | 'validation'
  | 'too-large'
  | 'not-found'
  | 'network'
  | 'unknown';

export class PrejoiningClientError extends Error {
  constructor(
    public readonly kind: PrejoiningClientErrorKind,
    message: string
  ) {
    super(message);
    this.name = 'PrejoiningClientError';
  }
}

export interface PrejoiningPublicClient {
  getForm(token: string, signal?: AbortSignal): Promise<PrejoiningForm>;
  saveDraft(
    token: string,
    input: PrejoiningWriteInput,
    signal?: AbortSignal
  ): Promise<PrejoiningForm>;
  submit(token: string, input: PrejoiningWriteInput, signal?: AbortSignal): Promise<PrejoiningForm>;
  uploadDocument(
    token: string,
    requirementId: string,
    revision: number,
    file: File,
    signal?: AbortSignal,
    onProgress?: (percent: number) => void
  ): Promise<PrejoiningForm>;
  deleteDocument(
    token: string,
    documentId: string,
    revision: number,
    signal?: AbortSignal
  ): Promise<PrejoiningForm>;
  downloadDocument(
    token: string,
    document: PrejoiningDocument,
    signal?: AbortSignal
  ): Promise<void>;
}
