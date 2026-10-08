import { PERMISSIONS } from '../../../auth/permissions';
import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManageEmployee = (context: TourContext) =>
  'profileAccess' in context
    ? context.profileAccess?.canManageOrganizationFields === true
    : (context.canScopedPermission?.(PERMISSIONS.employeeManage, ['ALL']) ?? false);
const canViewPrivateProfile = (context: TourContext) =>
  'profileAccess' in context
    ? context.profileAccess?.canViewPrivateProfile === true
    : (context.canScopedPermission?.(PERMISSIONS.employeeRead, [
        'SELF',
        'TEAM',
        'DEPARTMENT',
        'ALL',
      ]) ??
        false) ||
      canManageEmployee(context);

export const employeeDetailTour: TourDefinition = {
  id: 'organization-employee-detail',
  routePaths: ['organization/employees/:employeeId'],
  steps: [
    {
      id: 'employee-profile-refresh',
      anchor: 'employee-profile-refresh',
      title: 'Refresh this profile',
      body: 'Refresh reloads the current employee details from the tenant service.',
      isVisible: canViewPrivateProfile,
    },
    {
      id: 'employee-profile-directory-details',
      anchor: 'employee-profile-directory-details',
      title: 'Directory details',
      body: 'When private profile access is unavailable, this page shows work information from the organization directory while personal, identity, banking, and document details remain private.',
      isVisible: (context) => !canViewPrivateProfile(context),
    },
    {
      id: 'employee-profile-navigation',
      anchor: 'profile-section-navigation',
      title: 'Move between profile sections',
      body: 'Use these sections to review the employee overview, personal information, banking, identity, education, work history, growth timeline, and documents. Employment management appears for authorized HR users.',
      isVisible: canViewPrivateProfile,
    },
    {
      id: 'employee-profile-personal-info',
      anchor: 'profile-section-personal',
      title: 'Personal information',
      body: 'Contact and demographic edits save directly. Legal name and date of birth changes are sent to HR for review. This tour does not save profile changes.',
      isVisible: canViewPrivateProfile,
    },
    {
      id: 'employee-profile-documents',
      anchor: 'profile-section-documents',
      title: 'Documents and review',
      body: 'The Documents section supports secure previews and uploads such as PAN, Aadhaar, offer, and appraisal letters. Employee uploads can require HR approval; HR users can review pending items here. This tour does not open the upload form or change a document.',
      isVisible: canViewPrivateProfile,
    },
    {
      id: 'employee-profile-document-upload',
      anchor: 'profile-section-navigation',
      title: 'Upload a document',
      body: 'After this tour, open Documents to find the upload form. It selects a document type and file before sending it for secure storage. Employee uploads may wait for HR approval. This tour does not open the form or upload a file.',
      isVisible: canViewPrivateProfile,
    },
    {
      id: 'employee-profile-document-review',
      anchor: 'profile-section-navigation',
      title: 'Review employee documents',
      body: 'After this tour, open Documents to find the review controls. For a pending employee upload, authorized HR users can preview it, then approve or reject it. The review controls change the document status, so they remain in the live workflow and are not opened by this tour.',
      isVisible: (context) =>
        'profileAccess' in context
          ? context.profileAccess?.canReviewProfileChanges === true
          : canManageEmployee(context),
    },
    {
      id: 'employee-profile-employment',
      anchor: 'profile-section-employment',
      title: 'Employment management',
      body: 'Authorized HR users can manage salary, role and organization assignments, and employment lifecycle actions in this section. The live forms and confirmation dialogs validate and save those changes; this tour only explains where they are.',
      isVisible: canManageEmployee,
    },
    {
      id: 'employee-profile-location',
      anchor: 'employee-profile.location',
      title: 'Assign employee company location',
      body: 'In Employment (HR), Employee Location shows the current location and effective date. Select a named active company location or Company default, then Assign Location Today. The change takes effect on the displayed company business date. Reload and review before retrying a stale revision. This tour does not change the assignment.',
      isVisible: canManageEmployee,
    },
  ],
};
