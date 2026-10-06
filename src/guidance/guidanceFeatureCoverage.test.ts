import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import coverage from '../../docs/guidance/coverage.json';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { GUIDANCE_TAB_SETS } from './featureDestinations';
import { FEATURE_REGISTRY, matchFeatures } from './featureRegistry';
import { HELP_TASKS } from './help/helpRegistry';
import manifest from './help/screenshotManifest.json';
import { TOUR_REGISTRY } from './tourRegistry';

describe('feature and instruction coverage', () => {
  it('covers every static tab found in the source AST inventory', () => {
    for (const route of coverage.routes) {
      const declared = GUIDANCE_TAB_SETS.find((set) => set.routePaths.includes(route.routePath));
      for (const tab of route.tabs)
        expect(
          declared?.tabs.some((item) => item.id === tab.id),
          `${route.routePath}/${tab.id}`
        ).toBe(true);
    }
  });
  it('maps every tenant route and declared destination tab to a tour and help task', () => {
    expect(new Set(FEATURE_REGISTRY.map((f) => f.id)).size).toBe(FEATURE_REGISTRY.length);
    for (const route of TENANT_APP_ROUTES.filter((item) => item.kind === 'page')) {
      const features = FEATURE_REGISTRY.filter((f) => f.routePath === route.path);
      expect(features.length, route.path).toBeGreaterThan(0);
      for (const feature of features) {
        expect(
          HELP_TASKS.some((task) => task.featureId === feature.id && task.steps.length >= 3)
        ).toBe(true);
        expect(
          TOUR_REGISTRY.some(
            (tour) =>
              tour.routePaths.includes(route.path) &&
              tour.steps.some((step) => feature.tourStepIds.includes(step.id))
          )
        ).toBe(true);
      }
      for (const tab of GUIDANCE_TAB_SETS.find((set) => set.routePaths.includes(route.path))
        ?.tabs ?? []) {
        expect(
          features.some((f) => f.tabId === tab.id),
          `${route.path}/${tab.id}`
        ).toBe(true);
      }
    }
  });
  it('finds specific tasks and uses real report query parameters without opening actions', () => {
    expect(
      matchFeatures(FEATURE_REGISTRY, 'second fourth saturday').some((f) =>
        f.tourStepIds.includes('attendance-policy-weekly-offs')
      )
    ).toBe(true);
    expect(
      matchFeatures(FEATURE_REGISTRY, 'claim expense reports').some(
        (f) => f.path === '/admin/reports?domain=expenses&report=EXPENSE_CLAIMS'
      )
    ).toBe(true);
    expect(
      FEATURE_REGISTRY.every((f) => !f.path.includes('apply=') && !f.path.includes('submit='))
    ).toBe(true);
  });
  it('ships traceable design illustrations without labelling them live screenshots', () => {
    for (const screenshot of manifest) {
      expect(screenshot.kind).toBe('design-illustration');
      expect(screenshot.caption).toMatch(/Design illustration/);
      const bytes = readFileSync(new URL(`../../public${screenshot.src}`, import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(screenshot.sha256);
    }
  });
});
