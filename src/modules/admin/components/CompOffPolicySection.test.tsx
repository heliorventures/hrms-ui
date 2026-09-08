// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ApprovedCompOffLeavesDocument,
  CancelApprovedCompOffLeaveDocument,
  CompOffSettingsDocument,
  SaveCompOffPolicyDocument,
} from '../../leave/compOffDocuments';

import CompOffPolicySection from './CompOffPolicySection';

const state = vi.hoisted(() => ({ permissions: new Set<string>(), request: vi.fn(), client: {} }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant-a', timezone: 'Asia/Kolkata' } }),
}));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'hr-1',
      permissions: state.permissions,
      permissionScopes: { 'leave:manage': 'ALL' },
      resourceScopes: {},
    },
  }),
}));
const settings = {
  compOffPolicies: [],
  compOffPolicyTargets: {
    employees: [{ id: 'employee-1', employeeCode: 'EMP01', fullName: 'Asha Rao' }],
    designations: [{ id: 'designation-1', title: 'Site engineer' }],
  },
};
const approved = {
  id: 'leave-1',
  employeeId: 'employee-1',
  employeeCode: 'EMP01',
  employeeName: 'Asha Rao',
  fromDate: '2026-10-01',
  toDate: '2026-10-01',
  daysRequested: '1',
};
beforeEach(() => {
  state.permissions = new Set(['leave:manage']);
  state.request = vi.fn((document: unknown) => {
    if (document === CompOffSettingsDocument) return Promise.resolve(settings);
    if (document === ApprovedCompOffLeavesDocument)
      return Promise.resolve({ approvedCompOffLeaves: [approved] });
    if (document === SaveCompOffPolicyDocument)
      return Promise.resolve({ upsertCompOffPolicy: { id: 'policy-1' } });
    if (document === CancelApprovedCompOffLeaveDocument)
      return Promise.resolve({
        cancelApprovedCompOffLeave: { id: 'leave-1', status: 'CANCELLED' },
      });
    return Promise.reject(new Error('Unexpected query'));
  });
  state.client = { request: state.request };
});
afterEach(cleanup);

describe('comp-off administration', () => {
  it('hides administration and sends no queries without the exact management permission', () => {
    state.permissions.clear();
    const view = render(<CompOffPolicySection />);
    expect(view.container.innerHTML).toBe('');
    expect(state.request).not.toHaveBeenCalled();
  });
  it('selects an employee by name and leaves all three optional limits unset', async () => {
    render(<CompOffPolicySection />);
    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'New policy' }).disabled).toBe(
        false
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'New policy' }));
    fireEvent.change(screen.getByLabelText('Applies to'), { target: { value: 'EMPLOYEE' } });
    expect(screen.getByRole('option', { name: /EMP01.*Asha Rao/ })).toBeTruthy();
    fireEvent.change(screen.getByRole('listbox', { name: 'Employee' }), {
      target: { value: 'employee-1' },
    });
    fireEvent.change(screen.getByLabelText('Credit validity (days after approval)'), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText('Submit claim within (days after work)'), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByLabelText('Enable comp-off for this scope'));
    fireEvent.click(screen.getByRole('button', { name: 'Save policy' }));
    await waitFor(() =>
      expect(state.request).toHaveBeenCalledWith(SaveCompOffPolicyDocument, {
        input: {
          id: null,
          employeeId: 'employee-1',
          designationId: null,
          enabled: true,
          validityDays: 30,
          claimDeadlineDays: 7,
          monthlyEarningLimit: null,
          yearlyEarningLimit: null,
          maxUnusedBalance: null,
          allowApprovedLeaveCancellation: false,
        },
      })
    );
  });
  it('shows the concrete approved leave before HR confirms cancellation', async () => {
    render(<CompOffPolicySection />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel leave' }));
    const dialog = screen.getByRole('dialog', { name: 'Cancel approved comp-off leave' });
    expect(within(dialog).getByText('Asha Rao')).toBeTruthy();
    expect(within(dialog).getByText(/retain their original expiry date/)).toBeTruthy();
    expect(state.request).not.toHaveBeenCalledWith(
      CancelApprovedCompOffLeaveDocument,
      expect.anything()
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel leave' }));
    await waitFor(() =>
      expect(state.request).toHaveBeenCalledWith(CancelApprovedCompOffLeaveDocument, {
        leaveRequestId: 'leave-1',
      })
    );
  });
});
