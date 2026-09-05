// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ApplyLeaveModal from './ApplyLeaveModal';

const graphClients = vi.hoisted(() => {
  const request = vi.fn();
  return { current: { request }, initialRequest: request };
});
const request = graphClients.initialRequest;

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphClients.current,
}));

beforeEach(() => {
  request.mockReset();
  graphClients.current = { request };
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

const leaveTypes = [
  {
    id: 'annual-leave',
    name: 'Annual Leave',
    code: 'AL',
    isPaid: false,
    halfDayAllowed: true,
  },
];

function renderModal(
  initial: Partial<{
    isOpen: boolean;
    onClose: () => void;
    onSubmitted: () => void;
  }> = {}
) {
  let props = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmitted: vi.fn(),
    ...initial,
  };
  const modal = () => (
    <ApplyLeaveModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      leaveTypes={leaveTypes}
      leavePolicies={[]}
      upcomingHolidays={[]}
      leaveBalances={[]}
      onSubmitted={props.onSubmitted}
    />
  );
  const view = render(modal());
  return {
    ...view,
    onClose: props.onClose,
    onSubmitted: props.onSubmitted,
    rerenderModal: (next: Partial<typeof props> = {}) => {
      props = { ...props, ...next };
      view.rerender(modal());
    },
  };
}

function fillValidRequest() {
  fireEvent.change(screen.getByLabelText('Leave type'), {
    target: { value: 'annual-leave' },
  });
  fireEvent.change(screen.getByLabelText('From'), {
    target: { value: '2026-08-24' },
  });
  fireEvent.change(screen.getByLabelText('To'), {
    target: { value: '2026-08-24' },
  });
  fireEvent.change(screen.getByLabelText('Reason'), {
    target: { value: 'Family appointment' },
  });
}

describe('ApplyLeaveModal', () => {
  it('omits the holiday list while still excluding holidays from the requested balance', async () => {
    request.mockResolvedValue({});
    const onSubmitted = vi.fn();
    render(
      <ApplyLeaveModal
        isOpen
        onClose={vi.fn()}
        onSubmitted={onSubmitted}
        leaveTypes={[{ ...leaveTypes[0], isPaid: true, sandwichRule: false }]}
        leavePolicies={[]}
        upcomingHolidays={[
          {
            id: 'holiday',
            calendarId: 'calendar',
            calendarName: 'Company calendar',
            name: 'Company holiday',
            holidayDate: '2026-08-24',
          },
        ]}
        leaveBalances={[
          {
            id: 'balance',
            leaveTypeId: 'annual-leave',
            year: 2026,
            balanceDays: '1',
            entitledDays: '1',
            usedDays: '0',
            pendingDays: '0',
            carriedForwardDays: '0',
          },
        ]}
      />
    );
    expect(screen.queryByText('Upcoming holidays')).toBeNull();
    expect(screen.queryByText('Company holiday')).toBeNull();
    fillValidRequest();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-08-25' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledOnce());
    expect(screen.queryByText(/Insufficient leave balance/)).toBeNull();
  });

  it('associates validation feedback with the first invalid field and moves focus there', async () => {
    renderModal();

    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);

    const leaveType = screen.getByLabelText('Leave type');
    await waitFor(() => expect(document.activeElement).toBe(leaveType));
    expect(leaveType.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Choose a leave type.').getAttribute('role')).toBe('alert');
    expect(request).not.toHaveBeenCalled();
  });

  it('keeps entered values and focuses a persistent alert when submission fails', async () => {
    request.mockRejectedValueOnce(new Error('network error'));
    renderModal();
    fillValidRequest();

    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);

    const alert = await screen.findByRole('alert');
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect(screen.getByText('Leave application was not submitted')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Reason').value).toBe('Family appointment');
  });

  it('blocks duplicate synchronous submissions while the first request is pending', async () => {
    let resolveRequest!: (value: unknown) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );
    const { onSubmitted } = renderModal();
    fillValidRequest();
    const form = screen.getByRole('button', { name: 'Submit Application' }).closest('form')!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(request).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: /Submit Application/ }).getAttribute('aria-busy')
    ).toBe('true');

    resolveRequest({});
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledOnce());
  });

  it('does not run success callbacks when the submission belongs to a previous client', async () => {
    let resolveOldRequest!: (value: unknown) => void;
    const oldRequest = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveOldRequest = resolve;
        })
    );
    graphClients.current = { request: oldRequest };
    const currentRequest = vi.fn();
    const { onClose, onSubmitted, rerenderModal } = renderModal();
    fillValidRequest();

    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);
    graphClients.current = { request: currentRequest };
    rerenderModal();
    await act(async () => {
      resolveOldRequest({});
      await Promise.resolve();
    });

    expect(onSubmitted).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(currentRequest).not.toHaveBeenCalled();
  });

  it('does not publish an error when the failed submission belongs to a previous client', async () => {
    let rejectOldRequest!: (reason: unknown) => void;
    const oldRequest = vi.fn(
      () =>
        new Promise((_resolve, reject) => {
          rejectOldRequest = reject;
        })
    );
    graphClients.current = { request: oldRequest };
    const { rerenderModal } = renderModal();
    fillValidRequest();

    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);
    graphClients.current = { request: vi.fn() };
    rerenderModal();
    await act(async () => {
      rejectOldRequest(new Error('previous tenant failure'));
      await Promise.resolve();
    });

    expect(screen.queryByText('Leave application was not submitted')).toBeNull();
  });

  it('does not run success callbacks when the dialog has been reopened since submission', async () => {
    let resolveOldRequest!: (value: unknown) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOldRequest = resolve;
        })
    );
    const currentOnClose = vi.fn();
    const currentOnSubmitted = vi.fn();
    const { onClose, onSubmitted, rerenderModal } = renderModal();
    fillValidRequest();

    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);
    rerenderModal({ isOpen: false });
    rerenderModal({
      isOpen: true,
      onClose: currentOnClose,
      onSubmitted: currentOnSubmitted,
    });
    await act(async () => {
      resolveOldRequest({});
      await Promise.resolve();
    });

    expect(onSubmitted).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(currentOnSubmitted).not.toHaveBeenCalled();
    expect(currentOnClose).not.toHaveBeenCalled();
  });

  it('does not publish an error when the dialog has been reopened since submission', async () => {
    let rejectOldRequest!: (reason: unknown) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectOldRequest = reject;
        })
    );
    const { rerenderModal } = renderModal();
    fillValidRequest();

    fireEvent.submit(screen.getByRole('button', { name: 'Submit Application' }).closest('form')!);
    rerenderModal({ isOpen: false });
    rerenderModal({ isOpen: true });
    await act(async () => {
      rejectOldRequest(new Error('previous dialog failure'));
      await Promise.resolve();
    });

    expect(screen.queryByText('Leave application was not submitted')).toBeNull();
  });
});
