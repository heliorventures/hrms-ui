import type { AppChildRoute } from './routeTypes';

export const OPS_CHILD_ROUTES: AppChildRoute[] = [
  { kind: 'redirect', index: true, to: '/ops/tenants' },
  {
    kind: 'page',
    path: 'tenants',
    title: 'Tenants',
    load: () => import('../modules/ops/OpsTenantsPage'),
  },
  {
    kind: 'page',
    path: 'modules',
    title: 'Modules and subscriptions',
    load: () => import('../modules/ops/OpsModulesPage'),
  },
  {
    kind: 'page',
    path: 'billing',
    title: 'Billing',
    load: () => import('../modules/ops/OpsBillingPage'),
  },
  {
    kind: 'page',
    path: 'operators',
    title: 'Operator users',
    load: () => import('../modules/ops/OpsOperatorsPage'),
  },
  {
    kind: 'page',
    path: 'feature-flags',
    title: 'Feature flags',
    load: () => import('../modules/ops/OpsFeatureFlagsPage'),
  },
];
