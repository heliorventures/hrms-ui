import type { ConfirmJoinedDraft, PrejoiningConfig } from './prejoiningAdminTypes';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANDATORY_FIELDS = ['firstName', 'lastName', 'email'];

export function validateInvitationEmail(email: string): string | null {
  return EMAIL.test(email.trim()) ? null : 'Enter a valid candidate email address.';
}

export function validateConfig(config: PrejoiningConfig): string | null {
  if (
    !Number.isInteger(config.expiryHours) ||
    config.expiryHours < 1 ||
    config.expiryHours > 8760
  ) {
    return 'Invitation expiry must be a whole number from 1 to 8760 hours.';
  }
  if (config.documents.length > 20) return 'No more than 20 document requirements are allowed.';
  if (
    MANDATORY_FIELDS.some(
      (key) => !config.fields.some((field) => field.key === key && field.required)
    )
  ) {
    return 'First name, last name, and email must remain required.';
  }
  const documentTypeIds = config.documents.map((row) => row.documentTypeId);
  if (documentTypeIds.some((id) => !id) || config.documents.some((row) => !row.label.trim())) {
    return 'Choose a document type and label for every document requirement.';
  }
  if (new Set(documentTypeIds).size !== documentTypeIds.length) {
    return 'Each document type can be required only once.';
  }
  return null;
}

export function validateConfirmJoined(draft: ConfirmJoinedDraft): string | null {
  if (!draft.employeeCode.trim()) return 'Employee code is required.';
  if (!draft.dateOfJoining) return 'Date of joining is required.';
  if (!draft.username.trim()) return 'Username is required.';
  if (draft.initialPassword.length < 8) return 'Initial password must be at least 8 characters.';
  if (draft.initialPassword !== draft.confirmPassword) return 'Passwords do not match.';
  if (draft.roleIds.length === 0) return 'Select at least one existing role.';
  return null;
}
