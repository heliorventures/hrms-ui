// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ManagedAttendanceTable from './ManagedAttendanceTable';
import type { ManagedAttendanceRow } from './managedAttendanceTypes';

afterEach(cleanup);

const row: ManagedAttendanceRow = {
  id: 'attendance-42',
  employeeId: 'employee-42',
  employeeName: 'Asha Rao',
  employeeCode: 'EMP-0042',
  workDate: '2026-08-24',
  checkInTime: '09:00:00',
  checkOutTime: '17:30:00',
  status: 'PRESENT',
  source: 'BIOMETRIC',
  regularizationStatus: 'REGULARIZED',
  createdAt: '2026-08-24T09:00:00Z',
  updatedAt: '2026-08-24T17:30:00Z',
};

describe('ManagedAttendanceTable', () => {
  it('keeps historical context, punch evidence, statuses and working actions in the mobile row', () => {
    const onAdd = vi.fn();
    const onAdjust = vi.fn();
    render(
      <ManagedAttendanceTable
        rows={[row]}
        loading={false}
        errorMessage={null}
        onAdd={onAdd}
        onAdjust={onAdjust}
      />
    );
    const mobile = within(
      screen.getByRole('list', { name: 'Managed attendance records mobile view' })
    );
    for (const value of [
      'Asha Rao',
      'EMP-0042',
      '2026-08-24',
      '09:00:00',
      '17:30:00',
      'BIOMETRIC',
      'PRESENT',
      'REGULARIZED',
    ]) {
      expect(mobile.getByText(value)).toBeTruthy();
    }
    fireEvent.click(mobile.getByRole('button', { name: 'Add segment for Asha Rao' }));
    expect(onAdd).toHaveBeenCalledWith({
      employeeId: 'employee-42',
      employeeName: 'Asha Rao',
      employeeCode: 'EMP-0042',
      workDate: '2026-08-24',
    });
    fireEvent.click(mobile.getByRole('button', { name: 'Adjust Asha Rao on 2026-08-24' }));
    expect(onAdjust).toHaveBeenCalledWith(row);
  });

  it('renders the employee identity and adjusts the exact selected row', () => {
    const onAdd = vi.fn();
    const onAdjust = vi.fn();
    render(
      <ManagedAttendanceTable
        rows={[row]}
        loading={false}
        errorMessage={null}
        onAdd={onAdd}
        onAdjust={onAdjust}
      />
    );

    expect(screen.getAllByText('Asha Rao')[0]).toBeTruthy();
    expect(screen.getAllByText('EMP-0042')[0]).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Add segment for Asha Rao' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Adjust Asha Rao on 2026-08-24' })[0]);
    expect(onAdd).toHaveBeenCalledWith({
      employeeId: 'employee-42',
      employeeName: 'Asha Rao',
      employeeCode: 'EMP-0042',
      workDate: '2026-08-24',
    });
    expect(onAdjust).toHaveBeenCalledWith(row);
  });

  it('does not render inert actions when no caller owns the handoff', () => {
    render(<ManagedAttendanceTable rows={[row]} loading={false} errorMessage={null} />);
    expect(screen.queryByRole('button', { name: 'Add segment for Asha Rao' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Adjust Asha Rao on 2026-08-24' })).toBeNull();
  });

  it('uses a clear placeholder when a segment is incomplete or invalid', () => {
    render(
      <ManagedAttendanceTable
        rows={[{ ...row, checkInTime: '17:30:00', checkOutTime: '09:00:00' }]}
        loading={false}
        errorMessage={null}
        onAdjust={vi.fn()}
      />
    );

    expect(screen.getAllByText('Unavailable')[0]).toBeTruthy();
  });
});

describe('ManagedAttendanceTable canonical durations', () => {
  it('uses canonical instants for an overnight Kolkata segment', () => {
    render(
      <ManagedAttendanceTable
        rows={[
          {
            ...row,
            checkInAt: '2026-09-11T17:30:00Z',
            checkOutAt: '2026-09-11T22:30:00Z',
            checkInTime: '23:00:00',
            checkOutTime: '04:00:00',
          },
        ]}
        loading={false}
        errorMessage={null}
      />
    );

    expect(screen.getAllByText('5h 00m')[0]).toBeTruthy();
  });

  it('uses canonical instants across DST and keeps partial canonical rows unavailable', () => {
    render(
      <ManagedAttendanceTable
        rows={[
          {
            ...row,
            id: 'dst-complete',
            checkInAt: '2026-11-01T03:00:00Z',
            checkOutAt: '2026-11-01T09:00:00Z',
            checkInTime: '23:00:00',
            checkOutTime: '04:00:00',
          },
          {
            ...row,
            id: 'canonical-incomplete',
            checkInAt: '2026-11-01T03:00:00Z',
            checkOutAt: null,
            checkInTime: '23:00:00',
            checkOutTime: '04:00:00',
          },
        ]}
        loading={false}
        errorMessage={null}
      />
    );

    expect(screen.getAllByText('6h 00m')[0]).toBeTruthy();
    expect(screen.getAllByText('Unavailable')[0]).toBeTruthy();
  });
});
