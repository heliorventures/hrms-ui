export type PrejoiningStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'JOINED'
  | 'CANCELLED';

export interface PrejoiningField {
  key: string;
  label: string;
  required: boolean;
}

export interface PrejoiningDocumentRequirement {
  id: string;
  documentTypeId: string;
  label: string;
  required: boolean;
}

export interface PrejoiningConfig {
  expiryHours: number;
  fields: PrejoiningField[];
  documents: PrejoiningDocumentRequirement[];
}

export interface PrejoiningDocument {
  id: string;
  requirementId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PrejoiningCandidate {
  id: string;
  email: string;
  status: PrejoiningStatus;
  revision: number;
  config: PrejoiningConfig;
  answers: Record<string, string>;
  feedback: string | null;
  documents: PrejoiningDocument[];
  expiresAt: string | null;
  employeeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrejoiningInvitation {
  candidate: PrejoiningCandidate;
  privateUrl: string;
  emailStatus: 'NOT_REQUESTED' | 'SENT' | 'FAILED';
  emailError: string | null;
}

export interface DirectoryOption {
  id: string;
  label: string;
}

export interface ConfirmJoinedDraft {
  employeeCode: string;
  dateOfJoining: string;
  departmentId: string;
  designationId: string;
  reportingManagerId: string;
  employmentType: string;
  username: string;
  initialPassword: string;
  confirmPassword: string;
  roleIds: string[];
}
