// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  AttendanceAddManagedSegmentDocument,
  AttendanceCorrectionWindowsDocument,
  AttendanceUpdateManagedSegmentDocument,
} from '../../../api/attendance/graphql';

import AttendanceRegularizationModal from './AttendanceRegularizationModal';
import type { ManagedAttendanceEmployee, ManagedAttendanceRow } from './managedAttendanceTypes';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

const employee: ManagedAttendanceEmployee = {
  employeeId: 'employee-42',
  employeeName: 'Asha Rao',
  employeeCode: 'EMP-0042',
};

const row: ManagedAttendanceRow = {
  id: 'attendance-42',
  employeeId: employee.employeeId,
  employeeName: employee.employeeName,
  employeeCode: employee.employeeCode,
  workDate: '2026-08-24',
  checkInTime: '09:00:00',
  checkOutTime: '17:30:00',
  checkInAt: '2026-08-24T03:30:00Z',
  checkOutAt: '2026-08-24T12:00:00Z',
  status: 'PRESENT',
  source: 'BIOMETRIC',
  regularizationStatus: 'REGULARIZED',
  createdAt: '2026-08-24T09:00:00Z',
  updatedAt: '2026-08-24T17:30:00Z',
};

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  employee,
  initialWorkDate: '2026-08-24',
  existingSegments: [row],
  existingSegmentsComplete: false,
  existingSegmentsCoverage: { fromDate: '2026-08-01', toDate: '2026-08-31' },
  onSaved: vi.fn(),
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  return {
    promise: new Promise<T>((done) => {
      resolve = done;
    }),
    resolve,
  };
};

async function fillValidForm(reason = 'Correct biometric outage') {
  await screen.findByText(/Attendance window:/);
  fireEvent.change(screen.getByLabelText('Work Date'), { target: { value: '2026-08-24' } });
  fireEvent.change(screen.getByLabelText('Punch In'), { target: { value: '09:00' } });
  fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '17:30' } });
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: reason } });
}

beforeEach(() => {
  graphState.client = { request: vi.fn() };
  graphState.client.request.mockImplementation((document: unknown) => {
    if (document === AttendanceCorrectionWindowsDocument) {
      return Promise.resolve({
        currentWindow: {
          workDate: '2026-08-25',
          startsAt: '2026-08-24T23:30:00Z',
          endsAt: '2026-08-25T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
        selectedWindow: {
          workDate: '2026-08-24',
          startsAt: '2026-08-23T23:30:00Z',
          endsAt: '2026-08-24T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
      });
    }
    return Promise.resolve({});
  });
  baseProps.onClose.mockReset();
  baseProps.onSaved.mockReset();
});

afterEach(cleanup);

it('adds for an immutable employee using the generated managed mutation and trimmed reason', async () => {
  render(<AttendanceRegularizationModal {...baseProps} />);

  expect(screen.getByText('Asha Rao (EMP-0042)')).toBeTruthy();
  expect(screen.queryByRole('textbox', { name: /employee/i })).toBeNull();
  await fillValidForm('  Correct biometric outage  ');
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));

  await waitFor(() =>
    expect(graphState.client.request).toHaveBeenCalledWith(AttendanceAddManagedSegmentDocument, {
      input: {
        employeeId: 'employee-42',
        workDate: '2026-08-24',
        checkInDate: '2026-08-24',
        checkOutDate: '2026-08-24',
        checkInTime: '09:00:00',
        checkOutTime: '17:30:00',
        reason: 'Correct biometric outage',
      },
    })
  );
  expect(baseProps.onSaved).toHaveBeenCalledWith('Asha Rao', '2026-08-24');
  expect(baseProps.onClose).toHaveBeenCalledTimes(1);
});

it('edits with optimistic concurrency and never sends an employee id', async () => {
  render(<AttendanceRegularizationModal {...baseProps} editingRow={row} />);
  await screen.findByText(/Attendance window:/);
  fireEvent.change(screen.getByLabelText('Reason'), {
    target: { value: 'Manager approved correction' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Update segment' }));

  await waitFor(() =>
    expect(graphState.client.request).toHaveBeenCalledWith(AttendanceUpdateManagedSegmentDocument, {
      input: {
        id: 'attendance-42',
        expectedUpdatedAt: '2026-08-24T17:30:00Z',
        workDate: '2026-08-24',
        checkInDate: '2026-08-24',
        checkOutDate: '2026-08-24',
        checkInTime: '09:00:00',
        checkOutTime: '17:30:00',
        reason: 'Manager approved correction',
      },
    })
  );
  const updateCall = (graphState.client.request.mock.calls as unknown[][]).find(
    ([document]) => document === AttendanceUpdateManagedSegmentDocument
  );
  expect(updateCall?.[1]).not.toHaveProperty('employeeId');
});

it('corrects the original incomplete id with explicit after-midnight dates', async () => {
  const incomplete = {
    ...row,
    id: 'incomplete-42',
    workDate: '2026-08-24',
    checkInAt: '2026-08-24T20:30:00Z',
    checkOutAt: null,
    checkInTime: '02:00:00',
    checkOutTime: null,
    status: 'INCOMPLETE',
  };
  render(<AttendanceRegularizationModal {...baseProps} editingRow={incomplete} />);
  await screen.findByText(/Attendance window:/);
  fireEvent.change(await screen.findByLabelText('Punch In date'), {
    target: { value: '2026-08-25' },
  });
  fireEvent.change(screen.getByLabelText('Punch Out date'), { target: { value: '2026-08-25' } });
  fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '04:00' } });
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Missed punch out' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update segment' }));

  await waitFor(() =>
    expect(graphState.client.request).toHaveBeenCalledWith(AttendanceUpdateManagedSegmentDocument, {
      input: {
        id: 'incomplete-42',
        expectedUpdatedAt: '2026-08-24T17:30:00Z',
        workDate: '2026-08-24',
        checkInDate: '2026-08-25',
        checkOutDate: '2026-08-25',
        checkInTime: '02:00:00',
        checkOutTime: '04:00:00',
        reason: 'Missed punch out',
      },
    })
  );
});

it.each([
  ['four characters', '🙂🙂🙂🙂'],
  ['501 characters', '界'.repeat(501)],
])('rejects a %s reason by Unicode character count and focuses Reason', async (_, reason) => {
  render(<AttendanceRegularizationModal {...baseProps} />);
  await fillValidForm(reason);
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));

  const reasonField = screen.getByLabelText('Reason');
  await waitFor(() => expect(document.activeElement).toBe(reasonField));
  expect(reasonField.getAttribute('aria-invalid')).toBe('true');
  expect(
    graphState.client.request.mock.calls.some(
      ([document]) => document === AttendanceAddManagedSegmentDocument
    )
  ).toBe(false);
});

it.each([
  ['5', `  ${'\u{1F642}'.repeat(5)}  `, '\u{1F642}'.repeat(5)],
  ['500', `  ${'\u754C'.repeat(500)}  `, '\u754C'.repeat(500)],
])('accepts exactly %s trimmed Unicode code points', async (_, reason, normalizedReason) => {
  render(<AttendanceRegularizationModal {...baseProps} />);
  await fillValidForm(reason);
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));

  await waitFor(() =>
    expect(
      graphState.client.request.mock.calls.some(
        ([document]) => document === AttendanceAddManagedSegmentDocument
      )
    ).toBe(true)
  );
  expect(graphState.client.request).toHaveBeenCalledWith(AttendanceAddManagedSegmentDocument, {
    input: expect.objectContaining({ reason: normalizedReason }) as unknown,
  });
});

it('keeps intrinsic time validation while deferring incomplete-page overlap checks to the server', async () => {
  render(<AttendanceRegularizationModal {...baseProps} />);
  await fillValidForm();
  fireEvent.change(screen.getByLabelText('Punch In'), { target: { value: '18:00' } });
  fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));
  expect(await screen.findByText('Punch In must be before Punch Out.')).toBeTruthy();
  expect(
    graphState.client.request.mock.calls.some(
      ([document]) => document === AttendanceAddManagedSegmentDocument
    )
  ).toBe(false);

  fireEvent.change(screen.getByLabelText('Punch In'), { target: { value: '09:30' } });
  fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '10:30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));
  await waitFor(() =>
    expect(
      graphState.client.request.mock.calls.some(
        ([document]) => document === AttendanceAddManagedSegmentDocument
      )
    ).toBe(true)
  );
});

it('blocks a known overlap when the loaded attendance page is complete', async () => {
  render(<AttendanceRegularizationModal {...baseProps} existingSegmentsComplete />);
  await fillValidForm();
  fireEvent.change(screen.getByLabelText('Punch In'), { target: { value: '09:30' } });
  fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '10:30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));

  expect(
    await screen.findByText('This punch range overlaps an existing attendance segment for the day.')
  ).toBeTruthy();
  expect(
    graphState.client.request.mock.calls.some(
      ([document]) => document === AttendanceAddManagedSegmentDocument
    )
  ).toBe(false);
});

it('keeps every entered value and the modal open after a save error', async () => {
  graphState.client.request.mockImplementation((document: unknown) => {
    if (document === AttendanceCorrectionWindowsDocument) {
      return Promise.resolve({
        currentWindow: {
          workDate: '2026-08-25',
          startsAt: '2026-08-24T23:30:00Z',
          endsAt: '2026-08-25T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
        selectedWindow: {
          workDate: '2026-08-24',
          startsAt: '2026-08-23T23:30:00Z',
          endsAt: '2026-08-24T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
      });
    }
    return Promise.reject(new Error('database internals'));
  });
  render(<AttendanceRegularizationModal {...baseProps} />);
  await fillValidForm('Payroll correction reason');
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));

  const failureNotice = (await screen.findByText('Attendance was not saved')).closest(
    '[role="alert"]'
  );
  expect(failureNotice).toBeTruthy();
  await waitFor(() => expect(document.activeElement).toBe(failureNotice));
  expect(screen.getByLabelText<HTMLInputElement>('Work Date').value).toBe('2026-08-24');
  expect(screen.getByLabelText<HTMLInputElement>('Punch In').value).toBe('09:00');
  expect(screen.getByLabelText<HTMLInputElement>('Punch Out').value).toBe('17:30');
  expect(screen.getByLabelText<HTMLTextAreaElement>('Reason').value).toBe(
    'Payroll correction reason'
  );
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(baseProps.onClose).not.toHaveBeenCalled();
});

it('does not publish a late old-client mutation completion after client replacement', async () => {
  const oldMutation = deferred<Record<string, never>>();
  graphState.client.request.mockImplementation((document: unknown) => {
    if (document === AttendanceCorrectionWindowsDocument) {
      return Promise.resolve({
        currentWindow: {
          workDate: '2026-08-25',
          startsAt: '2026-08-24T23:30:00Z',
          endsAt: '2026-08-25T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
        selectedWindow: {
          workDate: '2026-08-24',
          startsAt: '2026-08-23T23:30:00Z',
          endsAt: '2026-08-24T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
      });
    }
    return oldMutation.promise;
  });
  const { rerender } = render(<AttendanceRegularizationModal {...baseProps} />);
  await fillValidForm();
  fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));
  await waitFor(() =>
    expect(
      graphState.client.request.mock.calls.some(
        ([document]) => document === AttendanceAddManagedSegmentDocument
      )
    ).toBe(true)
  );

  graphState.client = { request: vi.fn().mockResolvedValue({}) };
  rerender(<AttendanceRegularizationModal {...baseProps} />);
  await act(async () => {
    oldMutation.resolve({});
    await Promise.resolve();
  });

  expect(baseProps.onSaved).not.toHaveBeenCalled();
  expect(baseProps.onClose).not.toHaveBeenCalled();
});
