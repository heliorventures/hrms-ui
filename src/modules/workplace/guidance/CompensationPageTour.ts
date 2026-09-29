import type { TourDefinition } from '../../../guidance/tourTypes';

export const compensationPageTour: TourDefinition = {
  id: 'workplace-compensation-page',
  routePaths: ['workplace/compensation'],
  steps: [
    {
      id: 'compensation-sections',
      anchor: 'compensation.sections',
      title: 'Choose a compensation section',
      body: 'Review Cycles tracks compensation review periods. Salary Bands stores the grade ranges used by your organization.',
    },
    {
      id: 'compensation-setup',
      anchor: 'compensation.setup-actions',
      title: 'Configure review cycles and bands',
      body: 'Authorized managers can create or edit a review cycle or salary band. The setup dialog captures its dates or grade range and related designation details; saving updates the compensation configuration. This tour does not open the dialog or save changes.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('compensation:manage', ['ALL'])),
    },
    {
      id: 'compensation-pages',
      anchor: 'compensation.pages',
      title: 'Browse compensation records',
      body: 'Use Previous and Next to move through the loaded records in the selected section.',
    },
  ],
};
