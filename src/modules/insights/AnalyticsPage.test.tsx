// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HrInsightsDocument, type HrInsights } from '../reports/reportDocuments';

import AnalyticsPage from './AnalyticsPage';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: ['analytics:read', 'attendance:read', 'employee:read', 'payroll:read', 'leave:read'],
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant-a', timezone: 'Asia/Kolkata' } }),
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      jwtRoles: ['HR'],
      persona: 'HR',
      mustChangePassword: false,
      permissions: new Set(state.permissions),
      permissionScopes: Object.fromEntries(
        state.permissions.map((permission) => [permission, 'ALL'])
      ),
      resourceScopes: {},
    },
  }),
}));
const data: HrInsights = {
  onTimeDays: 45,
  lateDays: 3,
  unknownPunctualityDays: 2,
  incompleteDays: 1,
  joiners: 4,
  exits: 1,
  activeHeadcount: 52,
  netSalaryGenerated: '120000.50',
  generatedPayslips: 50,
  pendingRequests: 6,
  includedPendingDomains: ['leave'],
  monthlyPayroll: [{ month: '2026-09', netSalaryGenerated: '120000.50', payslips: 50 }],
};
beforeEach(() => {
  state.permissions = [
    'analytics:read',
    'attendance:read',
    'employee:read',
    'payroll:read',
    'leave:read',
  ];
  state.client = {
    request: vi
      .fn()
      .mockImplementation((document: unknown) =>
        Promise.resolve(
          document === HrInsightsDocument
            ? { hrInsights: data }
            : { hrReportRows: { columns: ['Employee'], rows: [['Asha']], totalRows: 1 } }
        )
      ),
  };
});
afterEach(cleanup);

describe('HR insights', () => {
  it('opens full period records from an accessible chart and labels payroll as generated', async () => {
    render(<AnalyticsPage />);
    expect(await screen.findByText('Current active employees')).toBeTruthy();
    expect(screen.getByText('Net salary generated')).toBeTruthy();
    expect(screen.queryByText(/salary paid/i)).toBeNull();
    fireEvent.click(
      screen.getByRole('button', {
        name: /View all attendance punctuality records for selected period/,
      })
    );
    expect(await screen.findByText('Asha')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(state.client.request).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ kind: 'ATTENDANCE_PUNCTUALITY', offset: 0 })
    );
  });
  it('does not request analytics without company access', () => {
    state.permissions = ['attendance:read'];
    render(<AnalyticsPage />);
    expect(screen.getByText('HR insights require company analytics access.')).toBeTruthy();
    expect(state.client.request).not.toHaveBeenCalled();
  });
  it('does not turn unavailable metrics into zero or expose their charts', async () => {
    state.client.request.mockResolvedValue({
      hrInsights: {
        ...data,
        onTimeDays: null,
        lateDays: null,
        unknownPunctualityDays: null,
        incompleteDays: null,
        joiners: null,
        exits: null,
        activeHeadcount: null,
        netSalaryGenerated: null,
        generatedPayslips: null,
        pendingRequests: null,
        monthlyPayroll: null,
        includedPendingDomains: [],
      },
    });
    render(<AnalyticsPage />);
    expect(
      await screen.findByText('No company metrics are available with your current permissions.')
    ).toBeTruthy();
    expect(screen.queryByText('Net salary generated')).toBeNull();
    expect(screen.queryByRole('button', { name: /View pending requests/ })).toBeNull();
  });
  it('retries a failed insight request', async () => {
    state.client.request.mockRejectedValueOnce(new Error('Unavailable'));
    render(<AnalyticsPage />);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('Current active employees');
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
