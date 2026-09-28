import type { OrgDocumentsListQuery } from '../../api/graphql/graphql';

export type CompanyDocumentRow = OrgDocumentsListQuery['companyDocuments'][number];

export const COMPANY_DOCUMENT_CATEGORIES = [
  { value: 'COMPANY_POLICY', label: 'Company policy' },
  { value: 'ONBOARDING', label: 'Onboarding' },
  { value: 'EXIT_FORMALITY', label: 'Exit formality' },
] as const;

export interface CompanyDocumentActions {
  busy: boolean;
  canManage: boolean;
  onDelete: (document: CompanyDocumentRow) => Promise<void>;
  onDownload: (document: CompanyDocumentRow) => Promise<void>;
}
