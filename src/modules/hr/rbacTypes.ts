import type { RbacAdminBoardQuery } from '../../api/graphql/graphql';

export type RbacAccessTab = 'users' | 'roles' | 'scopes';

export interface RbacScopeRow {
  resource: string;
  action: string;
  scopeType: string;
}

export interface RbacUserRow {
  id: string;
  username: string;
  email?: string | null;
  isActive: boolean;
}
export type RbacRoleRow = RbacAdminBoardQuery['tenantDirectoryRoles'][number];
export type RbacPermissionRow = RbacAdminBoardQuery['tenantCatalogPermissions'][number];

export const RBAC_TABS: RbacAccessTab[] = ['users', 'roles', 'scopes'];
export const RBAC_SCOPE_TYPES = ['SELF', 'TEAM', 'DEPARTMENT', 'ALL'] as const;
