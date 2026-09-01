// @vitest-environment jsdom

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PayrollCompensationPage from './PayrollCompensationPage';
import PayrollTaxPage from './PayrollTaxPage';

const testState = vi.hoisted(() => ({
  permissions: new Set<string>(),
  permissionScopes: {} as Record<string, string>,
  request: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'employee-1',
      jwtRoles: [],
      permissions: testState.permissions,
      permissionScopes: testState.permissionScopes,
      resourceScopes: {},
      persona: 'EMPLOYEE',
      mustChangePassword: false,
    },
  }),
}));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => ({ request: testState.request }),
}));

beforeEach(() => {
  testState.permissions = new Set();
  testState.permissionScopes = {};
  testState.request = vi.fn().mockResolvedValue({
    employees: [],
    payrollCycles: [],
    salaryComponents: [],
    salaryStructures: [],
    taxComputations: [],
    taxConfigurations: [],
    taxSectionDefinitions: [],
    taxSlabs: [],
  });
});

afterEach(cleanup);

describe('payroll administration page authorization', () => {
  it('suppresses tax administration requests for employee tax self-service', async () => {
    testState.permissions = new Set(['tax:read', 'tax:submit']);
    testState.permissionScopes = { 'tax:read': 'SELF', 'tax:submit': 'SELF' };
    const view = render(<PayrollTaxPage />);

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.request).not.toHaveBeenCalled();
  });

  it('loads tax administration data only with tax:manage=ALL', async () => {
    testState.permissions = new Set(['tax:manage']);
    testState.permissionScopes = { 'tax:manage': 'ALL' };
    render(<PayrollTaxPage />);

    await waitFor(() => expect(testState.request).toHaveBeenCalled());
  });

  it('suppresses compensation requests without payroll:manage=ALL', async () => {
    testState.permissions = new Set(['payroll:manage']);
    testState.permissionScopes = { 'payroll:manage': 'SELF' };
    const view = render(<PayrollCompensationPage />);

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.request).not.toHaveBeenCalled();
  });

  it('loads compensation data with payroll:manage=ALL', async () => {
    testState.permissions = new Set(['payroll:manage']);
    testState.permissionScopes = { 'payroll:manage': 'ALL' };
    render(<PayrollCompensationPage />);

    await waitFor(() => expect(testState.request).toHaveBeenCalled());
  });
});
