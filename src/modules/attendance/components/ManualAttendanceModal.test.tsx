// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ManualAttendanceModal from './ManualAttendanceModal';

const request = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => ({ request }),
}));

beforeEach(() => {
  request.mockReset();
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

    fireEvent.change(punchIn, { target: { value: '18:00' } });
    fireEvent.change(punchOut, { target: { value: '09:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => {
      expect(punchOut.getAttribute('aria-invalid')).toBe('true');
      expect(document.activeElement).toBe(punchOut);
    });
    expect(
      screen.getByText('Punch In must be before Punch Out for the same calendar day.')
    ).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it('keeps entered values and focuses a persistent alert when saving fails', async () => {
    request.mockRejectedValueOnce(new Error('request rejected by upstream API'));
    renderModal();
    const workDate = screen.getByLabelText<HTMLInputElement>('Work Date');
    const punchIn = screen.getByLabelText<HTMLInputElement>('Punch In');
    const punchOut = screen.getByLabelText<HTMLInputElement>('Punch Out');

    fireEvent.change(workDate, { target: { value: '2025-01-16' } });
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
    request.mockResolvedValueOnce({});
    const { onClose, onSaved } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('submits an overlapping range when the supplied segments are explicitly incomplete', async () => {
    request.mockResolvedValueOnce({});
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

    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('defers overlap checks when Add defaults outside a historical loaded range', async () => {
    request.mockResolvedValueOnce({});
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

    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('defers overlap checks after the user changes the date outside loaded coverage', async () => {
    request.mockResolvedValueOnce({});
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
    fireEvent.click(screen.getByRole('button', { name: 'Save Segment' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });
});
