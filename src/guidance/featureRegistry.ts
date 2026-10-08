import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { STEP_DESTINATIONS } from './featureDestinations';
import type { FeatureDefinition } from './featureTypes';
import { TOUR_REGISTRY } from './tourRegistry';

/** Use the same owning tour predicate for search and help, including exact scopes. */
export const FEATURE_REGISTRY: readonly FeatureDefinition[] = TOUR_REGISTRY.flatMap((tour) =>
  tour.routePaths.flatMap((routePath) => {
    const route = TENANT_APP_ROUTES.find((item) => item.path === routePath);
    if (!route || route.kind !== 'page') return [];
    return tour.steps.map((step) => ({
      id: `${routePath}:${step.id}`,
      routePath,
      pageTitle: route.title,
      label: step.title,
      path:
        step.destination?.path?.replace(`/${tour.routePaths[0]}`, `/${routePath}`) ??
        `/${routePath}`,
      tabId: step.destination?.tabId,
      anchor: step.anchor ?? undefined,
      keywords: [step.title, route.title, ...(STEP_DESTINATIONS[step.id]?.keywords ?? [])],
      access: { isVisible: step.isVisible },
      tourStepIds: [step.id],
      helpTaskIds: [`${routePath}:${step.id}:help`],
    }));
  })
);

export const matchFeatures = (features: readonly FeatureDefinition[], query: string) => {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return features.filter((feature) =>
    tokens.every((token) =>
      [feature.label, feature.pageTitle, ...feature.keywords]
        .join(' ')
        .toLocaleLowerCase()
        .includes(token)
    )
  );
};
