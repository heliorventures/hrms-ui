import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManage = ({ canScopedPermission }: TourContext) =>
  canScopedPermission?.('recruitment:manage', ['ALL']) ?? false;
const onTab = (context: TourContext, tab: string) =>
  context.activeTab ? context.activeTab === tab : tab === 'jobs';

export const recruitmentPageTour: TourDefinition = {
  id: 'workplace-recruitment-page',
  routePaths: ['workplace/recruitment'],
  steps: [
    {
      id: 'recruitment-sections',
      anchor: 'recruitment.sections',
      title: 'Choose a hiring view',
      body: 'Jobs lists openings and their status. Applicants shows candidate submissions and can be filtered to a selected opening. Changing views does not modify a candidate or job.',
    },
    {
      id: 'recruitment-job-actions',
      anchor: 'recruitment.job-actions',
      title: 'Create or update an opening',
      body: 'Hiring managers can create or edit an opening in the job editor. It collects role and posting details; saving validates and updates the opening and its status in the jobs list.',
      isVisible: (context) => canManage(context) && onTab(context, 'jobs'),
    },
    {
      id: 'recruitment-applicant-review',
      anchor: 'recruitment.applicant-review',
      title: 'Review applicants',
      body: 'Applicants can be filtered by job and status. Review opens the selected applicant details and the available hiring actions; any status change or decision is saved from that workflow.',
      isVisible: (context) => canManage(context) && onTab(context, 'applicants'),
    },
  ],
};
