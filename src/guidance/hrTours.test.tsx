// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { adminEmployeesPageTour } from '../modules/admin/guidance/AdminEmployeesPageTour';
import { hrAttendanceManagementPageTour } from '../modules/hr/guidance/HrAttendanceManagementPageTour';
import { hrHomePageTour } from '../modules/hr/guidance/HrHomePageTour';
import { hrLeavesPageTour } from '../modules/hr/guidance/HrLeavesPageTour';
import { hrTimesheetProjectAssignmentsPageTour } from '../modules/hr/guidance/HrTimesheetProjectAssignmentsPageTour';
import { hrTimesheetsPageTour } from '../modules/hr/guidance/HrTimesheetsPageTour';
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

const HR_TOURS: readonly TourDefinition[] = [
  hrHomePageTour,
  adminEmployeesPageTour,
  hrLeavesPageTour,
  hrAttendanceManagementPageTour,
  hrTimesheetsPageTour,
  hrTimesheetProjectAssignmentsPageTour,
];

const visibleSteps = (tour: TourDefinition, context: TourContext): TourStep[] =>
  tour.steps.filter((step) => step.isVisible?.(context) ?? true);

const ids = (steps: TourStep[]) => steps.map(({ id }) => id);

const context = (routePath: string, capabilities: readonly string[] = []): TourContext => {
  const availableCapabilities = new Set(capabilities);
  return {
    routePath,
    canCapability: (capability) => availableCapabilities.has(capability),
    canScopedPermission: () => false,
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

it('covers each Task 11 route and shares the employee tour across both route identities', () => {
  const pagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
    (route) => route.path
  );
  const expectedRoutes = [
    ['hr'],
    ['hr/people', 'admin/employees'],
    ['hr/leaves'],
    ['hr/attendance'],
    ['hr/timesheets'],
    ['hr/timesheet-assignments'],
  ];

  expect(HR_TOURS).toHaveLength(expectedRoutes.length);
  for (let index = 0; index < HR_TOURS.length; index += 1) {
    const tour = HR_TOURS[index];
    expect(tour.routePaths).toEqual(expectedRoutes[index]);
    for (const routePath of tour.routePaths) expect(pagePaths).toContain(routePath);
    expect(tour.steps.length).toBeGreaterThan(0);
    expect(tour.steps.every((step) => step.anchor !== null)).toBe(true);
  }
});

it('shows directory steps for either guarded employee route', () => {
  const hrPeople = context('hr/people', ['route.hr.people']);
  const adminEmployees = context('admin/employees', ['route.admin.employees']);
  const denied = context('hr/people');

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
  expect(ids(visibleSteps(adminEmployeesPageTour, denied))).toEqual(['employees-list']);
});

it('selects leave actions using submit, approval, and management capabilities', () => {
  const readOnly = context('hr/leaves');
  const submitter = context('hr/leaves', ['action.leave.submit']);
  const approver = context('hr/leaves', ['action.leave.approve']);
  const manager = context('hr/leaves', ['action.leave.manage']);

  expect(ids(visibleSteps(hrLeavesPageTour, readOnly))).toEqual([
    'hr-leaves-queue',
    'hr-leaves-workflow-history',
  ]);
  expect(ids(visibleSteps(hrLeavesPageTour, submitter))).toContain('hr-leaves-application');
  expect(ids(visibleSteps(hrLeavesPageTour, approver))).toEqual([
    'hr-leaves-queue',
    'hr-leaves-approval',
    'hr-leaves-rejection',
    'hr-leaves-workflow-history',
    'hr-leaves-comp-off',
  ]);
  expect(ids(visibleSteps(hrLeavesPageTour, manager))).toContain('hr-leaves-settings');
});

it('shows attendance correction and timesheet decision steps only to permitted users', () => {
  expect(ids(visibleSteps(hrAttendanceManagementPageTour, context('hr/attendance')))).not.toContain(
    'hr-attendance-adjust-segment'
  );
  expect(
    ids(
      visibleSteps(
        hrAttendanceManagementPageTour,
        context('hr/attendance', ['action.attendance.regularize'])
      )
    )
  ).toContain('hr-attendance-adjust-segment');

  expect(ids(visibleSteps(hrTimesheetsPageTour, context('hr/timesheets')))).not.toContain(
    'hr-timesheets-approval'
  );
  expect(
    ids(visibleSteps(hrTimesheetsPageTour, context('hr/timesheets', ['action.timesheet.approve'])))
  ).toContain('hr-timesheets-rejection');
  expect(
    ids(visibleSteps(hrTimesheetProjectAssignmentsPageTour, context('hr/timesheet-assignments')))
  ).toEqual([]);
  expect(
    ids(
      visibleSteps(
        hrTimesheetProjectAssignmentsPageTour,
        context('hr/timesheet-assignments', ['action.timesheet.manage'])
      )
    )
  ).toEqual(['hr-timesheet-project-assignment-editor']);
});

it('explains workflow outcomes and the fields required by the real forms', () => {
  const leaveApplication = hrLeavesPageTour.steps.find(
    (step) => step.id === 'hr-leaves-application'
  );
  const leaveApproval = hrLeavesPageTour.steps.find((step) => step.id === 'hr-leaves-approval');
  const leaveRejection = hrLeavesPageTour.steps.find((step) => step.id === 'hr-leaves-rejection');
  const attendanceCorrection = hrAttendanceManagementPageTour.steps.find(
    (step) => step.id === 'hr-attendance-adjust-segment'
  );
  const timesheetRejection = hrTimesheetsPageTour.steps.find(
    (step) => step.id === 'hr-timesheets-rejection'
  );
  const timesheetPreview = hrTimesheetsPageTour.steps.find(
    (step) => step.id === 'hr-timesheets-details-dialog'
  );

  expect(leaveApplication?.body).toMatch(/leave type, date range, and reason/i);
  expect(leaveApproval?.body).toMatch(/another approver/i);
  expect(leaveApproval?.body).toMatch(/does not approve/i);
  expect(leaveRejection?.body).toMatch(/requires a reason/i);
  expect(attendanceCorrection?.body).toMatch(/required reason/i);
  expect(attendanceCorrection?.body).toMatch(/audit trail/i);
  expect(timesheetRejection?.body).toMatch(/trimmed rejection reason/i);
  expect(timesheetRejection?.body).toMatch(/does not reject/i);
  expect(timesheetPreview?.body).toMatch(/week, total hours/i);
  expect(timesheetPreview?.body).toMatch(/does not open the dialog/i);
});

it.each([
  [hrLeavesPageTour, 'hr-leaves-approval', 'leave.approve-trigger', 'Approve Leave'],
  [hrLeavesPageTour, 'hr-leaves-comp-off', 'leave.comp-off-approvals', 'Approve Credit'],
  [
    hrAttendanceManagementPageTour,
    'hr-attendance-adjust-segment',
    'hr-attendance.adjust-trigger',
    'Adjust',
  ],
  [
    hrTimesheetsPageTour,
    'hr-timesheets-approval',
    'hr-timesheets.approve-trigger',
    'Approve Timesheet',
  ],
] as const)(
  'blocks the live %s control while its tour is open',
  async (tour, stepId, anchor, label) => {
    const user = userEventLibrary.setup();
    const businessMutation = vi.fn();
    const root = document.getElementById('root');
    if (!root) throw new Error('Application root is unavailable');
    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = label;
    action.setAttribute('data-tour-anchor', anchor);
    action.addEventListener('click', businessMutation);
    action.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') businessMutation();
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

    expect(businessMutation).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(action);
  }
);
