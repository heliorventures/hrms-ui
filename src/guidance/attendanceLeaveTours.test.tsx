// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { attendancePageTour } from '../modules/attendance/guidance/AttendancePageTour';
import { leaveHolidaysPageTour } from '../modules/leave/guidance/LeaveHolidaysPageTour';
import { leavePageTour } from '../modules/leave/guidance/LeavePageTour';
import { leaveTeamCalendarPageTour } from '../modules/leave/guidance/LeaveTeamCalendarPageTour';
import { timesheetPageTour } from '../modules/timesheet/guidance/TimesheetPageTour';

import { TourOverlay } from './TourOverlay';
import type { TourContext, TourDefinition } from './tourTypes';

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

function visibleSteps(tour: TourDefinition, context: TourContext) {
  return tour.steps.filter((step) => step.isVisible?.(context) ?? true);
}

function mutationStep(tour: TourDefinition, stepId: string): TourDefinition {
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

it('owns the five requested tenant route identities and targets real page sections', () => {
  expect(attendancePageTour.routePaths).toEqual(['attendance']);
  expect(timesheetPageTour.routePaths).toEqual(['timesheet']);
  expect(leaveHolidaysPageTour.routePaths).toEqual(['leave/holidays']);
  expect(leaveTeamCalendarPageTour.routePaths).toEqual(['leave/team-calendar']);
  expect(leavePageTour.routePaths).toEqual(['leave']);

  for (const tour of [
    attendancePageTour,
    timesheetPageTour,
    leaveHolidaysPageTour,
    leaveTeamCalendarPageTour,
    leavePageTour,
  ]) {
    expect(tour.steps.length).toBeGreaterThan(1);
    expect(tour.steps.every((step) => step.anchor !== null)).toBe(true);
  }
});

it('shows punch, leave submission, approval, and leave management guidance only for allowed actions', () => {
  const readOnly: TourContext = { routePath: 'attendance', canCapability: () => false };
  const employee: TourContext = {
    routePath: 'leave',
    canCapability: (capability) => capability === 'action.leave.submit',
  };
  const approver: TourContext = {
    routePath: 'leave',
    canCapability: (capability) => capability === 'action.leave.approve',
  };
  const manager: TourContext = {
    routePath: 'leave',
    canCapability: (capability) => capability === 'action.leave.manage',
  };
  const timesheetReadOnly: TourContext = {
    routePath: 'timesheet',
    canCapability: () => false,
  };

  expect(visibleSteps(attendancePageTour, readOnly).map((step) => step.id)).not.toContain(
    'attendance-adjustment'
  );
  expect(
    visibleSteps(attendancePageTour, {
      ...readOnly,
      canCapability: (capability) => capability === 'action.attendance.punch',
    }).map((step) => step.id)
  ).toContain('attendance-adjustment');

  const employeeLeaveSteps = visibleSteps(leavePageTour, employee).map((step) => step.id);
  expect(employeeLeaveSteps).toContain('leave-apply-dialog');
  expect(employeeLeaveSteps).toContain('leave-comp-off-request');
  expect(employeeLeaveSteps).not.toContain('leave-approval-actions');
  expect(employeeLeaveSteps).not.toContain('leave-management-settings');

  const approverLeaveSteps = visibleSteps(leavePageTour, approver).map((step) => step.id);
  expect(approverLeaveSteps).toContain('leave-approval-actions');
  expect(approverLeaveSteps).not.toContain('leave-apply-dialog');
  expect(approverLeaveSteps).not.toContain('leave-management-settings');

  const managerLeaveSteps = visibleSteps(leavePageTour, manager).map((step) => step.id);
  expect(managerLeaveSteps).toContain('leave-management-settings');
  expect(managerLeaveSteps).not.toContain('leave-approval-actions');
  expect(managerLeaveSteps).not.toContain('leave-apply-dialog');
  expect(visibleSteps(timesheetPageTour, timesheetReadOnly).map((step) => step.id)).not.toContain(
    'timesheet-submit-week'
  );
});

it('explains required fields and outcomes without opening live form content', () => {
  const attendance = attendancePageTour.steps.find((step) => step.id === 'attendance-adjustment');
  const timesheet = timesheetPageTour.steps.find((step) => step.id === 'timesheet-entry-dialog');
  const leave = leavePageTour.steps.find((step) => step.id === 'leave-apply-dialog');
  const compOff = leavePageTour.steps.find((step) => step.id === 'leave-comp-off-request');

  expect(attendance?.body).toMatch(/work date.*punch in and out dates and times/i);
  expect(attendance?.body).toMatch(/does not save/i);
  expect(timesheet?.body).toMatch(/work date and hours/i);
  expect(timesheet?.body).toMatch(/does not add or edit/i);
  expect(leave?.body).toMatch(/leave type, date range, and reason/i);
  expect(leave?.body).toMatch(/supporting document/i);
  expect(leave?.body).toMatch(/does not create/i);
  expect(compOff?.body).toMatch(/date worked, units, and a reason/i);
  expect(compOff?.body).toMatch(/does not send/i);

  expect(leave?.anchor).toBe('leave.apply-trigger');
  expect(compOff?.anchor).toBe('leave.comp-off-trigger');
});

it.each([
  [attendancePageTour, 'attendance-adjustment', 'attendance.adjust-trigger', 'Add Missed Punches'],
  [timesheetPageTour, 'timesheet-submit-week', 'timesheet.submit-week', 'Submit week'],
  [leavePageTour, 'leave-apply-dialog', 'leave.apply-trigger', 'Apply for leave'],
  [leavePageTour, 'leave-approval-actions', 'leave.requests', 'Approve'],
] as const)(
  'blocks a live action while the %s tour is open',
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
        tour={mutationStep(tour, stepId)}
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
