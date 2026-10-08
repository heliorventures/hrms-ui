import { adminGuidanceTabs, adminStepDestinations } from '../modules/admin/guidance/features';
import {
  expenseGuidanceTabs,
  expenseStepDestinations,
} from '../modules/expenses/guidance/features';
import {
  notificationGuidanceTabs,
  notificationStepDestinations,
} from '../modules/notifications/guidance/features';
import {
  organizationGuidanceTabs,
  organizationStepDestinations,
} from '../modules/organization/guidance/features';
import { payrollGuidanceTabs, payrollStepDestinations } from '../modules/payroll/guidance/features';
import { profileGuidanceTabs, profileStepDestinations } from '../modules/profile/guidance/features';
import {
  workplaceGuidanceTabs,
  workplaceStepDestinations,
} from '../modules/workplace/guidance/features';

import type { TourContext, TourDefinition } from './tourTypes';

export const GUIDANCE_TAB_SETS = [
  ...profileGuidanceTabs,
  ...adminGuidanceTabs,
  ...expenseGuidanceTabs,
  ...organizationGuidanceTabs,
  ...payrollGuidanceTabs,
  ...workplaceGuidanceTabs,
  ...notificationGuidanceTabs,
];
export const STEP_DESTINATIONS = {
  ...profileStepDestinations,
  ...adminStepDestinations,
  ...expenseStepDestinations,
  ...organizationStepDestinations,
  ...payrollStepDestinations,
  ...workplaceStepDestinations,
  ...notificationStepDestinations,
};
export const visibleGuidanceTabs = (routePath: string, context: TourContext) => {
  return GUIDANCE_TAB_SETS.find((set) => set.routePaths.includes(routePath))
    ?.tabs.filter((tab) => tab.isVisible?.(context) ?? true)
    .map((tab) => tab.id);
};
export const withFeatureDestinations = (tour: TourDefinition): TourDefinition => {
  const routePath = tour.routePaths[0];
  const tabSet = GUIDANCE_TAB_SETS.find((set) => set.routePaths.includes(routePath));
  const steps = tour.steps.map((step) => {
    const destination = STEP_DESTINATIONS[step.id];
    if (!destination?.tabId || step.destination) return step;
    const path = `/${routePath}?tab=${encodeURIComponent(destination.tabId)}`;
    return {
      ...step,
      destination: { path, tabId: destination.tabId, anchor: step.anchor ?? undefined },
    };
  });
  const tabSteps = (tabSet?.tabs ?? [])
    .filter((tab) => !steps.some((step) => step.destination?.tabId === tab.id))
    .map((tab) => ({
      id: `${tour.id}-tab-${tab.id}`,
      anchor: tabSet?.anchor ?? null,
      title: tab.label,
      body: tab.body,
      destination: { path: `/${routePath}?tab=${encodeURIComponent(tab.id)}`, tabId: tab.id },
      isVisible: tab.isVisible,
    }));
  return { ...tour, steps: [...steps, ...tabSteps] };
};
