import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManageRoles = (canScopedPermission: TourContext['canScopedPermission']) =>
  Boolean(canScopedPermission?.('role:manage', ['ALL']));

export const hrAccessManagementPageTour: TourDefinition = {
  id: 'admin-access-page',
  routePaths: ['admin/access'],
  steps: [
    {
      id: 'admin-access-user-roles',
      anchor: 'admin.access.tab.users',
      title: 'Assign roles to users',
      body: "In User roles, select a user and choose the roles they should have. Save User Roles opens a confirmation describing the account affected; confirming replaces that user's current role list. Users need a fresh sign-in for new permissions to apply. This tour does not save changes.",
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.access')) && canManageRoles(canScopedPermission),
    },
    {
      id: 'admin-access-role-permissions',
      anchor: 'admin.access.tab.roles',
      title: 'Set permissions for a role',
      body: 'In Role permissions, select a role and review its permissions and supported scopes grouped by resource. Save permissions and scopes confirms and replaces both together. Existing grants without scopes are shown as inactive and stay inactive until a supported scope is selected. This tour does not save changes.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.access')) && canManageRoles(canScopedPermission),
    },
    {
      id: 'admin-access-data-scopes',
      anchor: 'admin.access.tab.scopes',
      title: 'Limit data with permission scopes',
      body: 'Data scopes opens the same combined role editor. Each action offers only its supported scopes. SELF, TEAM, DEPARTMENT, and ALL have different reach. Permissions and scopes save together; ALL requires a danger confirmation because it applies across the company. This tour does not save changes.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.access')) && canManageRoles(canScopedPermission),
    },
    {
      id: 'admin-access-reload-catalog',
      anchor: 'admin.access.reload-catalog',
      title: 'Reload the role and permission catalog',
      body: 'Reload catalog fetches the current users, roles, and permission catalog again. It does not change assignments or scope rules.',
      isVisible: ({ canCapability, canScopedPermission }) =>
        Boolean(canCapability?.('route.admin.access')) && canManageRoles(canScopedPermission),
    },
  ],
};
