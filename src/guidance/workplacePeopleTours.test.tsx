// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { matchPath } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { prejoiningAdminPageTour } from '../modules/prejoining/admin/guidance/PrejoiningAdminPageTour';
import { benefitsPageTour } from '../modules/workplace/guidance/BenefitsPageTour';
import { learningPageTour } from '../modules/workplace/guidance/LearningPageTour';
import { onboardingPageTour } from '../modules/workplace/guidance/OnboardingPageTour';
import { performancePageTour } from '../modules/workplace/guidance/PerformancePageTour';
import { recruitmentPageTour } from '../modules/workplace/guidance/RecruitmentPageTour';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { TourOverlay } from './TourOverlay';
import type { TourContext, TourDefinition, TourStep } from './tourTypes';

const visibleSteps = (tour: TourDefinition, context: TourContext): TourStep[] =>
  tour.steps.filter((step) => step.isVisible?.(context) ?? true);
const stepIds = (steps: readonly TourStep[]) => steps.map(({ id }) => id);
const context = (
  routePath: string,
  permissions: readonly string[] = [],
  capabilities: readonly string[] = [],
  activeTab?: string | null,
  hasEmployeeProfile = false
): TourContext => {
  const availablePermissions = new Set(permissions);
  const availableCapabilities = new Set(capabilities);
  return {
    routePath,
    activeTab,
    hasEmployeeProfile,
    canPermission: (permission) => permissions.some((entry) => entry.startsWith(`${permission}:`)),
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

it('covers every assigned tenant page route with relative route identities and anchors', () => {
  const expected = [
    [performancePageTour, ['performance', 'workplace/performance']],
    [benefitsPageTour, ['workplace/benefits']],
    [recruitmentPageTour, ['workplace/recruitment']],
    [prejoiningAdminPageTour, ['workplace/prejoining']],
    [onboardingPageTour, ['workplace/onboarding']],
    [learningPageTour, ['workplace/learning']],
  ] as const;
  const pagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
    (route) => route.path
  );

  for (const [tour, paths] of expected) {
    expect(tour.routePaths).toEqual(paths);
    for (const path of paths) expect(pagePaths).toContain(path);
    expect(tour.steps.length).toBeGreaterThan(1);
    expect(tour.steps.every((step) => step.anchor !== null)).toBe(true);
  }

  const aliases = TENANT_APP_ROUTES.filter((route) => route.kind === 'page')
    .filter((route) => matchPath({ path: `/${route.path}`, end: true }, '/workplace/performance'))
    .map((route) => route.path);
  expect(aliases).toEqual(['workplace/performance']);
  expect(performancePageTour.routePaths).toContain('performance');
});

it('matches both performance aliases to the same rendered workflow and filters actions by scope', () => {
  const self = context('performance', ['performance:self:SELF']);
  const evaluator = context('workplace/performance', ['performance:evaluate:TEAM']);
  const manager = context('workplace/performance', ['performance:manage:ALL']);
  const managerProcess = context(
    'workplace/performance',
    ['performance:manage:ALL'],
    [],
    'process'
  );
  const managerAdmin = context(
    'workplace/performance',
    ['performance:manage:ALL'],
    [],
    'administration'
  );

  expect(performancePageTour.routePaths).toEqual(['performance', 'workplace/performance']);
  expect(stepIds(visibleSteps(performancePageTour, self))).toContain('performance-self-reviews');
  expect(stepIds(visibleSteps(performancePageTour, self))).not.toContain(
    'performance-process-setup'
  );
  expect(stepIds(visibleSteps(performancePageTour, evaluator))).toContain(
    'performance-team-reviews'
  );
  expect(stepIds(visibleSteps(performancePageTour, evaluator))).not.toContain(
    'performance-review-administration'
  );
  expect(stepIds(visibleSteps(performancePageTour, manager))).toEqual([
    'performance-workflow-tabs',
    'performance-process-setup',
  ]);
  expect(stepIds(visibleSteps(performancePageTour, managerProcess))).toContain(
    'performance-cycle-processing'
  );
  expect(stepIds(visibleSteps(performancePageTour, managerAdmin))).toContain(
    'performance-review-administration'
  );
});

it('shows benefits, recruitment, prejoining, onboarding, and learning actions only to matching roles', () => {
  const benefitEmployee = stepIds(
    visibleSteps(
      benefitsPageTour,
      context('workplace/benefits', ['benefits:self:SELF'], [], 'enrollments', true)
    )
  );
  const benefitManager = stepIds(
    visibleSteps(
      benefitsPageTour,
      context('workplace/benefits', ['benefits:manage:ALL'], [], 'plans', true)
    )
  );
  expect(benefitEmployee).toContain('benefit-enrollment-status');
  expect(benefitEmployee).not.toContain('benefit-plan-management');
  expect(benefitManager).toContain('benefit-plan-management');
  expect(
    stepIds(
      visibleSteps(
        benefitsPageTour,
        context('workplace/benefits', ['benefits:manage:ALL'], [], 'plans')
      )
    )
  ).not.toContain('benefit-enrollment');
  expect(
    stepIds(
      visibleSteps(
        benefitsPageTour,
        context('workplace/benefits', ['benefits:manage:ALL'], [], 'plans', true)
      )
    )
  ).toContain('benefit-enrollment');
  expect(
    stepIds(
      visibleSteps(
        benefitsPageTour,
        context('workplace/benefits', ['benefits:manage:ALL'], [], 'types', true)
      )
    )
  ).toContain('benefit-type-management');

  const recruitmentManager = stepIds(
    visibleSteps(
      recruitmentPageTour,
      context('workplace/recruitment', ['recruitment:manage:ALL'], [], 'applicants')
    )
  );
  const recruitmentJobsManager = stepIds(
    visibleSteps(
      recruitmentPageTour,
      context('workplace/recruitment', ['recruitment:manage:ALL'], [], 'jobs')
    )
  );
  expect(recruitmentManager).toContain('recruitment-applicant-review');
  expect(recruitmentJobsManager).toContain('recruitment-job-actions');

  expect(stepIds(visibleSteps(prejoiningAdminPageTour, context('workplace/prejoining')))).toEqual([
    'prejoining-sections',
  ]);
  const prejoiningReview = stepIds(
    visibleSteps(
      prejoiningAdminPageTour,
      context('workplace/prejoining', ['prejoining:review:ALL'])
    )
  );
  expect(prejoiningReview).toContain('prejoining-candidate-review');
  expect(prejoiningReview).not.toContain('prejoining-intake-configuration');
  const prejoiningAdmin = stepIds(
    visibleSteps(
      prejoiningAdminPageTour,
      context('workplace/prejoining', [
        'prejoining:review:ALL',
        'prejoining:manage:ALL',
        'employee:write:ALL',
        'role:manage:ALL',
      ])
    )
  );
  expect(prejoiningAdmin).toContain('prejoining-confirm-joined');

  const onboardingEmployee = stepIds(
    visibleSteps(onboardingPageTour, context('workplace/onboarding', ['onboarding:self:SELF']))
  );
  const onboardingManager = stepIds(
    visibleSteps(
      onboardingPageTour,
      context('workplace/onboarding', [], ['action.onboarding.manage'])
    )
  );
  expect(onboardingEmployee).toContain('onboarding-checklist');
  expect(onboardingEmployee).toContain('onboarding-exit-request');
  expect(onboardingManager).toContain('onboarding-separation-management');
  expect(onboardingManager).toContain('onboarding-checklist');

  expect(stepIds(visibleSteps(learningPageTour, context('workplace/learning')))).toEqual([]);
  const learningSkills = stepIds(
    visibleSteps(
      learningPageTour,
      context('workplace/learning', ['learning:manage:ALL'], [], 'skills')
    )
  );
  const learningCourses = stepIds(
    visibleSteps(
      learningPageTour,
      context('workplace/learning', ['learning:manage:ALL'], [], 'courses')
    )
  );
  expect(learningSkills).toContain('learning-skill-management');
  expect(learningCourses).toContain('learning-course-management');
});

it('keeps the invitation action inert while its explanatory tour is open', async () => {
  const user = userEventLibrary.setup();
  const businessMutation = vi.fn();
  const root = document.getElementById('root');
  if (!root) throw new Error('Application root is unavailable');
  const action = document.createElement('button');
  action.type = 'button';
  action.textContent = 'Create invitation';
  action.setAttribute('data-tour-anchor', 'prejoining.invitation-actions');
  action.addEventListener('click', businessMutation);
  action.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') businessMutation();
  });
  root.append(action);
  const step = prejoiningAdminPageTour.steps.find(
    (candidate) => candidate.id === 'prejoining-invitations'
  );
  if (!step) throw new Error('Prejoining invitation tour step is missing');

  render(
    <TourOverlay
      tour={{ ...prejoiningAdminPageTour, steps: [step] }}
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
});
