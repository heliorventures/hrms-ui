import type { PermissionCode } from '../auth/permissions';
import type { Capability, ExplicitPermissionScope } from '../auth/permissionService';

/** Information a page tour may use to select permission and tab specific steps. */
export type TourContext = {
  routePath: string | null;
  hasEmployeeProfile?: boolean;
  canPermission?: (permission: PermissionCode) => boolean;
  canCapability?: (capability: Capability) => boolean;
  canScopedPermission?: (
    permission: PermissionCode,
    allowedScopes?: readonly ExplicitPermissionScope[]
  ) => boolean;
  activeTab?: string | null;
};

export type TourStep = {
  id: string;
  /** Stable value of a page element's data-tour-anchor attribute. */
  anchor: string | null;
  title: string;
  body: string;
  /** Omit a step when its action is unavailable to the current user. */
  isVisible?: (context: TourContext) => boolean;
};

export type TourDefinition = {
  id: string;
  /** Matched tenant route identities. Multiple paths support contextual aliases. */
  routePaths: readonly string[];
  steps: readonly TourStep[];
};

export type ActiveTourKind = 'page' | 'overview';

export type ActiveTour = {
  definition: TourDefinition;
  kind: ActiveTourKind;
  /** Only the first-login overview writes dismissal when the user closes it. */
  persistDismissalOnClose?: boolean;
};
