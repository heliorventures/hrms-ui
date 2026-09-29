// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { matchPath } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { employeeDetailTour } from '../modules/organization/guidance/EmployeeDetailTour';
import { organizationDocumentsTour } from '../modules/organization/guidance/OrganizationDocumentsTour';
import { organizationEmployeesTour } from '../modules/organization/guidance/OrganizationEmployeesTour';
import { orgChartTour } from '../modules/organization/guidance/OrgChartTour';
import { profileReviewTour } from '../modules/organization/guidance/ProfileReviewTour';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { TourOverlay } from './TourOverlay';
import type { TourContext, TourDefinition, TourStep } from './tourTypes';

const visibleSteps = (tour: TourDefinition, context: TourContext): TourStep[] =>
  tour.steps.filter((step) => step.isVisible?.(context) ?? true);

const stepIds = (steps: readonly TourStep[]) => steps.map(({ id }) => id);

const context = (
  routePath: string,
  capabilities: readonly string[] = [],
  permissions: readonly string[] = []
): TourContext => {
  const availableCapabilities = new Set(capabilities);
  const availablePermissions = new Set(permissions);
  return {
    routePath,
    canCapability: (capability) => availableCapabilities.has(capability),
    canScopedPermission: (permission, scopes) =>
      (scopes ?? []).some((scope) => availablePermissions.has(`${permission}:${scope}`)),
  };
};

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

it('covers each approved route identity with stable anchored steps', () => {
  const expected = [
    [organizationEmployeesTour, 'organization/employees'],
    [employeeDetailTour, 'organization/employees/:employeeId'],
    [orgChartTour, 'organization/org-chart'],
    [organizationDocumentsTour, 'organization/documents'],
    [profileReviewTour, 'organization/profile-reviews'],
  ] as const;
  const pagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
    (route) => route.path
  );

  for (const [tour, path] of expected) {
    expect(pagePaths).toContain(path);
    expect(tour.routePaths).toEqual([path]);
    expect(tour.steps.length).toBeGreaterThan(1);
    expect(tour.steps.every((step) => step.anchor !== null)).toBe(true);
  }
});

it('matches an employee detail URL to the exact tenant route identity used by the shell', () => {
  const pathname = '/organization/employees/employee-42';
  const matched = TENANT_APP_ROUTES.filter((route) => route.kind === 'page')
    .filter((route) => matchPath({ path: `/${route.path}`, end: true }, pathname))
    .sort((left, right) => right.path.length - left.path.length)[0];

  expect(matched?.path).toBe('organization/employees/:employeeId');
  expect(employeeDetailTour.routePaths).toContain(matched?.path);
  expect(organizationEmployeesTour.routePaths).not.toContain(matched?.path);
});

it('limits document management, employee management, and review guidance to matching permissions', () => {
  const employeeDetailReadOnly = stepIds(
    visibleSteps(
      employeeDetailTour,
      context('organization/employees/:employeeId', [], ['employee:read:SELF'])
    )
  );
  const directoryOnlySteps = stepIds(
    visibleSteps(employeeDetailTour, context('organization/employees/:employeeId'))
  );
  const employeeDetailManager = stepIds(
    visibleSteps(
      employeeDetailTour,
      context('organization/employees/:employeeId', [], ['employee:manage:ALL'])
    )
  );
  const documentsReadOnly = stepIds(
    visibleSteps(organizationDocumentsTour, context('organization/documents'))
  );
  const documentsManager = stepIds(
    visibleSteps(
      organizationDocumentsTour,
      context('organization/documents', [], ['employee:write:ALL'])
    )
  );
  const reviewUnavailable = visibleSteps(
    profileReviewTour,
    context('organization/profile-reviews')
  );
  const reviewManager = stepIds(
    visibleSteps(
      profileReviewTour,
      context('organization/profile-reviews', ['route.organization.profileReviews'])
    )
  );

  expect(employeeDetailReadOnly).not.toContain('employee-profile-document-review');
  expect(employeeDetailReadOnly).not.toContain('employee-profile-employment');
  expect(directoryOnlySteps).toEqual(['employee-profile-directory-details']);
  expect(employeeDetailManager).toContain('employee-profile-document-review');
  expect(employeeDetailManager).toContain('employee-profile-employment');

  const documentSteps = employeeDetailTour.steps.filter((step) =>
    ['employee-profile-document-upload', 'employee-profile-document-review'].includes(step.id)
  );
  expect(documentSteps.map((step) => step.anchor)).toEqual([
    'profile-section-navigation',
    'profile-section-navigation',
  ]);
  expect(documentSteps.every((step) => /after this tour, open Documents/i.test(step.body))).toBe(
    true
  );

  expect(documentsReadOnly).not.toContain('organization-company-document-upload');
  expect(documentsReadOnly).not.toContain('organization-company-document-removal');
  expect(documentsManager).toContain('organization-company-document-upload');
  expect(documentsManager).toContain('organization-company-document-removal');
  expect(reviewUnavailable).toHaveLength(0);
  expect(reviewManager).toContain('profile-review-decision-actions');
});

it.each([
  [
    employeeDetailTour,
    'employee-profile-document-upload',
    'employee-profile-document-upload',
    'Upload',
  ],
  [
    organizationDocumentsTour,
    'organization-company-document-upload',
    'organization-company-document-upload',
    'Upload Document',
  ],
  [
    profileReviewTour,
    'profile-review-evidence-actions',
    'profile-review-evidence-actions',
    'Verify',
  ],
  [
    profileReviewTour,
    'profile-review-decision-actions',
    'profile-review-decision-actions',
    'Approve',
  ],
] as const)(
  'keeps the live %s action inert while its explanatory tour is open',
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
    const step = tour.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`Tour step ${stepId} is missing`);

    render(
      <TourOverlay
        tour={{ ...tour, steps: [step] }}
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
