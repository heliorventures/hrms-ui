import type { TourDefinition } from '../../../guidance/tourTypes';

export const hrLeavesPageTour: TourDefinition = {
  id: 'hr-leaves-page',
  routePaths: ['hr/leaves'],
  steps: [
    {
      id: 'hr-leaves-queue',
      anchor: 'hr-leaves.queue',
      title: 'Review leave requests',
      body: 'Review and table views show request dates, leave type, duration, status, and workflow history. Filters and paging help narrow the queue. Open leave calendar in the request review to view scheduled leave and holidays together.',
    },
    {
      id: 'hr-leaves-application',
      anchor: 'hr-leaves.apply-trigger',
      title: 'Understand the leave application form',
      body: 'The form asks for a leave type, date range, and reason; some leave types require a supporting document and eligible requests can specify a half day. Submission access is enforced by the leave workflow. This tour does not create a request.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.submit') ?? false,
    },
    {
      id: 'hr-leaves-approval',
      anchor: 'leave.approve-trigger',
      title: 'Understand approval and rejection',
      body: 'Requests assigned to your approval scope can offer Approve. Approval records your workflow step and may leave the request pending for another approver. This tour does not approve a request.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.approve') ?? false,
    },
    {
      id: 'hr-leaves-rejection',
      anchor: 'leave.reject-trigger',
      title: 'Understand leave rejection',
      body: 'Reject opens a form that requires a reason, then records the rejection for the selected request. This tour does not reject a request.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.approve') ?? false,
    },
    {
      id: 'hr-leaves-workflow-history',
      anchor: 'leave.workflow-trigger',
      title: 'Read leave request history',
      body: 'View opens Leave Request History with the request summary and any recorded workflow step actions, dates, and remarks. It is a read-only view.',
    },
    {
      id: 'hr-leaves-comp-off',
      anchor: 'leave.comp-off-approvals',
      title: 'Review comp-off credit decisions',
      body: 'Authorized approvers can approve a comp-off credit or reject it with a required reason. A decision updates the request and its approval state. This tour does not make a decision.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.approve') ?? false,
    },
    {
      id: 'hr-leaves-settings',
      anchor: 'hr-leaves.configure-trigger',
      title: 'Open leave and holiday setup',
      body: 'Leave & holidays setup opens the policy and company-holiday administration page when your role can manage leave settings.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.manage') ?? false,
    },
  ],
};
