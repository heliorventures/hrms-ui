import { useMemo } from 'react';

import { canAccessTenantPath } from '../auth/navAccess';
import { useAuth } from '../contexts/AuthContext';
import { availableReports } from '../modules/reports/reportCatalog';

import { NAVIGATION_DESTINATIONS } from './navigationModel';
import { accessibleDestinations } from './navigationSelectors';

export function useAccessibleNavigation() {
  const { can, clientSession } = useAuth();
  return useMemo(
    () =>
      accessibleDestinations(
        NAVIGATION_DESTINATIONS,
        (path) => canAccessTenantPath(path, { can, clientSession }),
        (domain) => availableReports(clientSession, domain).length > 0
      ),
    [can, clientSession]
  );
}
