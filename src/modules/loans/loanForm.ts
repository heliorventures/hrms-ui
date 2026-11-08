import type { GraphQLClient, RequestDocument } from 'graphql-request';
import type { ReactNode } from 'react';

export type LoanValues = Record<string, string>;
export interface LoanField {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'decimal' | 'integer' | 'textarea' | 'multi';
  optional?: boolean;
  options?: readonly { value: string; label: string }[];
  description?: string;
  readOnly?: boolean;
  visibleWhen?: (values: LoanValues) => boolean;
}
export interface LoanEditorDefinition {
  title: string;
  description: string;
  fields: readonly LoanField[];
  values: LoanValues;
  document: RequestDocument;
  version: number;
  build: (values: LoanValues, preview?: unknown) => Record<string, unknown>;
  validate?: (values: LoanValues) => string | null;
  preview?: (values: LoanValues, client: GraphQLClient) => Promise<unknown>;
  renderPreview?: (preview: unknown) => ReactNode;
}
export const choices = (values: readonly string[]) => [
  { value: '', label: 'Choose an option' },
  ...values.map((value) => ({ value, label: value.replace(/([a-z])([A-Z])/g, '$1 $2') })),
];
export const yesNo = [
  { value: '', label: 'Choose an option' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
export function validateLoanFields(fields: readonly LoanField[], values: LoanValues) {
  for (const field of fields.filter((candidate) => candidate.visibleWhen?.(values) ?? true)) {
    const raw: unknown = values[field.key];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value && !field.optional) return `Enter ${field.label.toLowerCase()}.`;
    if (!value) continue;
    if (field.type === 'decimal' && !/^(0|[1-9]\d*)(\.\d{1,6})?$/.test(value)) {
      return `${field.label} must be a plain non-negative decimal amount.`;
    }
    if (field.type === 'integer' && !/^\d{1,6}$/.test(value)) {
      return `${field.label} must be a whole number.`;
    }
  }
  return null;
}
