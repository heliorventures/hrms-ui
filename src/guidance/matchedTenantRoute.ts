import { matchPath } from 'react-router-dom';

import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';
import type { RoutePage } from '../routes/routeTypes';

export function matchedTenantRoute(pathname: string): string | null {
  return (
    TENANT_APP_ROUTES.filter((route): route is RoutePage => route.kind === 'page')
      .filter((route) => matchPath({ path: `/${route.path}`, end: true }, pathname))
      .sort((left, right) => right.path.length - left.path.length)[0]?.path ?? null
  );
}
