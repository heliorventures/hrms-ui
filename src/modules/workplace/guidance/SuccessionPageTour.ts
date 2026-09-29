import type { TourDefinition } from '../../../guidance/tourTypes';

export const successionPageTour: TourDefinition = {
  id: 'workplace-succession-page',
  routePaths: ['workplace/succession'],
  steps: [
    {
      id: 'succession-sections',
      anchor: 'succession.sections',
      title: 'Choose a succession section',
      body: 'Talent Pools group succession candidates for planning. Competencies describe the skills used to assess readiness. The page lists the records available to your tenant.',
    },
    {
      id: 'succession-setup',
      anchor: 'succession.setup-actions',
      title: 'Set up pools and competencies',
      body: 'Authorized managers can create or edit a talent pool or competency. The setup dialog collects its name and planning details; saving updates the tenant catalog. This tour does not open the dialog or save changes.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('succession:manage', ['ALL'])),
    },
    {
      id: 'succession-pages',
      anchor: 'succession.pages',
      title: 'Browse the available records',
      body: 'Use Previous and Next to move through the loaded succession records for the selected section.',
    },
  ],
};
