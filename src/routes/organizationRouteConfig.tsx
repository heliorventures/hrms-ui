import type { AppChildRoute } from './routeTypes';

export const ORGANIZATION_ROUTES: AppChildRoute[] = [
  {
    kind: 'page',
    path: 'organization-workspace',
    title: 'Organization workspace',
    tenantPath: '/organization-workspace',
    load: () => import('../modules/organization-workspace/OrganizationWorkspacePage'),
  },
];
