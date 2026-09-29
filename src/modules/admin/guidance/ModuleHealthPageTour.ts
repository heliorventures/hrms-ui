import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManageRoles = (canScopedPermission: TourContext['canScopedPermission']) =>
  Boolean(canScopedPermission?.('role:manage', ['ALL']));

export const moduleHealthPageTour: TourDefinition = {
  id: 'admin-module-health-page',
  routePaths: ['admin/module-health'],
  steps: [
    {
      id: 'admin-module-health-summary',
      anchor: 'admin.module-health.summary',
      title: 'Read the module probe summary',
      body: 'The counters summarize how many configured tenant and operator probes succeeded, failed, or are still pending.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.moduleHealth')) && canManageRoles(canScopedPermission),
    },
    {
      id: 'admin-module-health-probes',
      anchor: 'admin.module-health.probes',
      title: 'Review probe status',
      body: 'Each card shows a module probe status and whether its query uses tenant or operator access. Probe previews can contain live records, so this tour does not display or repeat their values.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.moduleHealth')) && canManageRoles(canScopedPermission),
    },
    {
      id: 'admin-module-health-rerun',
      anchor: 'admin.module-health.rerun',
      title: 'Run the health probes again',
      body: 'Re-run probes sends the configured read-only health queries again and refreshes the status cards. This tour does not start probes.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.moduleHealth')) && canManageRoles(canScopedPermission),
    },
  ],
};
