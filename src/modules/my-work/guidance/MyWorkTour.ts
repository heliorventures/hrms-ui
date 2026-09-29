import type { TourDefinition } from '../../../guidance/tourTypes';

export const myWorkTasksTour: TourDefinition = {
  id: 'my-work-tasks',
  routePaths: ['my-work/tasks'],
  steps: [
    {
      id: 'my-work-task-list',
      anchor: 'my-work-task-list',
      title: 'Your open tasks',
      body: 'Pending performance work and surveys appear here when they are assigned and available to you.',
    },
    {
      id: 'my-work-task-refresh',
      anchor: 'my-work-refresh',
      title: 'Refresh your task list',
      body: 'Refresh reloads the current task list without changing or submitting a task.',
    },
    {
      id: 'my-work-performance',
      anchor: 'my-work-open-task',
      title: 'Open performance work',
      body: 'Use Open task to continue a goal, self-review, or appraisal acknowledgement assigned to you.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('performance:self', ['SELF'])),
    },
    {
      id: 'my-work-survey',
      anchor: 'my-work-open-task',
      title: 'Open an available survey',
      body: 'Survey responses are submitted anonymously. Open task takes you to the survey; this tour does not enter or submit a response.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('survey:respond', ['SELF'])),
    },
  ],
};

export const myWorkCompletedTour: TourDefinition = {
  id: 'my-work-completed',
  routePaths: ['my-work/completed'],
  steps: [
    {
      id: 'my-work-completed-list',
      anchor: 'my-work-completed-list',
      title: 'Completed work',
      body: 'This archive shows completed performance items and surveys. Submitted survey responses remain anonymous.',
    },
    {
      id: 'my-work-view-review',
      anchor: 'my-work-view-review',
      title: 'Reopen an appraisal record',
      body: 'View review opens the completed appraisal record for reference.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('performance:self', ['SELF'])),
    },
    {
      id: 'my-work-completed-refresh',
      anchor: 'my-work-refresh',
      title: 'Refresh the archive',
      body: 'Refresh reloads your completed items without changing them.',
    },
  ],
};
