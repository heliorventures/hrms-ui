// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TimesheetLockPolicyDocument, TimesheetRowsDocument } from '../../api/graphql/graphql';

import TimesheetPage from './TimesheetPage';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: new Set<string>(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'employee-1',
      permissions: state.permissions,
      permissionScopes: { 'timesheet:read': 'SELF' },
      resourceScopes: {},
    },
  }),
}));
vi.mock('../../contexts/DialogContext', () => ({ useDialogs: () => ({ confirm: vi.fn() }) }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../hooks/useFlashToast', () => ({
  useFlashToast: () => ({ clear: vi.fn(), flash: null, show: vi.fn() }),
}));

beforeEach(() => {
  state.permissions = new Set();
  state.client.request = vi.fn((document: unknown) => {
    if (document === TimesheetLockPolicyDocument) {
      return Promise.resolve({ timesheetLockPolicy: null });
    }
    if (document === TimesheetRowsDocument) return Promise.resolve({ timesheetEntries: [] });
    return Promise.reject(new Error('Unexpected GraphQL document.'));
  });
});

afterEach(cleanup);

describe('TimesheetPage authorization', () => {
  const renderPage = () =>
    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <TimesheetPage />
      </MemoryRouter>
    );

  it('does not request timesheet data without timesheet:read', async () => {
    const view = renderPage();

    expect(view.container.innerHTML).toBe('');
    expect(state.client.request).not.toHaveBeenCalled();
  });

  it('loads read-only data without write or submit controls', async () => {
    state.permissions = new Set(['timesheet:read']);
    renderPage();

    await waitFor(() => expect(state.client.request).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: 'Add Entry' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Submit Week/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
  });
});
