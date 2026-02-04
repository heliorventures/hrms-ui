import { DocumentFolder, EmployeeDocument } from '../types';

export const mockDocumentFolders: DocumentFolder[] = [
  { id: 'onboarding', label: 'Onboarding', count: 0, icon: 'person' },
  { id: 'employee-letters', label: 'Employee Letters', count: 7, icon: 'folder' },
  { id: 'degrees-certificates', label: 'Degrees & Certificates', count: 1, icon: 'graduation' },
  { id: 'previous-experience', label: 'Previous Experience', count: 1, icon: 'briefcase' },
  { id: 'identity', label: 'Identity', count: 3, icon: 'id' },
  { id: 'offer-letter', label: 'Offer Letter', count: 0, icon: 'offer' },
  { id: 'exiting', label: 'Exiting documents', count: 0, icon: 'exiting' },
  { id: 'signatures', label: 'Signatures', count: 0, icon: 'signature' },
];

// No documents by default. Add items here or via API to show pending uploads.
export const mockPendingDocuments: EmployeeDocument[] = [];

export const mockDocumentsByFolder: Record<string, EmployeeDocument[]> = {
  onboarding: [],
  'employee-letters': [],
  'degrees-certificates': [],
  'previous-experience': [],
  identity: [],
  'offer-letter': [],
  exiting: [],
  signatures: [],
};
