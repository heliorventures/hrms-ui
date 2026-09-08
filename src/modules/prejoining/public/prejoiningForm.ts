import type { PrejoiningField } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\-\s\d]{7,24}$/;
const PHONE_FIELDS = new Set(['personalPhone', 'emergencyContactPhone']);
const ALLOWED_DOCUMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const candidateTokenFromHash = (hash: string): string | null => {
  const token = new URLSearchParams(hash.replace(/^#/, '')).get('token');
  const value = token === null ? '' : token.trim();
  return value || null;
};

const fieldValueError = (field: PrejoiningField, value: string): string | null => {
  if (field.required && !value) return `${field.label} is required.`;
  if (value && field.key === 'email' && !EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address.';
  }
  if (value && PHONE_FIELDS.has(field.key) && !PHONE_PATTERN.test(value)) {
    return 'Enter a valid phone number.';
  }
  return null;
};

export const validateAnswers = (
  fields: readonly PrejoiningField[],
  answers: Readonly<Record<string, string>>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = (answers[field.key] || '').trim();
    const error = fieldValueError(field, value);
    if (error) errors[field.key] = error;
  }
  return errors;
};

export const documentFileError = (file: Pick<File, 'size' | 'type'>): string | null => {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) return 'Choose a PDF, JPEG or PNG file.';
  if (file.size > MAX_DOCUMENT_BYTES) return 'File must be 10 MB or smaller.';
  return null;
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
