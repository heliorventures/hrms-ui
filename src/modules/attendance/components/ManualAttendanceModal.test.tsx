// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AttendanceAddManualSegmentDocument,
  AttendanceCorrectionWindowsDocument,
} from '../../../api/attendance/graphql';

import ManualAttendanceModal from './ManualAttendanceModal';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));
const { request } = graphState.client;

function correctionWindows(workDate: string) {
  const start = new Date(`${workDate}T23:30:00Z`);
  start.setUTCDate(start.getUTCDate() - 1);
  return {
    currentWindow: {
      workDate: '2026-09-12',
      startsAt: '2026-09-11T23:30:00Z',
      endsAt: '2026-09-12T23:30:00Z',
      timezone: 'Asia/Kolkata',
      boundaryMinutes: 300,
    },
    selectedWindow: {
      workDate,
      startsAt: start.toISOString(),
      endsAt: `${workDate}T23:30:00.000Z`,
      timezone: 'Asia/Kolkata',
      boundaryMinutes: 300,
    },
  };
}

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

beforeEach(() => {
  request.mockReset();
  request.mockImplementation((document: unknown, variables?: { workDate?: string }) => {
    if (document === AttendanceCorrectionWindowsDocument) {
      return Promise.resolve(correctionWindows(variables?.workDate ?? '2025-01-15'));
    }
    return Promise.resolve({});
  });
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function renderModal(overrides: Partial<React.ComponentProps<typeof ManualAttendanceModal>> = {}) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <ManualAttendanceModal
      isOpen
      onClose={onClose}
      defaultWorkDate="2025-01-15"
      existingSegments={[]}
      selfServiceDays={14}
      canRegularize={false}
      onSaved={onSaved}
      {...overrides}
    />
  );
  return { onClose, onSaved };
}

describe('ManualAttendanceModal', () => {
  it('associates invalid punch order with Punch Out and focuses that field', async () => {
    renderModal();
    const punchIn = screen.getByLabelText('Punch In');
    const punchOut = screen.getByLabelText('Punch Out');
    await screen.findByText(/Attendance window:/);

    fireEvent.change(punchIn, { target: { value: '18:00' } });
    fireEvent.change(punchOut, { target: { value: '09:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => {
      expect(punchOut.getAttribute('aria-invalid')).toBe('true');
      expect(document.activeElement).toBe(punchOut);
    });
    expect(screen.getByText('Punch In must be before Punch Out.')).toBeTruthy();
    expect(
      request.mock.calls.some(([document]) => document === AttendanceAddManualSegmentDocument)
    ).toBe(false);
  });

  it('keeps entered values and focuses a persistent alert when saving fails', async () => {
    request.mockImplementation((document: unknown, variables?: { workDate?: string }) => {
      if (document === AttendanceCorrectionWindowsDocument) {
        return Promise.resolve(correctionWindows(variables?.workDate ?? '2025-01-15'));
      }
      return Promise.reject(new Error('request rejected by upstream API'));
    });
    renderModal();
    const workDate = screen.getByLabelText<HTMLInputElement>('Work Date');
    const punchIn = screen.getByLabelText<HTMLInputElement>('Punch In');
    const punchOut = screen.getByLabelText<HTMLInputElement>('Punch Out');

    fireEvent.change(workDate, { target: { value: '2025-01-16' } });
    await screen.findByText(/16 Jan 2025/);
    fireEvent.change(punchIn, { target: { value: '08:30' } });
    fireEvent.change(punchOut, { target: { value: '17:15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    const alert = await screen.findByRole('alert');
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect(screen.getByText('Attendance was not saved')).toBeTruthy();
    expect(workDate.value).toBe('2025-01-16');
    expect(punchIn.value).toBe('08:30');
    expect(punchOut.value).toBe('17:15');
  });

  it('closes only after the attendance segment is saved', async () => {
    const { onClose, onSaved } = renderModal();
    await screen.findByText(/Attendance window:/);

    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('updates the original incomplete segment with explicit overnight calendar dates', async () => {
    request.mockImplementation((document: unknown) => {
      if (document === AttendanceCorrectionWindowsDocument) {
        return Promise.resolve({
          currentWindow: {
            workDate: '2026-09-12',
            startsAt: '2026-09-11T23:30:00Z',
            endsAt: '2026-09-12T23:30:00Z',
            timezone: 'Asia/Kolkata',
            boundaryMinutes: 300,
          },
          selectedWindow: {
            workDate: '2026-09-11',
            startsAt: '2026-09-10T23:30:00Z',
            endsAt: '2026-09-11T23:30:00Z',
            timezone: 'Asia/Kolkata',
            boundaryMinutes: 300,
          },
        });
      }
      return Promise.resolve({});
    });
    renderModal({
      defaultWorkDate: '2026-09-11',
      editingSegmentId: 'incomplete-1',
      defaultCheckIn: '02:00:00',
      defaultCheckOut: null,
      defaultCheckInAt: '2026-09-11T20:30:00Z',
      defaultCheckOutAt: null,
    });
    await screen.findByText(/Attendance window:/);
    fireEvent.change(await screen.findByLabelText('Punch In date'), {
      target: { value: '2026-09-12' },
    });
    fireEvent.change(screen.getByLabelText('Punch Out date'), {
      target: { value: '2026-09-12' },
    });
    fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '04:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Segment' }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(expect.anything(), {
        input: {
          id: 'incomplete-1',
          workDate: '2026-09-11',
          checkInDate: '2026-09-12',
          checkOutDate: '2026-09-12',
          checkInTime: '02:00:00',
          checkOutTime: '04:00:00',
        },
      })
    );
  });
});

describe('ManualAttendanceModal loaded-coverage safeguards', () => {
  it('submits an overlapping range when the supplied segments are explicitly incomplete', async () => {
    const { onClose, onSaved } = renderModal({
      defaultCheckIn: '10:00:00',
      defaultCheckOut: '12:00:00',
      existingSegmentsComplete: false,
      existingSegments: [
        {
          id: 'other-segment',
          workDate: '2025-01-15',
          checkInTime: '08:00:00',
          checkOutTime: '11:00:00',
        },
      ],
    });
    await screen.findByText(/Attendance window:/);

    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('defers overlap checks when Add defaults outside a historical loaded range', async () => {
    const { onClose, onSaved } = renderModal({
      defaultWorkDate: '2026-08-24',
      defaultCheckIn: '10:00:00',
      defaultCheckOut: '12:00:00',
      existingSegmentsComplete: true,
      existingSegmentsCoverage: { fromDate: '2025-01-01', toDate: '2025-01-31' },
      existingSegments: [
        {
          id: 'outside-range',
          workDate: '2026-08-24',
          checkInTime: '08:00:00',
          checkOutTime: '11:00:00',
        },
      ],
    });
    await screen.findByText(/Attendance window:/);

    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('defers overlap checks after the user changes the date outside loaded coverage', async () => {
    const { onClose, onSaved } = renderModal({
      defaultWorkDate: '2025-01-15',
      defaultCheckIn: '10:00:00',
      defaultCheckOut: '12:00:00',
      existingSegmentsComplete: true,
      existingSegmentsCoverage: { fromDate: '2025-01-01', toDate: '2025-01-31' },
      existingSegments: [
        {
          id: 'outside-range',
          workDate: '2026-08-24',
          checkInTime: '08:00:00',
          checkOutTime: '11:00:00',
        },
      ],
    });

    fireEvent.change(screen.getByLabelText('Work Date'), { target: { value: '2026-08-24' } });
    await screen.findByText(/24 Aug 2026/);
    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });
});
