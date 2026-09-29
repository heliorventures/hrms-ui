import { expect, it } from 'vitest';

import { appearanceTour } from '../appearance/guidance/AppearanceTour';
import { dashboardTour } from '../modules/dashboard/guidance/DashboardTour';
import { insightsTour } from '../modules/insights/guidance/InsightsTour';
import { myWorkCompletedTour, myWorkTasksTour } from '../modules/my-work/guidance/MyWorkTour';
import { notificationsTour } from '../modules/notifications/guidance/NotificationsTour';
import { profileSettingsTour } from '../modules/profile/guidance/ProfileSettingsTour';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import type { TourContext, TourDefinition, TourStep } from './tourTypes';

const visibleSteps = (definition: TourDefinition, context: TourContext): TourStep[] =>
  definition.steps.filter((step) => step.isVisible?.(context) ?? true);

const ids = (steps: TourStep[]) => steps.map(({ id }) => id);

const context = (
  routePath: string,
  capabilities: readonly string[] = [],
  scopedPermissions: readonly string[] = [],
  activeTab?: string
): TourContext => {
  const availableCapabilities = new Set(capabilities);
  const availableScopedPermissions = new Set(scopedPermissions);
  return {
    routePath,
    activeTab,
    canCapability: (capability) => availableCapabilities.has(capability),
    canScopedPermission: (permission, scopes) =>
      (scopes ?? []).some((scope) => availableScopedPermissions.has(`${permission}:${scope}`)),
  };
};

it('registers each Task 5 tenant route with an anchored page introduction', () => {
  const cases: [TourDefinition, string, string][] = [
    [appearanceTour, 'appearance', 'appearance-sections'],
    [dashboardTour, 'dashboard', 'dashboard-welcome'],
    [myWorkTasksTour, 'my-work/tasks', 'my-work-task-list'],
    [myWorkCompletedTour, 'my-work/completed', 'my-work-completed-list'],
    [insightsTour, 'insights', 'insights-tabs'],
    [notificationsTour, 'notifications', 'notifications-tabs'],
    [profileSettingsTour, 'profile/settings', 'profile-record'],
  ];
  const tenantPagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
    (route) => route.path
  );

  for (const [definition, routePath, introStepId] of cases) {
    expect(tenantPagePaths).toContain(routePath);
    expect(definition.routePaths).toContain(routePath);
    expect(definition.steps.find((step) => step.id === introStepId)?.anchor).toBeTruthy();
    expect(definition.steps.every((step) => step.anchor !== null)).toBe(true);
  }
});

it('explains appearance preview, save, and reset controls', () => {
  expect(ids(visibleSteps(appearanceTour, { routePath: 'appearance' }))).toEqual([
    'appearance-sections',
    'appearance-mode',
    'appearance-colors',
    'appearance-reset',
    'appearance-save',
  ]);
});

it('shows dashboard punch and leave steps only for the matching capabilities', () => {
  const employeeSteps = ids(
    visibleSteps(dashboardTour, {
      ...context('dashboard', ['action.attendance.punch', 'action.leave.submit']),
    })
  );
  const readOnlySteps = ids(visibleSteps(dashboardTour, context('dashboard')));

  expect(employeeSteps).toContain('dashboard-punch');
  expect(employeeSteps).toContain('dashboard-request-leave');
  expect(readOnlySteps).not.toContain('dashboard-punch');
  expect(readOnlySteps).not.toContain('dashboard-request-leave');
  expect(readOnlySteps).not.toContain('dashboard-your-day');
});

it('filters My Work actions by self permissions and keeps task and archive routes distinct', () => {
  const allPermissions = ['performance:self:SELF', 'survey:respond:SELF'];
  const taskIds = ids(visibleSteps(myWorkTasksTour, context('my-work/tasks', [], allPermissions)));
  const restrictedTaskIds = ids(visibleSteps(myWorkTasksTour, context('my-work/tasks')));
  const completedIds = ids(
    visibleSteps(myWorkCompletedTour, {
      ...context('my-work/completed', [], allPermissions),
    })
  );
  const restrictedCompletedIds = ids(
    visibleSteps(myWorkCompletedTour, {
      ...context('my-work/completed'),
    })
  );

  expect(taskIds).toContain('my-work-performance');
  expect(taskIds).toContain('my-work-survey');
  expect(restrictedTaskIds).not.toContain('my-work-performance');
  expect(restrictedTaskIds).not.toContain('my-work-survey');
  expect(completedIds).toContain('my-work-view-review');
  expect(restrictedCompletedIds).not.toContain('my-work-view-review');
  expect(myWorkTasksTour.routePaths).not.toEqual(myWorkCompletedTour.routePaths);
});

it('hides Insights actions without analytics access and gates Workplace by succession access', () => {
  const noAccess = ids(visibleSteps(insightsTour, context('insights')));
  const hrAccess = ids(visibleSteps(insightsTour, context('insights', ['route.insights'])));
  const workplaceAccess = ids(
    visibleSteps(
      insightsTour,
      context('insights', ['route.insights', 'route.workplace.succession'])
    )
  );

  expect(noAccess).toEqual([]);
  expect(hrAccess).toContain('insights-report-details');
  expect(hrAccess).not.toContain('insights-workplace');
  expect(workplaceAccess).toContain('insights-workplace');
});

it('explains notification actions only for their active tab and permission level', () => {
  const privateTab = ids(
    visibleSteps(
      notificationsTour,
      context('notifications', ['action.notifications.manage'], [], 'private')
    )
  );
  const employeeAnnouncements = ids(
    visibleSteps(notificationsTour, context('notifications', [], [], 'announcements'))
  );
  const hrAnnouncements = ids(
    visibleSteps(
      notificationsTour,
      context('notifications', ['action.notifications.manage'], [], 'announcements')
    )
  );

  expect(privateTab).toContain('notifications-mark-all-read');
  expect(privateTab).not.toContain('notifications-compose-announcement');
  expect(employeeAnnouncements).toContain('notifications-compose-team-post');
  expect(employeeAnnouncements).not.toContain('notifications-admin-console');
  expect(hrAnnouncements).toContain('notifications-compose-announcement');
  expect(hrAnnouncements).toContain('notifications-admin-console');
  expect(hrAnnouncements).not.toContain('notifications-compose-team-post');
});

it('covers employee profile sections and password settings', () => {
  const profileIds = ids(visibleSteps(profileSettingsTour, context('profile/settings')));

  expect(profileIds).toContain('profile-personal-info');
  expect(profileIds).toContain('profile-banking');
  expect(profileIds).toContain('profile-documents');
  expect(profileIds).toContain('profile-security');
  expect(profileIds).toContain('profile-password-form');

  const profileSectionSteps = profileSettingsTour.steps.slice(0, 4);
  expect(profileSectionSteps.map((step) => step.anchor)).toEqual([
    'profile-settings-navigation',
    'profile-settings-navigation',
    'profile-settings-navigation',
    'profile-settings-navigation',
  ]);
  expect(profileSectionSteps.every((step) => /if your login is linked/i.test(step.body))).toBe(
    true
  );

  const securitySteps = profileSettingsTour.steps.filter((step) =>
    ['profile-security', 'profile-password-form'].includes(step.id)
  );
  expect(securitySteps.map((step) => step.anchor)).toEqual([
    'profile-settings-navigation',
    'profile-settings-navigation',
  ]);
  expect(securitySteps[1]?.body).toMatch(/after this tour, select Security settings/i);
});
