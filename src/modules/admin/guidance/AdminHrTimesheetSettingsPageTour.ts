import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminHrTimesheetSettingsPageTour: TourDefinition = {
  id: 'admin-hr-timesheet-settings-page',
  routePaths: ['admin/timesheet-settings'],
  steps: [
    {
      id: 'timesheet-settings-adjustment',
      anchor: 'timesheet-settings.tabs',
      title: 'Set the missed punch adjustment window',
      body: 'Missed Punch Rules controls how many calendar days employees may self-add missed punches. Saving affects future adjustment requests. This section is editable for users with the attendance policy or timesheet manage route capability.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.admin.timesheetSettings')),
    },
    {
      id: 'timesheet-settings-locking',
      anchor: 'timesheet-settings.tabs',
      title: 'Control timesheet editing and locks',
      body: 'Timesheet Lock Rules sets the rolling editable week span and whether approved entries are locked from further edits. Saving changes the tenant timesheet policy and requires timesheet manage permission.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.timesheet.manage')),
    },
    {
      id: 'timesheet-settings-projects',
      anchor: 'timesheet-settings.tabs',
      title: 'Maintain company projects',
      body: 'Projects adds or updates a project code and display name. Project codes are used to organize timesheet entries; saving changes the company project catalog and requires timesheet manage permission.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.timesheet.manage')),
    },
    {
      id: 'timesheet-settings-task-types',
      anchor: 'timesheet-settings.tabs',
      title: 'Set project task types',
      body: 'Project Task Types selects a project and saves the allowed task codes, one per line. The selected list controls employee task choices for that project and requires timesheet manage permission.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.timesheet.manage')),
    },
  ],
};
