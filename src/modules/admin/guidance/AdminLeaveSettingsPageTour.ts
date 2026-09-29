import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminLeaveSettingsPageTour: TourDefinition = {
  id: 'admin-leave-settings-page',
  routePaths: ['admin/leave-settings'],
  steps: [
    {
      id: 'leave-settings-types',
      anchor: 'leave-settings.tab.types',
      title: 'Configure leave types',
      body: 'Leave Types controls the tenant leave catalog. Adding or editing a type changes the choices employees can request; deleting a type soft-deletes it. The related forms and confirmation do not open in this tour.',
    },
    {
      id: 'leave-settings-policies',
      anchor: 'leave-settings.tab.policies',
      title: 'Set leave eligibility and accrual',
      body: 'Policies define the leave type, applicable employee group, annual entitlement, accrual, consecutive-day limit, and notice period. Add and edit open a policy form; delete requires confirmation. Saving changes future leave administration.',
    },
    {
      id: 'leave-settings-balances',
      anchor: 'leave-settings.tab.balances',
      title: 'Maintain employee leave balances',
      body: 'Balances lets an administrator upsert an employee balance, adjust entitlement, or provision balances from policies for a year. Each action writes balance records; this tour does not run or submit them.',
    },
    {
      id: 'leave-settings-holidays',
      anchor: 'leave-settings.tab.holidays',
      title: 'Manage holiday calendars',
      body: 'Holidays lets administrators create calendars, add or edit holiday dates, and delete calendar or holiday records. A calendar can include a year and optional location; holidays can be public, national, regional, optional, or company days.',
    },
    {
      id: 'leave-settings-comp-off',
      anchor: 'leave-settings.tab.comp-off',
      title: 'Configure compensatory leave',
      body: 'Comp-off policies control when worked time earns compensatory leave. Add or edit opens a policy form, and the page checks active leave management permission before showing this section. Saving changes the tenant policy.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.leave.manage')),
    },
    {
      id: 'leave-settings-refresh',
      anchor: 'leave-settings.refresh',
      title: 'Reload leave configuration',
      body: 'Refresh reloads the leave console and its current settings without saving the form values shown in another tab.',
    },
  ],
};
