import type { TourDefinition } from '../../../guidance/tourTypes';

export const grievancePageTour: TourDefinition = {
  id: 'workplace-grievance-page',
  routePaths: ['workplace/grievance'],
  steps: [
    {
      id: 'grievance-workspace',
      anchor: 'grievance.workspace',
      title: 'Use the grievance workspace',
      body: 'This page provides the case filing workflow and the case list allowed by your access. Case subjects, descriptions, categories, and status details are not shown in the tour.',
    },
    {
      id: 'grievance-file-case',
      anchor: 'grievance.file-trigger',
      title: 'File a case',
      body: 'File a Case opens a form that requires a category and subject; a description is optional. Submitting sends the case into the configured grievance workflow. This tour does not open the form or submit a case.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.workplace.grievance')),
    },
    {
      id: 'grievance-case-list',
      anchor: 'grievance.case-list',
      title: 'Review cases available to you',
      body: 'The list shows cases returned for your access. This tour does not read, repeat, or expose any case information.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.workplace.grievance')),
    },
  ],
};
