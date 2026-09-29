import type { TourDefinition } from '../../../guidance/tourTypes';

export const surveysPageTour: TourDefinition = {
  id: 'workplace-surveys-page',
  routePaths: ['workplace/surveys'],
  steps: [
    {
      id: 'survey-workspace',
      anchor: 'surveys.workspace',
      title: 'Choose a survey workspace',
      body: 'The available tabs depend on your access. My surveys is for assigned responses, Reports is for permitted reporting, and Surveys is for managing survey setup and status.',
    },
    {
      id: 'survey-respond',
      anchor: 'surveys.respond',
      title: 'Respond to an assigned survey',
      body: 'Open an available item to review its questions and submit a response through the survey workflow. This tour does not open a survey or submit a response.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('survey:respond', ['SELF'])),
    },
    {
      id: 'survey-manage',
      anchor: 'surveys.add',
      title: 'Create or copy a survey',
      body: 'Add survey opens the editor for survey content, audience, schedule, and privacy settings. Saving keeps a draft for later review. This tour does not create or change a survey.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('survey:manage', ['ALL'])),
    },
    {
      id: 'survey-lifecycle',
      anchor: 'surveys.manage-actions',
      title: 'Manage survey status',
      body: 'Authorized survey managers can publish, open, or close a survey from its available actions. Each status change affects its assigned audience. This tour does not change survey status.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('survey:manage', ['ALL'])),
    },
    {
      id: 'survey-results',
      anchor: 'surveys.results',
      title: 'View permitted survey reporting',
      body: 'The Reports tab and available response summaries follow your results scope and each survey’s privacy settings. Reporting content is not loaded or shown in this tour.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('survey:results', ['TEAM', 'DEPARTMENT', 'ALL'])),
    },
    {
      id: 'survey-review-submissions',
      anchor: 'surveys.review-submissions',
      title: 'Review eligible submissions',
      body: 'Where the survey settings and your access allow it, authorized reviewers can review unnamed submissions after a survey closes. Individual response content is not shown in this tour.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(
          canScopedPermission?.('survey:manage', ['ALL']) &&
          canScopedPermission?.('survey:results', ['ALL'])
        ),
    },
  ],
};
