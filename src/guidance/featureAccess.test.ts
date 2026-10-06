import { describe, expect, it } from 'vitest';

import { accessibleFeatures } from './featureAccess';
import type { FeatureAccessContext, FeatureDefinition } from './featureTypes';

const feature: FeatureDefinition = {
  id: 'travel-submit',
  routePath: 'expenses',
  pageTitle: 'Expenses & Travel',
  label: 'Request travel',
  path: '/expenses?tab=travel',
  tabId: 'travel',
  keywords: ['trip'],
  access: { capability: 'action.travel.submit', requiresEmployeeProfile: true },
  tourStepIds: [],
  helpTaskIds: [],
};
const context: FeatureAccessContext = {
  routePath: 'expenses',
  canAccessPath: () => true,
  hasEmployeeProfile: true,
  canCapability: () => true,
  canScopedPermission: () => true,
  allowedTabIds: () => ['expenses', 'travel'],
};
describe('feature access', () => {
  it('requires action capability and visible tab in addition to route access', () => {
    expect(accessibleFeatures([feature], { ...context, canCapability: () => false })).toEqual([]);
    expect(
      accessibleFeatures([feature], { ...context, allowedTabIds: () => ['expenses'] })
    ).toEqual([]);
    expect(accessibleFeatures([feature], { ...context, hasEmployeeProfile: false })).toEqual([]);
    expect(accessibleFeatures([feature], context)).toEqual([feature]);
  });
  it('removes feature help immediately when its route or module is revoked', () => {
    expect(accessibleFeatures([feature], { ...context, canAccessPath: () => false })).toEqual([]);
  });
  it('uses exact scopes and rejects unsafe or action-opening destinations', () => {
    const scoped = {
      ...feature,
      access: { permission: 'expense:read' as const, scopes: ['ALL'] as const },
    };
    expect(
      accessibleFeatures([scoped], {
        ...context,
        canScopedPermission: (_p, s) => !s?.includes('ALL'),
      })
    ).toEqual([]);
    for (const path of [
      'https://example.com',
      '//example.com',
      '/leave?apply=1',
      '/expenses?tab=hidden',
    ]) {
      expect(accessibleFeatures([{ ...feature, path }], context)).toEqual([]);
    }
  });
});
