// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AttendanceReportDetails, { type AttendanceDailyRow } from './AttendanceReportDetails';

afterEach(cleanup);

describe('AttendanceReportDetails', () => {
  it('renders row-owned identity, consolidated duration, and server status without UUID labels', () => {
    const row: AttendanceDailyRow = {
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

    render(
      <AttendanceReportDetails
        rows={[row]}
        loading={false}
        canGoBack={false}
        canGoForward
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByText('Asha Rao (EMP-0042)')).toBeTruthy();
    expect(screen.getByText('8h 30m')).toBeTruthy();
    expect(screen.getByText('8h 00m')).toBeTruthy();
    expect(screen.getByText('Present')).toBeTruthy();
    expect(screen.queryByText(row.employeeId)).toBeNull();
  });
});
