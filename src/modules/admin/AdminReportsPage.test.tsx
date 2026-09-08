// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AdminAttendanceDailyReportDocument,
  AdminAttendanceReportSummaryDocument,
} from '../../api/graphql/graphql';
import type { ParsedClientSession } from '../../auth/clientSession';
import { HrReportRowsDocument } from '../reports/reportDocuments';

import AdminReportsPage, { attendanceCsvRows } from './AdminReportsPage';

const state = vi.hoisted(() => ({
  tenant: { id: 'tenant-a', timezone: 'Asia/Kolkata' },
  clientSession: null as ParsedClientSession | null,
  client: { request: vi.fn() },
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ clientSession: state.clientSession, tenantId: state.tenant.id }),
}));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: state.tenant }),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));

const attendanceRow = {
  employeeId: 'employee-1',
  employeeName: 'Asha Rao',
  employeeCode: 'EMP-0042',
  workDate: '2026-08-24',
  timezone: 'Asia/Kolkata',
  firstCheckInAt: '2026-08-24T03:30:00Z',
  lastCheckOutAt: '2026-08-24T12:00:00Z',
  loggedMinutes: 510,
  expectedMinutes: 480,
  status: 'PRESENT',
  segmentCount: 2,
};
const attendanceSummary = {
  totalDays: 1,
  presentDays: 1,
  halfDays: 0,
  absentDays: 0,
  onLeaveDays: 0,
  holidayDays: 0,
  weeklyOffDays: 0,
  incompleteDays: 0,
  unscheduledDays: 0,
  totalLoggedMinutes: 510,
};
function session(scopes: Record<string, string>): ParsedClientSession {
  return {
    jwtRoles: ['HR_ADMIN'],
    permissions: new Set(Object.keys(scopes)),
    permissionScopes: scopes,
    resourceScopes: {},
    employeeId: 'viewer-1',
    persona: 'HR',
    mustChangePassword: false,
  };
}
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 25, 12));
  state.tenant = { id: 'tenant-a', timezone: 'Asia/Kolkata' };
  state.clientSession = session({ 'attendance:read': 'ALL' });
  state.client = { request: vi.fn() };
  state.client.request.mockImplementation((document: unknown, variables?: { kind?: string }) => {
    if (document === AdminAttendanceDailyReportDocument)
      return Promise.resolve({
        attendanceDailyReport: {
          edges: [{ cursor: 'attendance-1', node: attendanceRow }],
          pageInfo: { endCursor: null, hasNextPage: false },
        },
      });
    if (document === AdminAttendanceReportSummaryDocument)
      return Promise.resolve({ attendanceReportSummary: attendanceSummary });
    if (document === HrReportRowsDocument)
      return Promise.resolve({
        hrReportRows: {
          columns: ['Report'],
          rows: [[variables?.kind ?? 'unknown']],
          totalRows: 1,
        },
      });
    return Promise.reject(new Error('Unexpected GraphQL document'));
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// eslint-disable-next-line max-lines-per-function
describe('AdminReportsPage report catalogue', () => {
  it('preserves the attendance CSV compatibility export', () => {
    expect(attendanceCsvRows([attendanceRow])[1]).toEqual([
      'Asha Rao',
      'EMP-0042',
      '2026-08-24',
      'Asia/Kolkata',
      '09:00:00',
      '17:30:00',
      'PRESENT',
      510,
      480,
      2,
    ]);
  });

  it('shows no catalogue and performs no request without an exact ALL report permission', () => {
    state.clientSession = session({
      'attendance:read': 'TEAM',
      'leave:read': 'SELF',
      'payroll:manage': 'ALL',
      'analytics:read': 'ALL',
    });
    render(<AdminReportsPage />);
    expect(screen.getByRole('status')).toHaveProperty(
      'textContent',
      'No company reports are available with your permissions.'
    );
    expect(state.client.request).not.toHaveBeenCalled();
  });

  it('renders only report domains granted with exact ALL scope', async () => {
    state.clientSession = session({
      'attendance:read': 'ALL',
      'leave:read': 'SELF',
      'payroll:read': 'ALL',
      'employee:read': 'TEAM',
      'timesheet:read': 'ALL',
    });
    render(<AdminReportsPage />);
    await settle();
    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual([
      'Daily attendance',
      'Attendance punctuality',
      'Payroll register',
      'Unpaid-leave calculations',
      'Timesheet and project hours',
      'Pending requests',
    ]);
    expect(options).not.toContain('Leave requests');
    expect(options).not.toContain('Employee joiners and exits');
  });

  it('integrates cursor-backed daily attendance with the selected period', async () => {
    render(<AdminReportsPage />);
    await settle();
    expect(state.client.request).toHaveBeenCalledWith(
      AdminAttendanceDailyReportDocument,
      expect.objectContaining({
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
        first: 50,
        after: null,
      })
    );
    expect(state.client.request).toHaveBeenCalledWith(
      AdminAttendanceReportSummaryDocument,
      expect.objectContaining({
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
      })
    );
    expect(screen.getByText('Asha Rao (EMP-0042)')).toBeTruthy();
    expect(screen.queryByText(attendanceRow.employeeId)).toBeNull();
  });

  it('switches from attendance to an authorized typed catalogue report', async () => {
    state.clientSession = session({
      'attendance:read': 'ALL',
      'leave:read': 'ALL',
      'employee:read': 'ALL',
    });
    render(<AdminReportsPage />);
    await settle();
    fireEvent.change(screen.getByLabelText('Report'), { target: { value: 'EMPLOYEE_MOVEMENTS' } });
    await settle();
    expect(state.client.request).toHaveBeenCalledWith(
      HrReportRowsDocument,
      expect.objectContaining({
        kind: 'EMPLOYEE_MOVEMENTS',
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
        offset: 0,
      })
    );
    expect(screen.getByText('EMPLOYEE_MOVEMENTS')).toBeTruthy();
  });

  it('never issues an attendance request for a leave-only viewer', async () => {
    state.clientSession = session({ 'leave:read': 'ALL' });
    render(<AdminReportsPage />);
    await settle();
    expect(state.client.request).toHaveBeenCalledWith(
      HrReportRowsDocument,
      expect.objectContaining({ kind: 'LEAVE_REQUESTS' })
    );
    expect(state.client.request).not.toHaveBeenCalledWith(
      AdminAttendanceDailyReportDocument,
      expect.anything()
    );
    expect(state.client.request).not.toHaveBeenCalledWith(
      AdminAttendanceReportSummaryDocument,
      expect.anything()
    );
  });

  it('shows an inverted-range error and does not request data for that range', async () => {
    render(<AdminReportsPage />);
    await settle();
    state.client.request.mockClear();
    fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-09-10' } });
    expect(screen.getByRole('alert')).toHaveProperty(
      'textContent',
      'From date must be on or before to date.'
    );
    await settle();
    expect(state.client.request).not.toHaveBeenCalled();
    expect(screen.queryByText('Asha Rao (EMP-0042)')).toBeNull();
  });
});
