import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManage = (context: TourContext) =>
  context.canScopedPermission?.('performance:manage', ['ALL']) ?? false;
const canEvaluate = (context: TourContext) =>
  context.canScopedPermission?.('performance:evaluate', ['TEAM']) ?? false;
const canSelf = (context: TourContext) =>
  context.canScopedPermission?.('performance:self', ['SELF']) ?? false;
const currentTab = (context: TourContext, tabs: readonly string[], defaultForNull = false) =>
  context.activeTab ? tabs.includes(context.activeTab) : defaultForNull;

export const performancePageTour: TourDefinition = {
  id: 'workplace-performance-page',
  routePaths: ['performance', 'workplace/performance'],
  steps: [
    {
      id: 'performance-workflow-tabs',
      anchor: 'performance.workflow.tabs',
      title: 'Choose a performance view',
      body: 'Your access determines which sections appear here. My Performance is for your own reviews, Team Reviews is for assigned reviews, and setup, process, review, and administration sections are available to performance managers.',
    },
    {
      id: 'performance-self-reviews',
      anchor: 'performance.lifecycle.reviews',
      title: 'Complete your review',
      body: 'My Performance lists reviews assigned to you. Opening a review shows its questions, goals, and acknowledgement details. Saving or submitting a response happens in the page workflow; this tour does not change it.',
      isVisible: (context) => canSelf(context) && currentTab(context, ['my'], true),
    },
    {
      id: 'performance-team-reviews',
      anchor: 'performance.lifecycle.reviews',
      title: 'Review your team',
      body: 'Team Reviews lists reviews within your TEAM evaluation scope. Opening one shows the employee response and the available review controls. Saving feedback or advancing a cycle changes review state only in the page workflow.',
      isVisible: (context) =>
        (canEvaluate(context) || canManage(context)) &&
        currentTab(
          context,
          ['team', 'review', 'process'],
          canEvaluate(context) && !canSelf(context)
        ),
    },
    {
      id: 'performance-process-setup',
      anchor: 'performance.lifecycle.setup',
      title: 'Configure a review process',
      body: 'Setup defines the review cadence, dates, questionnaire, and acknowledgement requirements. Saving a process or questionnaire stores those settings; publishing makes a questionnaire available to a process.',
      isVisible: (context) =>
        canManage(context) &&
        currentTab(context, ['setup'], !canSelf(context) && !canEvaluate(context)),
    },
    {
      id: 'performance-cycle-processing',
      anchor: 'performance.lifecycle.process',
      title: 'Run a review cycle',
      body: 'Process selects an active program and period, then creates or advances its review cycle. The page shows the resulting cycle and assigned reviews after an authorized action.',
      isVisible: (context) => canManage(context) && currentTab(context, ['process']),
    },
    {
      id: 'performance-review-administration',
      anchor: 'performance.lifecycle.administration',
      title: 'Inspect review administration',
      body: 'Administration provides authorized oversight of the selected program, including participant and review status information. Administrative actions remain in their page workflow.',
      isVisible: (context) => canManage(context) && currentTab(context, ['administration']),
    },
  ],
};
