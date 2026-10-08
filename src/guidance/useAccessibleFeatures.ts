import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { canAccessTenantPath } from '../auth/navAccess';
import { authorizationStateKey, createPermissionService } from '../auth/permissionService';
import { useAuth } from '../contexts/AuthContext';

import { accessibleFeatures } from './featureAccess';
import { visibleGuidanceTabs } from './featureDestinations';
import { FEATURE_REGISTRY } from './featureRegistry';
import type { FeatureAccessContext } from './featureTypes';
import { matchedTenantRoute } from './matchedTenantRoute';
import { useProfileGuidanceAccess } from './ProfileGuidanceContext';
import { profileGuidanceTarget } from './profileGuidanceTarget';

export const useAccessibleFeatures = () => {
  const { can, clientSession, tenantId, user } = useAuth();
  const location = useLocation();
  const profileAccess = useProfileGuidanceAccess(
    profileGuidanceTarget(
      matchedTenantRoute(location.pathname),
      location.pathname,
      clientSession?.employeeId
    )
  );
  return useMemo(() => {
    const permissions = createPermissionService(clientSession);
    const context: FeatureAccessContext = {
      ...permissions,
      routePath: matchedTenantRoute(location.pathname),
      hasEmployeeProfile: Boolean(clientSession?.employeeId),
      profileAccess,
      activeTab: new URLSearchParams(location.search).get('tab'),
      canAccessPath: (path) =>
        canAccessTenantPath(new URL(path, 'https://hrms.invalid').pathname, { can, clientSession }),
      allowedTabIds: (path) =>
        visibleGuidanceTabs(path, {
          ...permissions,
          routePath: path,
          hasEmployeeProfile: Boolean(clientSession?.employeeId),
          profileAccess,
        }),
    };
    const candidates = FEATURE_REGISTRY.map((feature) => {
      if (!feature.routePath.includes(':')) return feature;
      if (context.routePath !== feature.routePath) return null;
      return {
        ...feature,
        path: feature.path.replace(`/${feature.routePath}`, location.pathname),
      };
    }).filter((feature): feature is NonNullable<typeof feature> => feature !== null);
    const features = accessibleFeatures(candidates, context);
    return {
      features,
      context,
      identityKey: JSON.stringify([tenantId, user?.id, authorizationStateKey(clientSession)]),
    };
  }, [can, clientSession, location.pathname, location.search, tenantId, user?.id, profileAccess]);
};
