import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminWorkflowsPageTour: TourDefinition = {
  id: 'workplace-workflows-page',
  routePaths: ['workplace/workflows'],
  steps: [
    {
      id: 'workflow-create',
      anchor: 'workflows.create-action',
      title: 'Create an approval workflow',
      body: 'Choose the approval domain and first approver, then create the workflow. An existing workflow for that domain must be selected under Add Step instead of creating a duplicate. This tour does not submit the form.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('workflow:manage', ['ALL'])),
    },
    {
      id: 'workflow-add-step',
      anchor: 'workflows.add-step-action',
      title: 'Add an approval step',
      body: 'Choose a workflow, name the step, set its response time, and select an approver type. Adding the step changes the approval order used by matching requests. This tour does not submit the form.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('workflow:manage', ['ALL'])),
    },
    {
      id: 'workflow-records',
      anchor: 'workflows.records',
      title: 'Review workflows and requests',
      body: 'The records section shows workflow status, configured approval steps, and request status. Reordering or removing a step changes workflow behavior; those controls are not activated by this tour.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('workflow:manage', ['ALL'])),
    },
  ],
};
