import { reportAndCategoryHelpTasks } from '../../modules/admin/help/reportAndCategoryTasks';
import { adminHelpTasks } from '../../modules/admin/help/tasks';
import { expenseHelpTasks } from '../../modules/expenses/help/tasks';
import { leaveHelpTasks } from '../../modules/leave/help/tasks';
import { FEATURE_REGISTRY } from '../featureRegistry';
import { TOUR_REGISTRY } from '../tourRegistry';

import type { HelpTaskDefinition } from './helpTypes';

const taskContent = {
  ...adminHelpTasks,
  ...expenseHelpTasks,
  ...leaveHelpTasks,
  ...reportAndCategoryHelpTasks,
};
export const HELP_TASKS: readonly HelpTaskDefinition[] = FEATURE_REGISTRY.map((feature) => {
  const stepId = feature.tourStepIds[0];
  const step = TOUR_REGISTRY.flatMap((tour) => tour.steps).find((item) => item.id === stepId);
  const content = taskContent[stepId];
  return {
    id: feature.helpTaskIds[0],
    featureId: feature.id,
    title: feature.label,
    ...(content ?? {
      prerequisites: [`Open ${feature.pageTitle} with the access required for this feature.`],
      steps: [
        {
          id: 'open',
          text: `Open ${feature.pageTitle}${feature.tabId ? ` and select ${feature.tabId}` : ''}.`,
        },
        {
          id: 'use',
          text: step?.body ?? 'Review the available controls and displayed information.',
        },
        {
          id: 'review',
          text: 'Review the selected record and any required fields before using an available action. Read its confirmation before proceeding.',
        },
      ],
      requiredFields: [],
      afterSave:
        'Review the resulting page or record. Viewing this guide does not perform the action.',
      checkStatus:
        'Use the displayed list, status or confirmation to check the outcome; refresh when appropriate.',
      recovery: [
        'Follow any inline field error. If the feature is unavailable, check your current permissions or contact HR.',
        'Save or close your current form before using guidance to change pages or tabs.',
      ],
    }),
  };
});
