// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AdminAttendanceDailyReportDocument,
  AdminAttendanceReportSummaryDocument,
} from '../../api/graphql/graphql';
import AdminReportsPage, { attendanceCsvRows } from './AdminReportsPage';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

const row = {
  employeeId: '5e965d09-cdce-45db-9794-d235f274b223',
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

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 25, 12));
  graphState.client = { request: vi.fn() };
  graphState.client.request.mockImplementation((document: unknown) => {
    if (typeof document === 'string' && document.includes('ClientOpsAdminReportsReferenceData')) {
      return Promise.resolve({
        employees: [
          {
            id: row.employeeId,
            employeeCode: row.employeeCode,
            fullName: row.employeeName,
          },
        ],
        leaveRequests: [
          {
            id: 'leave-1',
            employeeId: row.employeeId,
            fromDate: '2026-08-20',
            toDate: '2026-08-21',
            status: 'APPROVED',
          },
        ],
        payrollCycles: [
          {
            id: 'cycle-1',
            name: 'August 2026 Payroll',
            month: 8,
            year: 2026,
            status: 'COMPLETED',
            paymentDate: '2026-08-31',
          },
        ],
        salaryComponents: [],
      });
    }
    if (document === AdminAttendanceDailyReportDocument) {
      return Promise.resolve({
        attendanceDailyReport: {
          edges: [{ cursor: 'row-1', node: row }],
          pageInfo: { endCursor: 'next-cursor', hasNextPage: true },
        },
      });
    }
    if (document === AdminAttendanceReportSummaryDocument) {
      return Promise.resolve({
        attendanceReportSummary: {
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
        },
      });
    }
    return Promise.reject(new Error('Unexpected GraphQL document'));
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('AdminReportsPage attendance contract', () => {
  it('exports punch instants in each row tenant timezone', () => {
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
        '2026-08-24',
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

  it('uses generated server page and summary data with complete row identity', async () => {
    render(<AdminReportsPage />);
    await settle();

    expect(graphState.client.request).toHaveBeenCalledWith(
      AdminAttendanceDailyReportDocument,
      expect.objectContaining({
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
        first: 50,
        after: null,
      })
    );
    expect(graphState.client.request).toHaveBeenCalledWith(
      AdminAttendanceReportSummaryDocument,
      expect.objectContaining({ fromDate: '2026-08-01', toDate: '2026-08-31' })
    );
    expect(screen.getAllByText('Asha Rao (EMP-0042)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8h 30m')).toHaveLength(2);
    expect(screen.queryByText(row.employeeId)).toBeNull();
  });

  it('advances with the opaque server cursor', async () => {
    render(<AdminReportsPage />);
    await settle();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await settle();

    expect(graphState.client.request).toHaveBeenCalledWith(
      AdminAttendanceDailyReportDocument,
      expect.objectContaining({ after: 'next-cursor' })
    );
  });

  it('uses the selected employee id for attendance instead of an ambiguous name search', async () => {
    render(<AdminReportsPage />);
    await settle();

    fireEvent.change(screen.getByLabelText('Employee'), {
      target: { value: row.employeeId },
    });
    await settle();

    expect(graphState.client.request).toHaveBeenLastCalledWith(
      AdminAttendanceReportSummaryDocument,
      expect.objectContaining({ employeeId: row.employeeId, employeeSearch: null })
    );
  });

  it('renders leave and payroll detail rows below their summaries', async () => {
    render(<AdminReportsPage />);
    await settle();

    fireEvent.change(screen.getByLabelText('Report Type'), { target: { value: 'leave' } });
    expect(screen.getByText('Leave Report Details')).toBeTruthy();
    expect(screen.getByText('2026-08-20')).toBeTruthy();
    expect(screen.getByText('APPROVED')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Report Type'), { target: { value: 'payroll' } });
    expect(screen.getByText('Payroll Cycle Details')).toBeTruthy();
    expect(screen.getByText('August 2026 Payroll')).toBeTruthy();
    expect(screen.getByText('COMPLETED')).toBeTruthy();
  });
});
