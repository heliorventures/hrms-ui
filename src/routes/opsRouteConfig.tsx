import { Navigate } from 'react-router-dom';
import OpsBillingPage from '../modules/ops/OpsBillingPage';
import OpsFeatureFlagsPage from '../modules/ops/OpsFeatureFlagsPage';
import OpsModulesPage from '../modules/ops/OpsModulesPage';
import OpsOperatorsPage from '../modules/ops/OpsOperatorsPage';
import OpsTenantsPage from '../modules/ops/OpsTenantsPage';
import type { AppChildRoute } from './appRouteConfig';

export const OPS_CHILD_ROUTES: AppChildRoute[] = [
  { index: true, element: <Navigate to="/ops/tenants" replace /> },
  { path: 'tenants', element: <OpsTenantsPage /> },
  { path: 'modules', element: <OpsModulesPage /> },
  { path: 'billing', element: <OpsBillingPage /> },
  { path: 'operators', element: <OpsOperatorsPage /> },
  { path: 'feature-flags', element: <OpsFeatureFlagsPage /> },
  { path: '*', element: <Navigate to="/ops/tenants" replace /> },
];
