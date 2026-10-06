import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';

export const organizationGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['organization/employees/:employeeId'],
    anchor: 'profile-section-navigation',
    tabs: [
      ...[
        'overview',
        'personal',
        'banking',
        'identity',
        'education',
        'work',
        'growth',
        'documents',
      ].map((id) => ({
        id,
        label: `Employee ${id}`,
        body: 'Open this profile section to inspect the information you can access. Edit and save only when the page offers an authorized action.',
        isVisible: (c: import('../../../guidance/tourTypes').TourContext) =>
          c.profileAccess?.canViewPrivateProfile === true,
      })),
      {
        id: 'employment',
        label: 'Employment and company location',
        body: 'Manage employment assignments, salary, lifecycle and the dated company location. Location changes take effect today.',
        isVisible: (c) => c.profileAccess?.canManageOrganizationFields === true,
      },
    ],
  },
  {
    routePaths: ['organization/documents'],
    anchor: 'organization-documents-tabs',
    tabs: [
      {
        id: 'company',
        label: 'Company documents',
        body: 'Search published policies and employee resources, read a selected document or download a private copy.',
      },
      {
        id: 'personal',
        label: 'My documents',
        body: 'Review permitted uploaded documents and status.',
      },
      {
        id: 'types',
        label: 'Document requirements',
        body: 'Review document types and requirements.',
      },
    ],
  },
];
export const organizationStepDestinations: Readonly<Record<string, StepDestination>> = {
  'organization-company-document-library': { tabId: 'company' },
  'organization-company-document-upload': { tabId: 'company' },
  'organization-company-document-removal': { tabId: 'company' },
  'employee-profile-personal-info': { tabId: 'personal' },
  'employee-profile-documents': { tabId: 'documents' },
  'employee-profile-document-upload': { tabId: 'documents' },
  'employee-profile-document-review': { tabId: 'documents' },
  'employee-profile-employment': { tabId: 'employment' },
  'employee-profile-location': {
    tabId: 'employment',
    keywords: ['assign employee location', 'office', 'branch', 'working calendar'],
  },
  'profile-personal-info': { tabId: 'personal' },
  'profile-banking': { tabId: 'banking' },
  'profile-documents': { tabId: 'documents' },
};
