import { useMemo } from 'react';

import { canAccessTenantPath } from '../auth/navAccess';
import { createPermissionService } from '../auth/permissionService';
import { useAuth } from '../contexts/AuthContext';
import { availableReports } from '../modules/reports/reportCatalog';

import { hasDestinationPermission } from './navigationAuthorization';
import { NAVIGATION_DESTINATIONS } from './navigationModel';
import { accessibleDestinations } from './navigationSelectors';

export function useAccessibleNavigation() {
  const { can, clientSession } = useAuth();
  return useMemo(() => {
    const permissions = createPermissionService(clientSession);
    return accessibleDestinations(
      NAVIGATION_DESTINATIONS,
      (path) => canAccessTenantPath(path, { can, clientSession }),
      (domain) => availableReports(clientSession, domain).length > 0
    ).filter((destination) => hasDestinationPermission(destination, permissions));
  }, [can, clientSession]);
}
