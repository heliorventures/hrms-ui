// @vitest-environment jsdom

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { adminAttendancePolicyPageTour } from '../modules/admin/guidance/AdminAttendancePolicyPageTour';
import { adminEmployeesPageTour } from '../modules/admin/guidance/AdminEmployeesPageTour';
import { adminExpenseCategoriesPageTour } from '../modules/admin/guidance/AdminExpenseCategoriesPageTour';
import { adminHrTimesheetSettingsPageTour } from '../modules/admin/guidance/AdminHrTimesheetSettingsPageTour';
import { adminLeaveSettingsPageTour } from '../modules/admin/guidance/AdminLeaveSettingsPageTour';
import { adminNotificationsPageTour } from '../modules/admin/guidance/AdminNotificationsPageTour';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { TourOverlay } from './TourOverlay';
import type { TourContext, TourDefinition, TourStep } from './tourTypes';

const visibleRect = {
  bottom: 120,
  height: 40,
  left: 80,
  right: 240,
  top: 80,
  width: 160,
  x: 80,
  y: 80,
  toJSON: () => ({}),
} as DOMRect;
const visibleRects = [visibleRect] as unknown as DOMRectList;

const tours = [
  adminLeaveSettingsPageTour,
  adminExpenseCategoriesPageTour,
  adminNotificationsPageTour,
  adminEmployeesPageTour,
  adminAttendancePolicyPageTour,
  adminHrTimesheetSettingsPageTour,
];

const visibleSteps = (tour: TourDefinition, context: TourContext): TourStep[] =>
  tour.steps.filter((step) => step.isVisible?.(context) ?? true);

const ids = (steps: TourStep[]) => steps.map(({ id }) => id);

const context = (
  routePath: string,
  capabilities: readonly string[] = [],
  scopedPermissions: readonly string[] = []
): TourContext => {
  const availableCapabilities = new Set(capabilities);
  const availableScopedPermissions = new Set(scopedPermissions);
  return {
    routePath,
    canCapability: (capability) => availableCapabilities.has(capability),
    canScopedPermission: (permission, scopes) =>
      (scopes ?? []).some((scope) => availableScopedPermissions.has(`${permission}:${scope}`)),
  };
};

function singleStep(tour: TourDefinition, stepId: string): TourDefinition {
  const step = tour.steps.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`Tour step ${stepId} is missing`);
  return { ...tour, steps: [step] };
}

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
  document.body.style.overflow = '';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(document.documentElement, 'getClientRects').mockReturnValue(visibleRects);
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(visibleRects);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(visibleRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

it('covers each requested tenant route and reuses the employee directory alias', () => {
  const pagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
    (route) => route.path
  );
  const requestedPaths = [
    'admin/leave-settings',
    'admin/expense-categories',
    'admin/notifications',
    'admin/employees',
    'admin/attendance-policy',
    'admin/timesheet-settings',
  ];

  expect(tours.flatMap((tour) => tour.routePaths)).toEqual([
    'admin/leave-settings',
    'admin/expense-categories',
    'admin/notifications',
    'hr/people',
    'admin/employees',
    'admin/attendance-policy',
    'admin/timesheet-settings',
  ]);
  for (const routePath of requestedPaths) expect(pagePaths).toContain(routePath);
  expect(adminEmployeesPageTour.routePaths).toEqual(['hr/people', 'admin/employees']);

  for (const tour of tours) {
    expect(tour.steps.length).toBeGreaterThan(1);
    expect(tour.steps.every((step) => step.anchor !== null)).toBe(true);
  }
});

it('selects leave, expense, communications, and attendance actions through their page permissions', () => {
  const readOnly = context('admin/leave-settings');
  const leaveManager = context('admin/leave-settings', ['action.leave.manage']);
  const expenseManager = context('admin/expense-categories', ['action.expense.manage']);
  const noExpensePermission = context('admin/expense-categories');
  const notificationManager = context('admin/notifications', ['route.admin.notifications']);
  const noNotificationPermission = context('admin/notifications');
  const attendanceAdmin = context('admin/attendance-policy', ['route.admin.attendancePolicy']);

  expect(ids(visibleSteps(adminLeaveSettingsPageTour, readOnly))).not.toContain(
    'leave-settings-comp-off'
  );
  expect(ids(visibleSteps(adminLeaveSettingsPageTour, leaveManager))).toContain(
    'leave-settings-comp-off'
  );
  expect(ids(visibleSteps(adminExpenseCategoriesPageTour, expenseManager))).toEqual([
    'expense-categories-tabs',
    'expense-policy-matching',
  ]);
  expect(ids(visibleSteps(adminExpenseCategoriesPageTour, noExpensePermission))).toEqual([]);
  expect(ids(visibleSteps(adminNotificationsPageTour, notificationManager))).toEqual([
    'admin-notifications-announcements',
    'admin-notifications-direct',
    'admin-notifications-automation',
  ]);
  expect(ids(visibleSteps(adminNotificationsPageTour, noNotificationPermission))).toEqual([]);
  expect(ids(visibleSteps(adminAttendancePolicyPageTour, attendanceAdmin))).toEqual([
    'attendance-policy-boundary',
    'attendance-policy-punch-rules',
  ]);
  expect(
    ids(visibleSteps(adminAttendancePolicyPageTour, context('admin/attendance-policy')))
  ).toEqual([]);
});

it('keeps timesheet policy and catalog explanations on their actual permission paths', () => {
  const policyAdmin = context('admin/timesheet-settings', ['route.admin.timesheetSettings']);
  const catalogAdmin = context('admin/timesheet-settings', ['action.timesheet.manage']);
  const readOnly = context('admin/timesheet-settings');

  expect(ids(visibleSteps(adminHrTimesheetSettingsPageTour, policyAdmin))).toEqual([
    'timesheet-settings-adjustment',
  ]);
  expect(ids(visibleSteps(adminHrTimesheetSettingsPageTour, catalogAdmin))).toEqual([
    'timesheet-settings-adjustment',
    'timesheet-settings-locking',
    'timesheet-settings-projects',
    'timesheet-settings-task-types',
  ]);
  expect(ids(visibleSteps(adminHrTimesheetSettingsPageTour, readOnly))).toEqual([]);
});

it('selects the shared employee directory tour through either route permission', () => {
  const hrPeople = context('hr/people', ['route.hr.people']);
  const adminEmployees = context('admin/employees', ['route.admin.employees']);
  const noDirectoryAccess = context('admin/employees');

  expect(ids(visibleSteps(adminEmployeesPageTour, hrPeople))).toEqual([
    'employees-list',
    'employees-add-dialog',
    'employees-edit-dialog',
  ]);
  expect(ids(visibleSteps(adminEmployeesPageTour, adminEmployees))).toEqual([
    'employees-list',
    'employees-add-dialog',
    'employees-edit-dialog',
  ]);
  expect(ids(visibleSteps(adminEmployeesPageTour, noDirectoryAccess))).not.toContain(
    'employees-add-dialog'
  );
  expect(ids(visibleSteps(adminEmployeesPageTour, noDirectoryAccess))).not.toContain(
    'employees-edit-dialog'
  );
});

it.each([
  [adminLeaveSettingsPageTour, 'leave-settings-policies', 'leave-settings.sections'],
  [adminExpenseCategoriesPageTour, 'expense-policy-matching', 'expense-categories.tabs'],
  [adminNotificationsPageTour, 'admin-notifications-direct', 'admin-notifications.tabs'],
  [
    adminAttendancePolicyPageTour,
    'attendance-policy-punch-rules',
    'attendance-policy.save-punch-rules',
  ],
  [adminHrTimesheetSettingsPageTour, 'timesheet-settings-projects', 'timesheet-settings.tabs'],
] as const)(
  'does not invoke a live settings mutation while %s is open',
  async (tour, stepId, anchor) => {
    const user = userEventLibrary.setup();
    const savePolicy = vi.fn();
    const root = document.getElementById('root');
    if (!root) throw new Error('Application root is unavailable');
    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = 'Save';
    action.setAttribute('data-tour-anchor', anchor);
    action.addEventListener('click', savePolicy);
    action.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') savePolicy();
    });
    root.append(action);

    render(
      <TourOverlay
        tour={singleStep(tour, stepId)}
        onClose={vi.fn()}
        returnFocusRef={createRef<HTMLElement>()}
      />
    );

    expect(root.hasAttribute('inert')).toBe(true);
    const spotlight = screen.getByTestId('tour-spotlight');
    fireEvent.pointerDown(spotlight);
    fireEvent.click(spotlight);
    await user.keyboard('{Enter}');

    expect(savePolicy).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(action);
  }
);
