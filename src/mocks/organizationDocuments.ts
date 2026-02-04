export interface OrganizationDocument {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  documentUrl?: string;
}

export const mockOrganizationDocuments: OrganizationDocument[] = [
  {
    id: 'org-doc-1',
    tenantId: 'tenant-1',
    title: 'Leave Policy (Updated Jan 2026)',
    description: 'Updated leave policy including casual leave, sick leave, earned leave, and WFH guidelines.',
    category: 'Leave',
    publishedAt: '2026-01-15',
  },
  {
    id: 'org-doc-2',
    tenantId: 'tenant-1',
    title: 'Attendance Policy',
    description: 'Standard attendance and punctuality guidelines. Shift timings and weekly off policy.',
    category: 'Attendance',
    publishedAt: '2025-11-01',
  },
  {
    id: 'org-doc-3',
    tenantId: 'tenant-1',
    title: 'Code of Conduct',
    description: 'Organization code of conduct and workplace ethics.',
    category: 'Policy',
    publishedAt: '2025-06-01',
  },
  {
    id: 'org-doc-4',
    tenantId: 'tenant-1',
    title: 'Expense Reimbursement Policy',
    description: 'Guidelines for submitting and claiming travel and expense reimbursements.',
    category: 'Expenses',
    publishedAt: '2025-09-10',
  },
];
