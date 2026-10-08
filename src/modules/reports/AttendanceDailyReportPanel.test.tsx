// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AdminAttendanceDailyReportDocument,
  AdminAttendanceExportPageDocument,
  AdminAttendanceReportSummaryDocument,
} from '../../api/graphql/graphql';

import AttendanceDailyReportPanel, { attendanceCsvRows } from './AttendanceDailyReportPanel';

const state = vi.hoisted(() => ({
  auth: {
    tenantId: 'tenant-a',
    clientSession: {
      jwtRoles: ['HR_ADMIN'],
      permissions: new Set(['attendance:read']),
      permissionScopes: { 'attendance:read': 'ALL' },
      resourceScopes: {},
      employeeId: 'viewer-a',
      persona: 'HR' as const,
      mustChangePassword: false,
    },
  },
  client: { request: vi.fn() },
}));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));

const row = {
  employeeId: 'employee-1',
  employeeName: 'Asha Rao',
  employeeCode: 'EMP-0042',
  workDate: '2026-09-01',
  timezone: 'Asia/Kolkata',
  firstCheckInAt: '2026-09-01T03:30:00Z',
  lastCheckOutAt: '2026-09-01T12:00:00Z',
  loggedMinutes: 510,
  expectedMinutes: 480,
  status: 'PRESENT',
  segmentCount: 2,
};

const summary = {
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

const page = (endCursor: string | null, hasNextPage: boolean, rows = [row]) => ({
  attendanceDailyReport: {
    edges: rows.map((node, index) => ({ cursor: `row-${index}`, node })),
    pageInfo: { endCursor, hasNextPage },
  },
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

let downloadClicks = 0;

beforeEach(() => {
  state.auth.tenantId = 'tenant-a';
  downloadClicks = 0;
  state.auth.clientSession = {
    jwtRoles: ['HR_ADMIN'],
    permissions: new Set(['attendance:read']),
    permissionScopes: { 'attendance:read': 'ALL' },
    resourceScopes: {},
    employeeId: 'viewer-a',
    persona: 'HR',
    mustChangePassword: false,
  };
  state.client = { request: vi.fn() };
  state.client.request.mockImplementation((document: unknown) => {
    if (document === AdminAttendanceDailyReportDocument) return Promise.resolve(page('next', true));
    if (document === AdminAttendanceReportSummaryDocument) {
      return Promise.resolve({ attendanceReportSummary: summary });
    }
    if (document === AdminAttendanceExportPageDocument) return Promise.resolve(page(null, false));
    return Promise.reject(new Error('Unexpected document'));
  });
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:attendance'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
    downloadClicks += 1;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// eslint-disable-next-line max-lines-per-function
describe('AttendanceDailyReportPanel', () => {
  it('does not query without attendance:read ALL', async () => {
    state.auth.clientSession.permissionScopes = { 'attendance:read': 'TEAM' };

    render(<AttendanceDailyReportPanel fromDate="2026-09-01" toDate="2026-09-30" />);

    expect(await screen.findByText(/not authorized to view company attendance/i)).toBeTruthy();
    expect(state.client.request).not.toHaveBeenCalled();
  });

  it('loads 50-row pages and sends trimmed employee search to both server queries', async () => {
    render(<AttendanceDailyReportPanel fromDate="2026-09-01" toDate="2026-09-30" />);
    await screen.findByText('Asha Rao (EMP-0042)');

    fireEvent.change(screen.getByLabelText('Employee search'), { target: { value: '  Asha  ' } });

    await waitFor(() =>
      expect(state.client.request).toHaveBeenCalledWith(
        AdminAttendanceDailyReportDocument,
        expect.objectContaining({ employeeSearch: 'Asha', first: 50, after: null })
      )
    );
    expect(state.client.request).toHaveBeenCalledWith(
      AdminAttendanceReportSummaryDocument,
      expect.objectContaining({ employeeSearch: 'Asha' })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(state.client.request).toHaveBeenCalledWith(
        AdminAttendanceDailyReportDocument,
        expect.objectContaining({ after: 'next' })
      )
    );
  });

  it('shows a request error and retries the same filters', async () => {
    state.client.request.mockRejectedValueOnce(new Error('attendance unavailable'));

    render(<AttendanceDailyReportPanel fromDate="2026-09-01" toDate="2026-09-30" />);
    expect((await screen.findByRole('alert')).textContent).toContain('Try again');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Asha Rao (EMP-0042)')).toBeTruthy();
  });

  it('downloads only after exhausting every 100-row cursor page', async () => {
    state.client.request.mockImplementation((document: unknown, variables?: { after?: string }) => {
      if (document === AdminAttendanceDailyReportDocument)
        return Promise.resolve(page(null, false));
      if (document === AdminAttendanceReportSummaryDocument) {
        return Promise.resolve({ attendanceReportSummary: summary });
      }
      if (document === AdminAttendanceExportPageDocument) {
        return Promise.resolve(
          variables?.after === 'export-next' ? page(null, false) : page('export-next', true)
        );
      }
      return Promise.reject(new Error('Unexpected document'));
    });
    render(<AttendanceDailyReportPanel fromDate="2026-09-01" toDate="2026-09-30" />);
    await screen.findByText('Asha Rao (EMP-0042)');

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(downloadClicks).toBe(1));
    const exportCalls = state.client.request.mock.calls.filter(
      ([document]) => document === AdminAttendanceExportPageDocument
    );
    expect(exportCalls).toHaveLength(2);
    expect(state.client.request).toHaveBeenCalledWith(
      AdminAttendanceExportPageDocument,
      expect.objectContaining({ first: 100, after: null })
    );
    expect(state.client.request).toHaveBeenCalledWith(
      AdminAttendanceExportPageDocument,
      expect.objectContaining({ first: 100, after: 'export-next' })
    );
  });

  it('rejects repeated export cursors without downloading a partial file', async () => {
    state.client.request.mockImplementation((document: unknown) => {
      if (document === AdminAttendanceDailyReportDocument)
        return Promise.resolve(page(null, false));
      if (document === AdminAttendanceReportSummaryDocument) {
        return Promise.resolve({ attendanceReportSummary: summary });
      }
      if (document === AdminAttendanceExportPageDocument)
        return Promise.resolve(page('same', true));
      return Promise.reject(new Error('Unexpected document'));
    });
    render(<AttendanceDailyReportPanel fromDate="2026-09-01" toDate="2026-09-30" />);
    await screen.findByText('Asha Rao (EMP-0042)');

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Try again');
    expect(downloadClicks).toBe(0);
  });

  it('does not download results after the tenant, client, or filter owner changes', async () => {
    const pending = deferred<ReturnType<typeof page>>();
    state.client.request.mockImplementation((document: unknown) => {
      if (document === AdminAttendanceDailyReportDocument)
        return Promise.resolve(page(null, false));
      if (document === AdminAttendanceReportSummaryDocument) {
        return Promise.resolve({ attendanceReportSummary: summary });
      }
      if (document === AdminAttendanceExportPageDocument) return pending.promise;
      return Promise.reject(new Error('Unexpected document'));
    });
    const view = render(<AttendanceDailyReportPanel fromDate="2026-09-01" toDate="2026-09-30" />);
    await screen.findByText('Asha Rao (EMP-0042)');
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    state.auth.tenantId = 'tenant-b';
    state.client = { request: vi.fn().mockResolvedValue(page(null, false)) };
    view.rerender(<AttendanceDailyReportPanel fromDate="2026-10-01" toDate="2026-10-31" />);
    act(() => pending.resolve(page(null, false)));

    expect(downloadClicks).toBe(0);
  });

  it('keeps attendance CSV columns and tenant-time formatting compatible', () => {
    expect(attendanceCsvRows([row])).toEqual([
      [
        'Employee',
        'Employee Code',
        'Work Date',
        'Timezone',
        'First Punch In',
        'Last Punch Out',
        'Status',
        'Logged Minutes',
        'Expected Minutes',
        'Punch Segments',
      ],
      [
        'Asha Rao',
        'EMP-0042',
        '2026-09-01',
        'Asia/Kolkata',
        '09:00:00',
        '17:30:00',
        'PRESENT',
        510,
        480,
        2,
      ],
    ]);
  });
});
