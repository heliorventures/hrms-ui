import { useMemo, type PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { authorizationStateKey, createPermissionService } from '../auth/permissionService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { useAccessibleNavigation } from '../navigation/useAccessibleNavigation';

import { createApplicationOverviewTour } from './ApplicationOverviewTour';
import { visibleGuidanceTabs } from './featureDestinations';
import GuidanceLifecycle from './GuidanceLifecycle';
import { matchedTenantRoute } from './matchedTenantRoute';
import { useProfileGuidanceAccess } from './ProfileGuidanceContext';
import { ProfileGuidanceProvider } from './ProfileGuidanceProvider';
import { profileGuidanceTarget } from './profileGuidanceTarget';
import { navigateTourStep, watchGuidanceForms } from './tourNavigation';
import type { TourStep } from './tourTypes';

const TenantGuidanceContent = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const navigate = useNavigate();
  watchGuidanceForms();
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
  const profileAccess = useProfileGuidanceAccess(
    profileGuidanceTarget(routePath, location.pathname, clientSession?.employeeId)
  );
  const overviewTour = useMemo(
    () => createApplicationOverviewTour(accessibleDestinations),
    [accessibleDestinations]
  );
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const activeTab = requestedTab ?? (routePath === 'notifications' ? 'private' : null);
  const tourContext = useMemo(
    () => ({
      hasEmployeeProfile: Boolean(clientSession?.employeeId),
      profileAccess,
      canPermission: permissionService.canPermission,
      canCapability: permissionService.canCapability,
      canScopedPermission: permissionService.canScopedPermission,
      activeTab,
      allowedTabIds: (path: string) =>
        visibleGuidanceTabs(path, {
          routePath: path,
          ...permissionService,
          hasEmployeeProfile: Boolean(clientSession?.employeeId),
          profileAccess,
        }),
    }),
    [activeTab, clientSession?.employeeId, permissionService, profileAccess]
  );
  const authorizationKey = authorizationStateKey(clientSession);

  return (
    <GuidanceLifecycle
      matchedRoutePath={routePath}
      overviewTour={overviewTour}
      identityKey={identityKey}
      authorizationKey={authorizationKey}
      tourContext={tourContext}
      navigateStep={(step: TourStep, confirmed?: boolean) =>
        navigateTourStep(
          routePath?.includes(':') && step.destination
            ? {
                ...step,
                destination: {
                  ...step.destination,
                  path: step.destination.path.replace(`/${routePath}`, location.pathname),
                },
              }
            : step,
          {
            ...tourContext,
            currentPath: location.pathname + location.search,
            routePath,
            canAccessPath: (path) =>
              permissionService.canRoute(new URL(path, 'https://hrms.invalid').pathname),
          },
          (path) => navigate(path, { preventScrollReset: true }),
          confirmed
        ).status === 'ready'
      }
    >
      {children}
    </GuidanceLifecycle>
  );
};

const TenantGuidanceProvider = ({ children }: PropsWithChildren) => (
  <ProfileGuidanceProvider>
    <TenantGuidanceContent>{children}</TenantGuidanceContent>
  </ProfileGuidanceProvider>
);
export default TenantGuidanceProvider;
