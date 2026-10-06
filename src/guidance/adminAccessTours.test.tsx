// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { adminReportsPageTour } from '../modules/admin/guidance/AdminReportsPageTour';
import { adminSettingsPageTour } from '../modules/admin/guidance/AdminSettingsPageTour';
import { moduleHealthPageTour } from '../modules/admin/guidance/ModuleHealthPageTour';
import { hrAccessManagementPageTour } from '../modules/hr/guidance/HrAccessManagementPageTour';
import { TENANT_APP_ROUTES } from '../routes/appRouteConfig';

import { GuidanceProvider } from './GuidanceProvider';
import type { TourContext, TourDefinition } from './tourTypes';
import { useGuidance } from './useGuidance';

const tours = [
  adminReportsPageTour,
  hrAccessManagementPageTour,
  adminSettingsPageTour,
  moduleHealthPageTour,
] as const;

function context(
  routePath: string,
  capabilities: readonly string[] = [],
  permissions: readonly string[] = []
): TourContext {
  const availableCapabilities = new Set(capabilities);
  const availablePermissions = new Set(permissions);
  return {
    routePath,
    canCapability: (capability) => availableCapabilities.has(capability),
    canScopedPermission: (permission, scopes) =>
      (scopes ?? []).some((scope) => availablePermissions.has(`${permission}:${scope}`)),
  };
}

const visibleStepIds = (tour: TourDefinition, tourContext: TourContext) =>
  tour.steps.filter((step) => step.isVisible?.(tourContext) ?? true).map((step) => step.id);

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('administration access and reporting tours', () => {
  it('uses the exact tenant route identities for the four page tours', () => {
    const pagePaths = new Set(
      TENANT_APP_ROUTES.filter((route) => route.kind === 'page').map((route) => route.path)
    );

    expect(tours.map((tour) => tour.routePaths)).toEqual([
      ['admin/reports'],
      ['admin/access'],
      ['admin/settings'],
      ['admin/module-health'],
    ]);
    for (const tour of tours) {
      expect(tour.routePaths.every((routePath) => pagePaths.has(routePath))).toBe(true);
      expect(
        tour.steps.every(
          (step) => step.anchor !== null || step.id === 'admin-settings-pending-controls'
        )
      ).toBe(true);
    }
  });

  it('shows report guidance only for an authorized report route and ALL-scope report access', () => {
    const steps = adminReportsPageTour.steps;
    expect(visibleStepIds(adminReportsPageTour, context('admin/reports'))).toEqual([]);
    expect(
      visibleStepIds(
        adminReportsPageTour,
        context('admin/reports', ['route.admin.reports'], ['attendance:read:TEAM'])
      )
    ).toEqual([]);

    const employeeReportAccess = context(
      'admin/reports',
      ['route.admin.reports'],
      ['employee:read:ALL']
    );
    expect(visibleStepIds(adminReportsPageTour, employeeReportAccess)).toEqual([
      'admin-reports-filters',
      'admin-reports-output',
    ]);
    expect(steps.find((step) => step.id === 'admin-reports-output')?.body).toContain(
      'Download CSV exports the same filter across all pages'
    );
    expect(
      visibleStepIds(
        adminReportsPageTour,
        context('admin/reports', ['route.admin.reports'], ['expense:read:ALL'])
      )
    ).toContain('claim-expense-report');
    expect(
      visibleStepIds(
        adminReportsPageTour,
        context('admin/reports', ['route.admin.reports'], ['travel:read:ALL'])
      )
    ).toContain('travel-request-report');
  });

  it('hides role, settings, and health actions without tenant-wide role management', () => {
    const routeContexts = [
      context('admin/access', ['route.admin.access']),
      context('admin/settings', ['route.admin.settings']),
      context('admin/module-health', ['route.admin.moduleHealth']),
    ];
    const definitions = [hrAccessManagementPageTour, adminSettingsPageTour, moduleHealthPageTour];
    routeContexts.forEach((tourContext, index) => {
      expect(visibleStepIds(definitions[index], tourContext)).toEqual([]);
    });

    const authorizedRouteCapabilities = [
      'route.admin.access',
      'route.admin.settings',
      'route.admin.moduleHealth',
    ] as const;
    routeContexts.forEach((tourContext, index) => {
      const authorizedContext = context(
        tourContext.routePath ?? '',
        [authorizedRouteCapabilities[index]],
        ['role:manage:ALL']
      );
      expect(visibleStepIds(definitions[index], authorizedContext).length).toBeGreaterThan(0);
    });

    expect(hrAccessManagementPageTour.steps.map((step) => step.anchor)).toEqual([
      'admin.access.tab.users',
      'admin.access.tab.roles',
      'admin.access.tab.scopes',
      'admin.access.reload-catalog',
    ]);
    expect(moduleHealthPageTour.steps.map((step) => step.anchor)).toContain(
      'admin.module-health.rerun'
    );
  });

  it('keeps credential values and provider claims out of the settings tour', () => {
    const copy = adminSettingsPageTour.steps.map((step) => `${step.title} ${step.body}`).join(' ');
    expect(copy).not.toMatch(/password|secret|credential|api key|provider/i);
    expect(copy).toContain('Employee Directory Snapshot');
    expect(copy).toContain('currently unavailable');
  });

  it('does not invoke an underlying business action while a page tour is open', async () => {
    const user = userEvent.setup();
    const mutation = vi.fn();
    const TourControls = () => {
      const guidance = useGuidance();
      return (
        <>
          <button type="button" onClick={guidance.startPageTour}>
            Start tour
          </button>
          <button type="button" data-tour-anchor="admin.access.tab.users" onClick={mutation}>
            Save User Roles
          </button>
        </>
      );
    };

    render(
      <GuidanceProvider
        matchedRoutePath="admin/access"
        tourContext={{
          canCapability: (capability) => capability === 'route.admin.access',
          canScopedPermission: (permission, scopes) =>
            permission === 'role:manage' && scopes?.includes('ALL') === true,
        }}
        registeredTours={[hrAccessManagementPageTour]}
      >
        <TourControls />
      </GuidanceProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Start tour' }));
    const spotlight = screen.getByTestId('tour-spotlight');
    fireEvent.pointerDown(spotlight);
    fireEvent.click(spotlight);
    await user.keyboard('{Enter}');

    expect(mutation).not.toHaveBeenCalled();
  });
});
