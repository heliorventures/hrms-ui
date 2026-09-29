import type { TourDefinition } from '../../../guidance/tourTypes';

export const leavePageTour: TourDefinition = {
  id: 'leave-page',
  routePaths: ['leave'],
  steps: [
    {
      id: 'leave-refresh',
      anchor: 'leave.refresh',
      title: 'Refresh leave information',
      body: 'Refresh reloads leave balances, requests, and the supporting leave information on this page.',
    },
    {
      id: 'leave-balances',
      anchor: 'leave.balances',
      title: 'Review leave balances',
      body: 'Choose a year to review available balances and leave types. The values shown depend on your tenant policy and leave history.',
    },
    {
      id: 'leave-requests',
      anchor: 'leave.requests',
      title: 'Review leave requests',
      body: 'Recent requests show their status and workflow history. Pending requests may offer actions according to your role and the request assignment.',
    },
    {
      id: 'leave-apply-dialog',
      anchor: 'leave.apply-trigger',
      title: 'Understand the leave application form',
      body: 'The form asks for a leave type, date range, and reason. Some leave types also require a supporting document; eligible requests can specify a half day. This tour does not create a request.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.submit') ?? false,
    },
    {
      id: 'leave-approval-actions',
      anchor: 'leave.requests',
      title: 'Understand approval actions',
      body: 'Requests assigned to your approval scope can show Approve and Reject actions. Rejection requires a reason. These actions follow the configured approval workflow and are not run by this tour.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.approve') ?? false,
    },
    {
      id: 'leave-management-settings',
      anchor: 'leave.holiday-summary',
      title: 'Manage leave policy',
      body: 'If your role can manage leave, the holiday summary links to leave settings for policy and holiday administration.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.manage') ?? false,
    },
    {
      id: 'leave-comp-off-request',
      anchor: 'leave.comp-off-trigger',
      title: 'Understand a comp-off request',
      body: 'A credit request records the date worked, units, and a reason. Approved credits follow the expiry policy shown on this page; pending requests may offer a cancel action. The tour does not send a request.',
      isVisible: ({ canCapability }) => canCapability?.('action.leave.submit') ?? false,
    },
    {
      id: 'leave-holiday-reference',
      anchor: 'leave.holiday-summary',
      title: 'Review holiday and leave-type references',
      body: 'The summary shows upcoming holidays and opens the full company holiday list. Leave types below describe the options available for requests.',
    },
  ],
};
