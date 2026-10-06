import type { PermissionCode } from '../auth/permissions';
import type { Capability, ExplicitPermissionScope } from '../auth/permissionService';

import type { TourContext } from './tourTypes';

export type FeatureAccess = {
  capability?: Capability;
  permission?: PermissionCode;
  scopes?: readonly ExplicitPermissionScope[];
  requiresEmployeeProfile?: boolean;
  isVisible?: (context: TourContext) => boolean;
};
export type FeatureDefinition = {
  id: string;
  routePath: string;
  pageTitle: string;
  label: string;
  tabId?: string;
  path: string;
  anchor?: string;
  keywords: readonly string[];
  access: FeatureAccess;
  tourStepIds: readonly string[];
  helpTaskIds: readonly string[];
};
export type FeatureAccessContext = TourContext & {
  currentPath?: string;
  canAccessPath: (path: string) => boolean;
  allowedTabIds: (routePath: string) => readonly string[] | undefined;
};
