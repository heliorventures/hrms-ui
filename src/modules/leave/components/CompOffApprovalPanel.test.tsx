// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompOffApprovalDocument, DecideCompOffDocument } from '../compOffDocuments';

import CompOffApprovalPanel from './CompOffApprovalPanel';

const state = vi.hoisted(() => ({ permissions: new Set<string>(), request: vi.fn(), client: {} }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant-a' } }),
}));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'manager-1',
      permissions: state.permissions,
      permissionScopes: { 'leave:approve': 'TEAM' },
      resourceScopes: {},
    },
  }),
}));
const claim = {
  id: 'claim-1',
  employeeId: 'employee-1',
  employeeName: 'Asha Rao',
  employeeCode: 'EMP01',
  workedDate: '2026-09-07',
  units: '0.5',
  reason: 'Site inspection',
  status: 'PENDING',
};
beforeEach(() => {
  state.permissions = new Set(['leave:approve']);
  state.request = vi.fn((document: unknown) => {
    if (document === CompOffApprovalDocument) return Promise.resolve({ compOffClaims: [claim] });
    if (document === DecideCompOffDocument)
      return Promise.resolve({ decideCompOffClaim: { ...claim, status: 'APPROVED' } });
    return Promise.reject(new Error('Unexpected query'));
  });
  state.client = { request: state.request };
});
afterEach(cleanup);

describe('comp-off approval queue', () => {
  it('does not query the queue without the exact approval permission', () => {
    state.permissions.clear();
    const view = render(<CompOffApprovalPanel />);
    expect(view.container.innerHTML).toBe('');
    expect(state.request).not.toHaveBeenCalled();
  });
  it('shows the employee and approves the selected half-day claim', async () => {
    render(<CompOffApprovalPanel />);
    expect(await screen.findByText('Asha Rao')).toBeTruthy();
    expect(screen.getByText('0.5 day')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() =>
      expect(state.request).toHaveBeenCalledWith(DecideCompOffDocument, {
        claimId: 'claim-1',
        approve: true,
        reason: null,
      })
    );
  });
  it('requires an inline rejection reason and submits it with the selected claim', async () => {
    render(<CompOffApprovalPanel />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    const dialog = screen.getByRole('dialog', { name: 'Reject comp-off credit' });
    const reason = within(dialog).getByLabelText<HTMLTextAreaElement>('Reason for rejection');
    expect(reason.required).toBe(true);
    expect(state.request).not.toHaveBeenCalledWith(DecideCompOffDocument, expect.anything());
    fireEvent.change(reason, { target: { value: '  Work was already compensated  ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reject request' }));
    await waitFor(() =>
      expect(state.request).toHaveBeenCalledWith(DecideCompOffDocument, {
        claimId: 'claim-1',
        approve: false,
        reason: 'Work was already compensated',
      })
    );
  });
});
