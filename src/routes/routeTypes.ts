import type { ComponentType } from 'react';

import type { Capability } from '../auth/permissionService';

export interface RoutePage {
  kind: 'page';
  path: string;
  title: string;
  load: () => Promise<{ default: ComponentType }>;
  tenantPath?: string;
  payrollCapability?: Capability;
}

export interface RouteRedirect {
  kind: 'redirect';
  path?: string;
  index?: boolean;
  to: string;
  tenantPath?: string;
  payrollCapability?: Capability;
}

export type AppChildRoute = RoutePage | RouteRedirect;
