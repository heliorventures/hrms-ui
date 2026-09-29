import { useMemo, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { authorizationStateKey, createPermissionService } from '../auth/permissionService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { useAccessibleNavigation } from '../navigation/useAccessibleNavigation';

import { createApplicationOverviewTour } from './ApplicationOverviewTour';
import GuidanceLifecycle from './GuidanceLifecycle';
import { matchedTenantRoute } from './matchedTenantRoute';

const TenantGuidanceProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const { clientSession, isAuthenticated, user } = useAuth();
  const { currentTenant, resolutionStatus } = useTenant();
  const accessibleDestinations = useAccessibleNavigation();
  const permissionService = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const isShellReady =
    isAuthenticated &&
    Boolean(user?.id) &&
    Boolean(clientSession) &&
    Boolean(currentTenant.id) &&
    resolutionStatus === 'resolved';
  const identityKey = isShellReady ? JSON.stringify([currentTenant.id, user?.id]) : null;
  const routePath = matchedTenantRoute(location.pathname);
  const overviewTour = useMemo(
    () => createApplicationOverviewTour(accessibleDestinations),
    [accessibleDestinations]
  );
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const activeTab = requestedTab ?? (routePath === 'notifications' ? 'private' : null);
  const tourContext = useMemo(
    () => ({
      hasEmployeeProfile: Boolean(clientSession?.employeeId),
      canPermission: permissionService.canPermission,
      canCapability: permissionService.canCapability,
      canScopedPermission: permissionService.canScopedPermission,
      activeTab,
    }),
    [activeTab, clientSession?.employeeId, permissionService]
  );
  const authorizationKey = authorizationStateKey(clientSession);

  return (
    <GuidanceLifecycle
      matchedRoutePath={routePath}
      overviewTour={overviewTour}
      identityKey={identityKey}
      authorizationKey={authorizationKey}
      tourContext={tourContext}
    >
      {children}
    </GuidanceLifecycle>
  );
};

export default TenantGuidanceProvider;
