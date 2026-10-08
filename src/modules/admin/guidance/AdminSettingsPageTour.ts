import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminSettingsPageTour: TourDefinition = {
  id: 'admin-settings-page',
  routePaths: ['admin/settings'],
  steps: [
    {
      id: 'admin-settings-directory-snapshot',
      anchor: 'admin.settings.directory-snapshot',
      title: 'Review the employee directory snapshot',
      body: 'The Employee Directory Snapshot shows employee IDs, names, linked users, employment types, and status. It is read-only on this page.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.settings')) &&
        Boolean(canScopedPermission?.('role:manage', ['ALL'])),
    },
    {
      id: 'admin-settings-pending-controls',
      anchor: null,
      title: 'Review controls awaiting backend support',
      body: 'The administration notes describe Leave Types & Balances and Attendance Override controls that are currently unavailable. The page does not provide actions for these items, and this tour does not change settings.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.settings')) &&
        Boolean(canScopedPermission?.('role:manage', ['ALL'])),
    },
  ],
};
