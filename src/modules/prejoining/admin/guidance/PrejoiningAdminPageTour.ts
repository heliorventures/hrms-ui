import type { TourContext, TourDefinition } from '../../../../guidance/tourTypes';

const canManage = ({ canScopedPermission }: TourContext) =>
  canScopedPermission?.('prejoining:manage', ['ALL']) ?? false;
const canReview = ({ canScopedPermission }: TourContext) =>
  canScopedPermission?.('prejoining:review', ['ALL']) ?? false;
const canConfirmJoined = (context: TourContext) =>
  canReview(context) &&
  ((context.canScopedPermission?.('employee:write', ['ALL']) ?? false) ||
    (context.canScopedPermission?.('employee:manage', ['ALL']) ?? false)) &&
  (context.canScopedPermission?.('role:manage', ['ALL']) ?? false);

export const prejoiningAdminPageTour: TourDefinition = {
  id: 'workplace-prejoining-page',
  routePaths: ['workplace/prejoining'],
  steps: [
    {
      id: 'prejoining-sections',
      anchor: 'prejoining.sections',
      title: 'Choose configuration or review',
      body: 'Config controls the tenant candidate intake process. Candidates lists submitted applications for review. Your scoped permissions determine which section is available.',
    },
    {
      id: 'prejoining-intake-configuration',
      anchor: 'prejoining.configuration',
      title: 'Configure the intake form',
      body: 'Configuration controls invitation expiry, candidate fields, and document requirements. Saving applies those tenant settings to future candidate submissions.',
      isVisible: canManage,
    },
    {
      id: 'prejoining-invitations',
      anchor: 'prejoining.invitation-actions',
      title: 'Create a candidate invitation',
      body: 'Create invitation can generate a link only or send an email with the link. The result shows the invitation status and access details. This tenant tour does not open a public candidate form or create an invitation.',
      isVisible: canManage,
    },
    {
      id: 'prejoining-candidate-review',
      anchor: 'prejoining.candidates',
      title: 'Find a candidate submission',
      body: 'Filter candidates by status, then Review opens the submission drawer with the candidate fields and uploaded documents. Review actions can approve, request changes, or cancel an eligible submission.',
      isVisible: canReview,
    },
    {
      id: 'prejoining-confirm-joined',
      anchor: 'prejoining.candidates',
      title: 'Confirm a joined candidate',
      body: 'After an approved candidate accepts and joins, authorized employee and role managers can confirm the conversion. The confirmation checks the employee details and reports the created employee record.',
      isVisible: canConfirmJoined,
    },
  ],
};
