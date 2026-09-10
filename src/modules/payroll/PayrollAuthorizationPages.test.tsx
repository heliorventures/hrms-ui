// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
  useGraphClient: () => testState,
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
    const view = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PayrollTaxPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.request).not.toHaveBeenCalled();
  });

  it('loads tax administration data only with tax:manage=ALL', async () => {
    testState.permissions = new Set(['tax:manage']);
    testState.permissionScopes = { 'tax:manage': 'ALL' };
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PayrollTaxPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(testState.request).toHaveBeenCalled());
  });

  it('suppresses compensation requests without payroll:manage=ALL', async () => {
    testState.permissions = new Set(['payroll:manage']);
    testState.permissionScopes = { 'payroll:manage': 'SELF' };
    const view = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PayrollCompensationPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.request).not.toHaveBeenCalled();
  });

  it('loads compensation data with payroll:manage=ALL', async () => {
    testState.permissions = new Set(['payroll:manage']);
    testState.permissionScopes = { 'payroll:manage': 'ALL' };
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PayrollCompensationPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(testState.request).toHaveBeenCalled());
  });
});

it('keeps tax setup actions with their feature and excludes employee submission without permission', async () => {
  testState.permissions = new Set(['tax:manage']);
  testState.permissionScopes = { 'tax:manage': 'ALL' };
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PayrollTaxPage />
    </MemoryRouter>
  );
  expect(await screen.findByRole('button', { name: 'Add or Update Tax Version' })).toBeTruthy();
  expect(screen.queryByRole('tab', { name: 'Submit Declaration' })).toBeNull();
  fireEvent.click(screen.getByRole('tab', { name: 'Income Tax Slabs' }));
  expect(screen.getByRole('button', { name: 'Add or Update Slab' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Add or Update Tax Version' })).toBeNull();
});

it('guides salary setup through structures to employee assignment without stacking the forms', async () => {
  testState.permissions = new Set(['payroll:manage']);
  testState.permissionScopes = { 'payroll:manage': 'ALL' };
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PayrollCompensationPage />
    </MemoryRouter>
  );
  await waitFor(() => expect(testState.request).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Next: Build Salary Structure' }));
  expect(screen.getByRole('tabpanel').textContent).toContain('Salary Structure Template');
  fireEvent.click(screen.getByRole('button', { name: 'Next: Assign Employee Salary' }));
  expect(screen.getByRole('tabpanel').textContent).toContain('Assign Annual CTC');
  expect(screen.queryByRole('button', { name: 'Save structure' })).toBeNull();
});
