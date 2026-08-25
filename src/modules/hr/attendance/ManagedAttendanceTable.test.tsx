// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  it('renders the employee identity and adjusts the exact selected row', () => {
    const onAdd = vi.fn();
    const onAdjust = vi.fn();
    render(<ManagedAttendanceTable rows={[row]} loading={false} errorMessage={null} onAdd={onAdd} onAdjust={onAdjust} />);

    expect(screen.getByText('Asha Rao')).toBeTruthy();
    expect(screen.getByText('EMP-0042')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add segment for Asha Rao' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adjust Asha Rao on 2026-08-24' }));
    expect(onAdd).toHaveBeenCalledWith({ employeeId: 'employee-42', employeeName: 'Asha Rao', employeeCode: 'EMP-0042' });
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

    expect(screen.getByText('Unavailable')).toBeTruthy();
  });
});
