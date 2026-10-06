// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { PageWorkspaceContext } from '../../navigation/pageWorkspaceContext';

import PayrollPage from './PayrollPage';

const state = vi.hoisted(() => ({ allPayslips: true, exports: true, owner: 'first' }));
const latest = vi.hoisted(() => vi.fn());
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ clientSession: {} }) }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => ({}) }));
vi.mock('../../auth/permissionService', () => ({
  authorizationStateKey: () => state.owner,
  createPermissionService: () => ({
    canCapability: (name: string) => name !== 'action.payroll.export' || state.exports,
    canScopedPermission: () => state.allPayslips,
  }),
}));
vi.mock('./hooks/usePayrollBoard', () => ({ usePayrollBoard: () => ({ data: null }) }));
vi.mock('./hooks/usePayrollBoardActions', () => ({ usePayrollBoardActions: () => ({}) }));
vi.mock('./hooks/usePayrollExports', () => ({
  usePayrollExports: () => ({ setLatestCyclePeriod: latest }),
}));
vi.mock('./components/PayrollRunsSection', () => ({ default: () => <p>Run workspace</p> }));
vi.mock('./components/CompanyContributionRules', () => ({
  default: () => <p>Company rules editor</p>,
}));
vi.mock('./components/EmployeePayrollSettings', () => ({
  default: () => <p>Eligibility editor</p>,
}));
vi.mock('./components/CompanyPayslipComponents', () => ({
  default: () => <p>Visibility editor</p>,
}));
vi.mock('./components/PayrollLwpRules', () => ({ default: () => <p>Leave rules editor</p> }));
vi.mock('./components/PayrollComplianceCard', () => ({ default: () => <p>Employer editor</p> }));
vi.mock('./components/PayrollSalaryComponentsCard', () => ({
  default: () => <p>Component catalog</p>,
}));
vi.mock('./components/PayrollArrearsCard', () => ({ default: () => <p>Arrears editor</p> }));
vi.mock('./components/ManagedPayslips', () => ({ default: () => <p>Employee slip viewer</p> }));
vi.mock('./components/PayrollExportsSection', () => ({ default: () => <p>Export viewer</p> }));
vi.mock('./components/PayrollPeriodInputs', () => ({
  default: () => <input aria-label="Exception reason" defaultValue="" />,
}));
afterEach(() => {
  cleanup();
  state.allPayslips = true;
  state.exports = true;
  state.owner = 'first';
});

const open = (path = '/payroll/pay') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PayrollPage />
    </MemoryRouter>
  );

it('offers four business workspaces and does not mount setup editors on opening runs', () => {
  open();
  expect(screen.getByRole('navigation', { name: 'Payroll workspaces' })).toBeTruthy();
  for (const name of [
    'Payroll Runs',
    'Monthly Adjustments',
    'Payroll Setup',
    'Payslips & Exports',
  ]) {
    expect(screen.getByRole('link', { name })).toBeTruthy();
  }
  expect(screen.queryByText('Company rules editor')).toBeNull();
  expect(screen.queryByText('Eligibility editor')).toBeNull();
  expect(screen.getByRole('tabpanel', { name: 'Payroll Runs' })).toBeTruthy();
});

it('opens a bookmarked employee-settings task inside the setup workspace', () => {
  open('/payroll/pay?tab=employee-settings');
  expect(screen.getByRole('link', { name: 'Payroll Setup' }).getAttribute('aria-current')).toBe(
    'page'
  );
  expect(screen.getByText('Eligibility editor')).toBeTruthy();
  expect(screen.getByRole('combobox', { name: 'Payroll section' })).toHaveProperty(
    'value',
    'employee-settings'
  );
});

it('preserves exception entries while switching workspaces', () => {
  open('/payroll/pay?tab=monthly-inputs');
  fireEvent.change(screen.getByLabelText('Exception reason'), {
    target: { value: 'Approved incentive' },
  });
  fireEvent.click(screen.getByRole('link', { name: 'Payroll Setup' }));
  fireEvent.click(screen.getByRole('link', { name: 'Monthly Adjustments' }));
  expect(screen.getByLabelText('Exception reason')).toHaveProperty('value', 'Approved incentive');
});

it('does not expose payslip/export tasks without their respective permissions', () => {
  state.allPayslips = false;
  state.exports = false;
  open('/payroll/pay?tab=exports');
  expect(screen.queryByRole('link', { name: 'Payslips & Exports' })).toBeNull();
  expect(screen.queryByText('Export viewer')).toBeNull();
  expect(screen.queryByText('Employee slip viewer')).toBeNull();
});

it('clears retained exception entries when the authorization owner changes', () => {
  const result = open('/payroll/pay?tab=monthly-inputs');
  fireEvent.change(screen.getByLabelText('Exception reason'), {
    target: { value: 'Private adjustment' },
  });
  state.owner = 'second';
  result.rerender(
    <MemoryRouter initialEntries={['/payroll/pay?tab=monthly-inputs']}>
      <PayrollPage />
    </MemoryRouter>
  );
  expect(screen.getByLabelText('Exception reason')).toHaveProperty('value', '');
});

it('retains the payroll reports route selector alongside the local payroll sections', () => {
  const select = vi.fn();
  render(
    <MemoryRouter initialEntries={['/payroll/pay?tab=monthly-inputs']}>
      <PageWorkspaceContext.Provider
        value={{
          title: 'Pay & Benefits — Payroll',
          activePath: '/payroll/pay',
          tasks: [
            { path: '/payroll/pay', label: 'Payroll processing', keywords: [], order: 1 },
            {
              path: '/admin/reports?domain=payroll',
              label: 'Payroll reports',
              keywords: [],
              order: 2,
            },
          ],
          select,
        }}
      >
        <PayrollPage />
      </PageWorkspaceContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByRole('combobox', { name: 'Payroll section' })).toBeTruthy();
  fireEvent.change(screen.getByRole('combobox', { name: 'Workspace task' }), {
    target: { value: '/admin/reports?domain=payroll' },
  });
  expect(select).toHaveBeenCalledWith('/admin/reports?domain=payroll');
});
