// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExpenseBoardDocument } from '../../api/graphql/graphql';

import ExpensesPage from './ExpensesPage';

const testState = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: new Set<string>(),
  permissionScopes: {} as Record<string, string>,
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
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => testState.client }));

beforeEach(() => {
  testState.permissions = new Set();
  testState.permissionScopes = {};
  testState.client = {
    request: vi.fn((document: unknown, variables?: Record<string, unknown>) => {
      if (document === ExpenseBoardDocument) {
        return Promise.resolve({
          expenseCategories: variables?.includeExpenses ? [] : undefined,
          expenses: variables?.includeExpenses ? [] : undefined,
          travelRequests: variables?.includeTravel ? [] : undefined,
        });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    }),
  };
});

afterEach(cleanup);

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ExpensesPage />
    </MemoryRouter>
  );
}

describe('ExpensesPage exact authorization', () => {
  it('renders nothing and sends no request when read permissions have no explicit scope', async () => {
    testState.permissions = new Set(['expense:read', 'travel:read']);
    const view = renderPage();

    await waitFor(() => expect(view.container.innerHTML).toBe(''));
    expect(testState.client.request).not.toHaveBeenCalled();
  });

  it('loads and renders only the expense domain with expense:read=SELF', async () => {
    testState.permissions = new Set(['expense:read']);
    testState.permissionScopes = { 'expense:read': 'SELF' };
    renderPage();

    expect(await screen.findByText('Expense Claims')).toBeTruthy();
    expect(screen.getByText('Expense Categories')).toBeTruthy();
    expect(screen.queryByText('Travel Requests')).toBeNull();
    expect(testState.client.request).toHaveBeenCalledWith(ExpenseBoardDocument, {
      includeExpenses: true,
      includeTravel: false,
      limit: 20,
    });
  });

  it('loads and renders only the travel domain with travel:read=SELF', async () => {
    testState.permissions = new Set(['travel:read']);
    testState.permissionScopes = { 'travel:read': 'SELF' };
    renderPage();

    expect(await screen.findByText('Travel Requests')).toBeTruthy();
    expect(screen.queryByText('Expense Claims')).toBeNull();
    expect(screen.queryByText('Expense Categories')).toBeNull();
    expect(testState.client.request).toHaveBeenCalledWith(ExpenseBoardDocument, {
      includeExpenses: false,
      includeTravel: true,
      limit: 20,
    });
  });

  it('shows submit and management controls only with their exact scopes', async () => {
    testState.permissions = new Set([
      'expense:read',
      'expense:submit',
      'travel:submit',
      'expense:manage',
    ]);
    testState.permissionScopes = {
      'expense:read': 'SELF',
      'expense:submit': 'SELF',
      'travel:submit': 'SELF',
      'expense:manage': 'ALL',
    };
    renderPage();

    expect(await screen.findByRole('button', { name: 'Submit Expense' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Request travel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Configure categories' })).toBeTruthy();
  });
});
