// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { expensesPageTour } from '../modules/expenses/guidance/ExpensesPageTour';
import { payrollCompensationPageTour } from '../modules/payroll/guidance/PayrollCompensationPageTour';
import { payrollPageTour } from '../modules/payroll/guidance/PayrollPageTour';
import { payrollPayPageTour } from '../modules/payroll/guidance/PayrollPayPageTour';
import { payrollTaxPageTour } from '../modules/payroll/guidance/PayrollTaxPageTour';
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

it('covers the five Task 7 tenant routes with stable page anchors', () => {
  const routeCases: [TourDefinition, string][] = [
    [payrollPayPageTour, 'payroll/payslips'],
    [payrollPageTour, 'payroll/pay'],
    [payrollTaxPageTour, 'payroll/tax'],
    [payrollCompensationPageTour, 'payroll/compensation'],
    [expensesPageTour, 'expenses'],
  ];
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

it('shows payslip and tax actions according to the page permission checks', () => {
  const employee = context(
    'payroll/payslips',
    ['action.tax.submit'],
    ['payroll:read:SELF', 'tax:read:SELF']
  );
  const submitWithoutTaxRead = context(
    'payroll/payslips',
    ['action.tax.submit'],
    ['payroll:read:SELF']
  );
  const payrollManager = context('payroll/payslips', [], ['payroll:read:ALL']);
  const readOnly = context('payroll/payslips');

  expect(ids(visibleSteps(payrollPayPageTour, employee))).toContain('payroll-pay-tax-declaration');
  expect(ids(visibleSteps(payrollPayPageTour, payrollManager))).not.toContain(
    'payroll-pay-tax-declaration'
  );
  expect(ids(visibleSteps(payrollPayPageTour, submitWithoutTaxRead))).not.toContain(
    'payroll-pay-tax-declaration'
  );
  expect(ids(visibleSteps(payrollPayPageTour, readOnly))).not.toContain('payroll-pay-income-tax');
  expect(ids(visibleSteps(payrollPayPageTour, readOnly))).not.toContain(
    'payroll-pay-tax-declaration'
  );

  const salaryStep = payrollPayPageTour.steps.find(
    (step) => step.id === 'payroll-pay-salary-preview'
  );
  expect(salaryStep?.anchor).toBe('payroll.pay.sections');
  expect(salaryStep?.body).toMatch(/after the tour, select Salary/i);
});

it('keeps payroll processing and compensation admin actions scoped to payroll managers', () => {
  const manager = context('payroll/pay', ['action.payroll.manage', 'action.payroll.export']);
  const readOnly = context('payroll/pay');

  expect(ids(visibleSteps(payrollPageTour, manager))).toContain('payroll-run-cycle');
  expect(ids(visibleSteps(payrollPageTour, manager))).toContain('payroll-export-options');
  expect(ids(visibleSteps(payrollPageTour, readOnly))).not.toContain('payroll-run-cycle');
  expect(ids(visibleSteps(payrollPageTour, readOnly))).not.toContain('payroll-export-options');
  expect(
    ids(visibleSteps(payrollCompensationPageTour, context('payroll/compensation')))
  ).not.toContain('payroll-compensation-assign');
  expect(
    ids(
      visibleSteps(
        payrollCompensationPageTour,
        context('payroll/compensation', ['action.payroll.manage'])
      )
    )
  ).toContain('payroll-compensation-assign');
});

it('keeps tax declarations hidden unless the self-service capability is available', () => {
  const admin = context('payroll/tax', ['action.tax.manage']);
  const employeeAdmin = context('payroll/tax', ['action.tax.manage', 'action.tax.submit']);
  const employeeOnly = context('payroll/tax', ['action.tax.submit']);

  expect(ids(visibleSteps(payrollTaxPageTour, admin))).not.toContain(
    'payroll-tax-submit-declaration'
  );
  expect(ids(visibleSteps(payrollTaxPageTour, employeeAdmin))).toContain(
    'payroll-tax-submit-declaration'
  );
  expect(ids(visibleSteps(payrollTaxPageTour, employeeOnly))).not.toContain(
    'payroll-tax-submit-declaration'
  );
});

it('shows expense, travel, approval, and payment explanations only for matching capabilities', () => {
  const employee = context('expenses', ['action.expense.submit', 'action.travel.submit']);
  const approver = context('expenses', ['action.expense.approve', 'action.travel.approve']);
  const finance = context('expenses', ['action.expense.pay', 'action.expense.manage']);
  const readOnly = context('expenses', [], ['expense:read:SELF']);

  const employeeIds = ids(visibleSteps(expensesPageTour, employee));
  expect(employeeIds).toContain('expense-submit-claim');
  expect(employeeIds).toContain('travel-submit-request');
  expect(employeeIds).not.toContain('expense-approval-result');

  const approverIds = ids(visibleSteps(expensesPageTour, approver));
  expect(approverIds).toContain('expense-approval-result');
  expect(approverIds).toContain('travel-approval-result');
  expect(approverIds).not.toContain('expense-submit-claim');

  const financeIds = ids(visibleSteps(expensesPageTour, finance));
  expect(financeIds).toContain('expense-payment-result');
  expect(financeIds).toContain('expense-category-management');
  expect(ids(visibleSteps(expensesPageTour, readOnly))).not.toContain('expense-payment-result');
  expect(ids(visibleSteps(expensesPageTour, readOnly))).not.toContain(
    'expense-category-management'
  );
});

it('explains submission requirements and the results of expense approval dialogs', () => {
  const submission = expensesPageTour.steps.find((step) => step.id === 'expense-submit-claim');
  const approval = expensesPageTour.steps.find((step) => step.id === 'expense-approval-result');

  expect(submission?.body).toMatch(/category, title, amount, currency, expense date, and receipt/i);
  expect(submission?.body).toMatch(/some categories require a receipt/i);
  expect(submission?.body).toMatch(/does not submit a claim/i);
  expect(approval?.body).toMatch(/approved amount cannot exceed the claim/i);
  expect(approval?.body).toMatch(/partial approval/i);
  expect(approval?.body).toMatch(/next step/i);
  expect(approval?.body).toMatch(/does not approve/i);
});

it.each([
  [expensesPageTour, 'expense-submit-claim', 'expenses.submit-expense', 'Submit Expense'],
  [expensesPageTour, 'expense-approval-result', 'expenses.claim-actions', 'Submit Approval'],
  [payrollPageTour, 'payroll-run-cycle', 'payroll.cycles', 'Run pay (v1)'],
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
