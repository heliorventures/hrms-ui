import type { FeatureAccessContext, FeatureDefinition } from './featureTypes';

export const safeFeaturePath = (path: string): boolean => {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\\u0000-\u001f]/.test(path))
    return false;
  const url = new URL(path, 'https://hrms.invalid');
  return (
    url.origin === 'https://hrms.invalid' &&
    !['apply', 'submit', 'approve', 'delete', 'save'].some((key) => url.searchParams.has(key))
  );
};

export const isFeatureAccessible = (
  feature: FeatureDefinition,
  context: FeatureAccessContext
): boolean => {
  const { access } = feature;
  if (!safeFeaturePath(feature.path) || !context.canAccessPath(feature.path)) return false;
  if (access.requiresEmployeeProfile && !context.hasEmployeeProfile) return false;
  if (access.capability && !context.canCapability?.(access.capability)) return false;
  if (access.permission && !context.canScopedPermission?.(access.permission, access.scopes))
    return false;
  const requestedTab = new URL(feature.path, 'https://hrms.invalid').searchParams.get('tab');
  if (requestedTab && requestedTab !== feature.tabId) return false;
  if (feature.tabId && !context.allowedTabIds(feature.routePath)?.includes(feature.tabId))
    return false;
  return (
    access.isVisible?.({
      ...context,
      routePath: feature.routePath,
      activeTab: feature.tabId ?? context.activeTab,
    }) ?? true
  );
};

export const accessibleFeatures = (
  features: readonly FeatureDefinition[],
  context: FeatureAccessContext
) => {
  return features.filter((feature) => isFeatureAccessible(feature, context));
};
