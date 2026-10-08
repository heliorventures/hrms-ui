import { PERMISSIONS } from '../../../auth/permissions';
import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManageCompanyDocuments = (context: TourContext) =>
  [PERMISSIONS.employeeWrite, PERMISSIONS.onboardingManage, PERMISSIONS.roleManage].some(
    (permission) => context.canScopedPermission?.(permission) ?? false
  );

export const organizationDocumentsTour: TourDefinition = {
  id: 'organization-documents',
  routePaths: ['organization/documents'],
  steps: [
    {
      id: 'organization-documents-tabs',
      anchor: 'organization-documents-tabs',
      title: 'Choose a document view',
      body: 'Company Documents contains published policies and resources, My Documents lists your uploaded files, and Document Requirements shows the tenant document types.',
    },
    {
      id: 'organization-company-document-library',
      anchor: 'organization-company-document-library',
      title: 'Read company documents',
      body: 'Search by title or filter by category, select a document to read it, and use its actions to download a private copy. No file is downloaded by this tour.',
    },
    {
      id: 'organization-company-document-upload',
      anchor: 'organization-company-document-upload',
      title: 'Add a company document',
      body: 'Authorized users can choose a category, title, optional description, file, and employee visibility before uploading. The upload form validates the file and saves it to the company library; this tour does not open or submit that form.',
      isVisible: canManageCompanyDocuments,
    },
    {
      id: 'organization-company-document-removal',
      anchor: 'organization-company-document-library',
      title: 'Manage published documents',
      body: 'Authorized users can remove a company document from its action menu. A confirmation explains that employees will no longer be able to open the document.',
      isVisible: canManageCompanyDocuments,
    },
  ],
};
