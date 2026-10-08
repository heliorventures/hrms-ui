// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminWorkflowsPageTour } from '../modules/admin/guidance/AdminWorkflowsPageTour';
import { assetsPageTour } from '../modules/workplace/guidance/AssetsPageTour';
import { compensationPageTour } from '../modules/workplace/guidance/CompensationPageTour';
import { grievancePageTour } from '../modules/workplace/guidance/GrievancePageTour';
import { successionPageTour } from '../modules/workplace/guidance/SuccessionPageTour';
import { surveysPageTour } from '../modules/workplace/guidance/SurveysPageTour';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { TourOverlay } from './TourOverlay';
import type { TourContext, TourDefinition, TourStep } from './tourTypes';

const routeCases: readonly [TourDefinition, string][] = [
  [surveysPageTour, 'workplace/surveys'],
  [successionPageTour, 'workplace/succession'],
  [compensationPageTour, 'workplace/compensation'],
  [assetsPageTour, 'workplace/assets'],
  [grievancePageTour, 'workplace/grievance'],
  [adminWorkflowsPageTour, 'workplace/workflows'],
];

const visibleSteps = (tour: TourDefinition, context: TourContext): TourStep[] =>
  tour.steps.filter((step) => step.isVisible?.(context) ?? true);

const context = (
  routePath: string,
  scopedPermissions: readonly string[] = [],
  capabilities: readonly string[] = []
): TourContext => {
  const permissions = new Set(scopedPermissions);
  const availableCapabilities = new Set(capabilities);
  return {
    routePath,
    canCapability: (capability) => availableCapabilities.has(capability),
    canScopedPermission: (permission, scopes) =>
      (scopes ?? []).some((scope) => permissions.has(`${permission}:${scope}`)),
  };
};

const ids = (steps: readonly TourStep[]) => steps.map(({ id }) => id);

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  cleanup();
  document.getElementById('root')?.replaceChildren();
});

describe('workplace operations tours', () => {
  it('covers each Task 10 tenant route with its exact route identity and anchored steps', () => {
    const tenantPagePaths = TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map(
      (route) => route.path
    );

    for (const [tour, routePath] of routeCases) {
      expect(tenantPagePaths).toContain(routePath);
      expect(tour.routePaths).toEqual([routePath]);
      expect(tour.steps.length).toBeGreaterThan(1);
      expect(tour.steps.every((step) => step.anchor !== null)).toBe(true);
    }
  });

  it('shows survey management, response, and aggregate result steps only for their scopes', () => {
    const respondent = context('workplace/surveys', ['survey:respond:SELF']);
    const analyst = context('workplace/surveys', ['survey:results:DEPARTMENT']);
    const surveyManager = context('workplace/surveys', ['survey:manage:ALL', 'survey:results:ALL']);

    expect(ids(visibleSteps(surveysPageTour, respondent))).toContain('survey-respond');
    expect(ids(visibleSteps(surveysPageTour, respondent))).not.toContain('survey-manage');
    expect(ids(visibleSteps(surveysPageTour, analyst))).toContain('survey-results');
    expect(ids(visibleSteps(surveysPageTour, analyst))).not.toContain('survey-review-submissions');
    expect(ids(visibleSteps(surveysPageTour, surveyManager))).toContain('survey-manage');
    expect(ids(visibleSteps(surveysPageTour, surveyManager))).toContain(
      'survey-review-submissions'
    );
  });

  it('shows succession, compensation, asset, grievance, and workflow actions by their source permissions', () => {
    const noAccess = context('workplace/succession');
    const successionManager = context('workplace/succession', ['succession:manage:ALL']);
    const compensationManager = context('workplace/compensation', ['compensation:manage:ALL']);
    const assetReader = context('workplace/assets', ['assets:read:TEAM']);
    const assetManager = context('workplace/assets', ['assets:manage:ALL']);
    const assetSelf = context('workplace/assets', ['assets:self:SELF']);
    const grievanceNoAccess = context('workplace/grievance');
    const grievanceSelf = context(
      'workplace/grievance',
      ['grievance:self:SELF'],
      ['route.workplace.grievance']
    );
    const grievanceManager = context(
      'workplace/grievance',
      ['grievance:manage:ALL'],
      ['route.workplace.grievance']
    );
    const workflowManager = context('workplace/workflows', ['workflow:manage:ALL']);

    expect(ids(visibleSteps(successionPageTour, noAccess))).not.toContain('succession-setup');
    expect(ids(visibleSteps(successionPageTour, successionManager))).toContain('succession-setup');
    expect(ids(visibleSteps(compensationPageTour, compensationManager))).toContain(
      'compensation-setup'
    );
    expect(ids(visibleSteps(assetsPageTour, assetReader))).not.toContain('assets-management');
    expect(ids(visibleSteps(assetsPageTour, assetManager))).toContain('assets-management');
    expect(ids(visibleSteps(assetsPageTour, assetManager))).toContain('assets-categories');
    expect(ids(visibleSteps(assetsPageTour, assetSelf))).toContain('assets-my-assignments');
    expect(ids(visibleSteps(grievancePageTour, grievanceSelf))).toContain('grievance-file-case');
    expect(ids(visibleSteps(grievancePageTour, grievanceManager))).toContain('grievance-file-case');
    expect(ids(visibleSteps(grievancePageTour, grievanceNoAccess))).not.toContain(
      'grievance-file-case'
    );
    expect(ids(visibleSteps(adminWorkflowsPageTour, workflowManager))).toContain('workflow-create');
  });

  it('keeps business actions inert while each workplace operations tour is open', () => {
    const root = document.getElementById('root');
    if (!root) throw new Error('Application root is unavailable');

    for (const [tour, actionName] of [
      [surveysPageTour, 'Submit survey response'],
      [successionPageTour, 'Save succession setup'],
      [compensationPageTour, 'Save compensation setup'],
      [assetsPageTour, 'Save asset assignment'],
      [grievancePageTour, 'Submit grievance case'],
      [adminWorkflowsPageTour, 'Create workflow'],
    ] as const) {
      const firstStep = tour.steps.find((step) => step.anchor !== null);
      if (!firstStep?.anchor) throw new Error(`${tour.id} has no anchored step`);
      const businessMutation = vi.fn();
      const action = document.createElement('button');
      action.type = 'button';
      action.textContent = actionName;
      action.setAttribute('data-tour-anchor', firstStep.anchor);
      action.addEventListener('click', businessMutation);
      action.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') businessMutation();
      });
      root.append(action);
      const mount = document.createElement('div');
      root.append(mount);

      render(
        <TourOverlay
          tour={{ ...tour, steps: [firstStep] }}
          onClose={vi.fn()}
          returnFocusRef={createRef<HTMLElement>()}
        />,
        { container: mount }
      );

      const spotlight = screen.getByTestId('tour-spotlight');
      fireEvent.pointerDown(spotlight);
      fireEvent.click(spotlight);
      fireEvent.keyDown(spotlight, { key: 'Enter' });

      expect(businessMutation).not.toHaveBeenCalled();
      cleanup();
      root.replaceChildren();
    }
  });

  it('uses generic copy for confidential survey and grievance workflows', () => {
    const sensitiveCopy = [...surveysPageTour.steps, ...grievancePageTour.steps]
      .map(({ body }) => body)
      .join(' ')
      .toLowerCase();

    expect(sensitiveCopy).not.toContain('response from');
    expect(sensitiveCopy).not.toContain('grievance details');
    expect(sensitiveCopy).toContain('tour does not');
  });
});
