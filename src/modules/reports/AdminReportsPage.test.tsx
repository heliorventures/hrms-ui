// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParsedClientSession } from '../../auth/clientSession';
import AdminReportsPage from '../admin/AdminReportsPage';

const state = vi.hoisted(() => ({ request: vi.fn(), session: null as ParsedClientSession | null }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ clientSession: state.session }),
}));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant', timezone: 'Asia/Kolkata' } }),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));

const Harness = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <button onClick={() => navigate('/admin/reports?domain=payroll')}>Payroll view</button>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <span>{location.search}</span>
      <AdminReportsPage />
    </>
  );
};
const show = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/admin/reports${search}`]}>
      <Harness />
    </MemoryRouter>
  );
beforeEach(() => {
  state.session = {
    jwtRoles: [],
    persona: 'EMPLOYEE',
    mustChangePassword: false,
    resourceScopes: {},
    permissions: new Set(['leave:read', 'payroll:read']),
    permissionScopes: { 'leave:read': 'ALL', 'payroll:read': 'ALL' },
  };
  state.request.mockReset().mockImplementation((_document: unknown, variables: { kind: string }) =>
    Promise.resolve({
      hrReportRows: { columns: ['Kind'], rows: [[variables.kind]], totalRows: 1 },
    })
  );
});
afterEach(cleanup);

describe('contextual report navigation', () => {
  it('lists only permitted leave reports and persists selection in the URL', async () => {
    show('?domain=leave');
    await screen.findByText('LEAVE_REQUESTS');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Leave requests',
      'Leave balances',
      'Comp-off credits',
    ]);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'LEAVE_BALANCES' } });
    await screen.findByText('LEAVE_BALANCES');
    expect(screen.getByText('?domain=leave&report=LEAVE_BALANCES')).toBeTruthy();
    fireEvent.click(screen.getByText('Back'));
    await screen.findByText('LEAVE_REQUESTS');
    fireEvent.click(screen.getByText('Forward'));
    await screen.findByText('LEAVE_BALANCES');
  });
  it.each([
    '?domain=expenses',
    '?domain=unknown',
    '?domain=',
    '?domain=leave&report=PAYROLL_REGISTER',
    '?domain=leave&report=UNKNOWN',
    '?domain=leave&domain=payroll',
    '?domain=leave&report=LEAVE_REQUESTS&report=PAYROLL_REGISTER',
  ])('rejects unsupported view %s without querying', (search) => {
    show(search);
    expect(screen.getByRole('status').textContent).toMatch(/unavailable|invalid/i);
    expect(state.request).not.toHaveBeenCalled();
  });
  it('resets employee filters and results on domain changes and follows back navigation', async () => {
    show('?domain=leave&report=LEAVE_BALANCES');
    await screen.findByText('LEAVE_BALANCES');
    fireEvent.change(screen.getByLabelText('Employee name or code'), {
      target: { value: 'Alice' },
    });
    fireEvent.click(screen.getByText('Apply'));
    fireEvent.click(screen.getByText('Payroll view'));
    await screen.findByText('PAYROLL_REGISTER');
    expect(screen.queryByText('LEAVE_BALANCES')).toBeNull();
    expect(screen.getByLabelText<HTMLInputElement>('Employee name or code').value).toBe('');
    expect(state.request).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ kind: 'PAYROLL_REGISTER', employeeSearch: null })
    );
    fireEvent.click(screen.getByText('Back'));
    await screen.findByText('LEAVE_BALANCES');
  });
  it('removes previously visible data when authorization changes', async () => {
    const view = show('?domain=payroll&report=PAYROLL_REGISTER');
    await screen.findByText('PAYROLL_REGISTER');
    state.request.mockClear();
    state.session = {
      ...(state.session as ParsedClientSession),
      permissions: new Set(['leave:read']),
      permissionScopes: { 'leave:read': 'ALL' },
    };
    view.rerender(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText('PAYROLL_REGISTER')).toBeNull());
    expect(state.request).not.toHaveBeenCalled();
  });
  it('retains the central pending requests report without a domain', async () => {
    show('?report=PENDING_REQUESTS');
    await screen.findByText('PENDING_REQUESTS');
    expect(screen.getByRole('heading', { name: 'All Reports' })).toBeTruthy();
  });
});
