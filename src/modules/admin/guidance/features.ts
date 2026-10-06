import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';

export const adminGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['admin/leave-settings'],
    anchor: 'leave-settings.sections',
    tabs: [
      {
        id: 'types',
        label: 'Leave types',
        body: 'Create or edit the name, code, paid status, carry-forward, sandwich, half-day and required-document settings.',
      },
      {
        id: 'policies',
        label: 'Leave policies',
        body: 'Choose a leave type and employee group, then set entitlement, accrual, notice and consecutive-day limits.',
      },
      {
        id: 'balances',
        label: 'Leave balances',
        body: 'Choose employee, leave type and year. Save a balance, adjust entitlement or provision from matching policies; review the confirmation before writing.',
      },
      {
        id: 'holidays',
        label: 'Holiday calendars',
        body: 'Create a calendar for a year and company location or all locations. Add named holiday dates and review the resulting list.',
      },
      {
        id: 'comp-off',
        label: 'Comp-off policies',
        body: 'Configure earning, expiry and request limits for compensatory leave.',
        isVisible: (c) => c.canCapability?.('action.leave.manage') ?? false,
      },
    ],
  },
  {
    routePaths: ['admin/expense-categories'],
    anchor: 'expense-categories.tabs',
    tabs: [
      {
        id: 'categories',
        label: 'Expense categories',
        body: 'Add or edit a category name and code, taxable status and activity.',
      },
      {
        id: 'policies',
        label: 'Expense policies',
        body: 'Choose category and employee applicability, monetary limits, currency and effective dates. Every new expense requires a receipt.',
      },
    ],
  },
  {
    routePaths: ['admin/timesheet-settings'],
    anchor: 'timesheet-settings.tabs',
    tabs: [
      {
        id: 'adjustments',
        label: 'Missed punch adjustments',
        body: 'Set the permitted request window for attendance adjustments.',
      },
      { id: 'locking', label: 'Timesheet locks', body: 'Set submission and editing lock windows.' },
      {
        id: 'projects',
        label: 'Projects',
        body: 'Maintain project names and activity for employee timesheets.',
        isVisible: (c) => c.canCapability?.('action.timesheet.manage') ?? false,
      },
      {
        id: 'tasks',
        label: 'Project tasks',
        body: 'Maintain tasks linked to a project.',
        isVisible: (c) => c.canCapability?.('action.timesheet.manage') ?? false,
      },
    ],
  },
  {
    routePaths: ['admin/notifications'],
    anchor: 'admin-notifications.tabs',
    tabs: [
      {
        id: 'announcements',
        label: 'Announcements',
        body: 'Compose and publish company announcements to the permitted audience.',
      },
      {
        id: 'direct',
        label: 'Direct notifications',
        body: 'Select permitted recipients and compose a direct message.',
        isVisible: (c) => c.canCapability?.('action.notifications.manage') ?? false,
      },
      {
        id: 'automation',
        label: 'Automated greetings',
        body: 'Configure available greeting templates and schedules. Settings appear only when returned by the service.',
      },
    ],
  },
];
export const adminStepDestinations: Readonly<Record<string, StepDestination>> = {
  'leave-settings-types': { tabId: 'types' },
  'leave-settings-policies': { tabId: 'policies' },
  'leave-settings-balances': { tabId: 'balances' },
  'leave-settings-holidays': { tabId: 'holidays' },
  'leave-settings-comp-off': { tabId: 'comp-off' },
  'expense-policy-matching': { tabId: 'policies' },
  'timesheet-settings-adjustment': { tabId: 'adjustments' },
  'timesheet-settings-locking': { tabId: 'locking' },
  'timesheet-settings-projects': { tabId: 'projects' },
  'timesheet-settings-task-types': { tabId: 'tasks' },
  'admin-notifications-announcements': { tabId: 'announcements' },
  'admin-notifications-direct': { tabId: 'direct' },
  'admin-notifications-automation': { tabId: 'automation' },
  'attendance-policy-weekly-offs': {
    keywords: ['weekly off', 'weekend', 'second fourth saturday', 'location calendar'],
  },
  'company-locations-add': { keywords: ['office', 'branch', 'company location', 'add location'] },
};
