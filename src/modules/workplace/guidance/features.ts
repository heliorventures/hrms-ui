import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';

export const workplaceGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['performance', 'workplace/performance'],
    anchor: 'performance.workflow.tabs',
    tabs: [
      {
        id: 'my',
        label: 'My review',
        body: 'Open an assigned review, complete its questions and goals, and review acknowledgement requirements.',
        isVisible: (c) => c.canScopedPermission?.('performance:self', ['SELF']) ?? false,
      },
      {
        id: 'team',
        label: 'Team reviews',
        body: 'Open an assigned team review and provide evaluation feedback.',
        isVisible: (c) => c.canScopedPermission?.('performance:evaluate', ['TEAM']) ?? false,
      },
      ...['setup', 'process', 'review', 'administration'].map((id) => ({
        id,
        label: `Performance ${id}`,
        body: 'Select an available program and follow its configuration, cycle or review controls. Review the dates and status before saving or advancing.',
        isVisible: (c: import('../../../guidance/tourTypes').TourContext) =>
          c.canScopedPermission?.('performance:manage', ['ALL']) ?? false,
      })),
    ],
  },
  {
    routePaths: ['workplace/benefits'],
    anchor: 'benefits.sections',
    tabs: [
      {
        id: 'enrollments',
        label: 'My enrollments',
        body: 'Review existing benefit elections and effective dates.',
        isVisible: (c) =>
          Boolean(
            c.hasEmployeeProfile &&
            (c.canPermission?.('benefits:self') || c.canPermission?.('benefits:manage'))
          ),
      },
      {
        id: 'plans',
        label: 'Benefit plans',
        body: 'Review active plans, contributions and optional enrollment actions.',
      },
      {
        id: 'types',
        label: 'Benefit types',
        body: 'Review benefit categories and permitted management controls.',
      },
    ],
  },
  {
    routePaths: ['workplace/recruitment'],
    anchor: 'recruitment.sections',
    tabs: [
      {
        id: 'jobs',
        label: 'Job requisitions',
        body: 'Review job openings, dates and approval status.',
      },
      {
        id: 'applicants',
        label: 'Applicants',
        body: 'Review applicants and permitted interview or hiring actions.',
      },
    ],
  },
  {
    routePaths: ['workplace/succession'],
    anchor: 'succession.sections',
    tabs: [
      {
        id: 'pools',
        label: 'Talent pools',
        body: 'Review or configure succession candidate pools.',
      },
      {
        id: 'competencies',
        label: 'Competencies',
        body: 'Review or configure competency names and planning criteria.',
      },
    ],
  },
  {
    routePaths: ['workplace/compensation'],
    anchor: 'compensation.sections',
    tabs: [
      {
        id: 'reviews',
        label: 'Compensation review cycles',
        body: 'Review cycle dates and available approval controls.',
      },
      { id: 'bands', label: 'Salary bands', body: 'Review grade ranges and designation mappings.' },
    ],
  },
  {
    routePaths: ['workplace/learning'],
    anchor: 'learning.sections',
    tabs: [
      {
        id: 'courses',
        label: 'Learning courses',
        body: 'Browse courses, delivery mode, duration and mandatory status.',
      },
      { id: 'skills', label: 'Skills catalog', body: 'Browse skills, categories and levels.' },
    ],
  },
  {
    routePaths: ['workplace/assets'],
    anchor: 'assets.sections',
    tabs: [
      {
        id: 'inventory',
        label: 'Asset inventory',
        body: 'Review active inventory and its permitted management controls.',
        isVisible: (c) =>
          Boolean(
            c.canPermission?.('assets:read') || c.canScopedPermission?.('assets:manage', ['ALL'])
          ),
      },
      {
        id: 'assignments',
        label: 'Asset assignments and returns',
        body: 'Review permitted assignments and return records.',
      },
      { id: 'history', label: 'Asset history', body: 'Review permitted past assignment activity.' },
      {
        id: 'categories',
        label: 'Asset categories',
        body: 'Review category names and permitted catalog actions.',
        isVisible: (c) =>
          Boolean(
            c.canPermission?.('assets:read') || c.canScopedPermission?.('assets:manage', ['ALL'])
          ),
      },
    ],
  },
  {
    routePaths: ['workplace/surveys'],
    anchor: 'surveys.workspace',
    tabs: [
      {
        id: 'created',
        label: 'Survey administration',
        body: 'Create a draft, edit questions, review audience and publish when ready.',
        isVisible: (c) => c.canScopedPermission?.('survey:manage', ['ALL']) ?? false,
      },
      {
        id: 'mine',
        label: 'My surveys',
        body: 'Open an available survey, answer its questions and review before submission.',
        isVisible: (c) =>
          Boolean(c.hasEmployeeProfile && c.canScopedPermission?.('survey:respond', ['SELF'])),
      },
      {
        id: 'reports',
        label: 'Survey reports',
        body: 'Select a survey and inspect permitted results. Anonymous answers never expose identity.',
        isVisible: (c) =>
          Boolean(
            c.canScopedPermission?.('survey:results', ['TEAM', 'DEPARTMENT', 'ALL']) &&
            !c.canScopedPermission?.('survey:manage', ['ALL'])
          ),
      },
    ],
  },
];
export const workplaceStepDestinations: Readonly<Record<string, StepDestination>> = {
  'performance-self-reviews': { tabId: 'my' },
  'performance-team-reviews': { tabId: 'team' },
  'performance-process-setup': { tabId: 'setup' },
  'performance-cycle-processing': { tabId: 'process' },
  'performance-review-administration': { tabId: 'administration' },
  'benefit-enrollment-status': { tabId: 'enrollments' },
  'benefit-enrollment': { tabId: 'plans' },
  'benefit-plan-management': { tabId: 'plans' },
  'benefit-type-management': { tabId: 'types' },
  'assets-my-assignments': { tabId: 'assignments' },
  'assets-management': { tabId: 'inventory' },
  'assets-categories': { tabId: 'categories' },
  'assets-assignment': { tabId: 'assignments' },
  'learning-skill-management': { tabId: 'skills' },
  'learning-course-management': { tabId: 'courses' },
  'learning-sections': { tabId: 'courses' },
};
