// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toDateInputValue } from '../../../utils/dateInput';

import OnLeaveToday from './OnLeaveToday';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const today = () => toDateInputValue(new Date());

const leaveRequest = (index: number) => ({
  id: `leave-${index}`,
  employeeId: `employee-${index}`,
  leaveTypeId: `type-${index}`,
  fromDate: today(),
  toDate: today(),
  status: 'approved',
  isHalfDay: false,
  halfDaySession: null,
});

const leaveType = (index: number) => ({
  id: `type-${index}`,
  name: `Leave Type ${index}`,
  code: `LT${index}`,
});

const orgRow = (index: number) => ({
  employeeId: `employee-${index}`,
  fullName: `Employee ${index}`,
  employeeCode: `E${index}`,
});

const payload = (requestCount = 1, orgCount = 1, typeCount = 1) => ({
  leaveRequests: Array.from({ length: requestCount }, (_, index) => leaveRequest(index)),
  leaveTypes: Array.from({ length: typeCount }, (_, index) => leaveType(index)),
  orgChart: Array.from({ length: orgCount }, (_, index) => orgRow(index)),
});

function renderCard() {
  return render(
    <MemoryRouter future={routerFuture}>
      <OnLeaveToday />
    </MemoryRouter>
  );
}

beforeEach(() => {
  graphState.client.request = vi.fn().mockResolvedValue(payload());
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('OnLeaveToday truthful states', () => {
  it('renders an actionable initial failure without valid empty copy', async () => {
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));
    renderCard();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Leave Requests Could Not Be Loaded');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.queryByText('No One Is on Leave Today.')).toBeNull();
  });

  it('renders intentional empty copy after a successful empty response', async () => {
    graphState.client.request.mockResolvedValue(payload(0, 0, 0));
    renderCard();

    expect(await screen.findByText('No One Is on Leave Today.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows loading while retrying an initial failure and then renders ready data', async () => {
    const retry = deferred<ReturnType<typeof payload>>();
    graphState.client.request
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockImplementationOnce(() => retry.promise);
    const user = userEvent.setup();
    renderCard();

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Loading Leave Requests…')).toBeTruthy();

    act(() => retry.resolve(payload()));
    expect(await screen.findByText('Employee 0')).toBeTruthy();
  });

  it('retains the last loaded leave list after a refresh failure', async () => {
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Employee 0');
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));

    await user.click(screen.getByRole('button', { name: 'Refresh Leave Requests' }));

    expect(await screen.findByText('Leave Requests May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Employee 0')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('shows possibility wording for every source collection at its exact cap', async () => {
    graphState.client.request.mockResolvedValue(payload(50, 500, 50));
    renderCard();

    await screen.findByText('Employee 0');
    expect(
      screen.getByText('Showing up to 50 leave requests. More may be available.')
    ).toBeTruthy();
    expect(
      screen.getByText('Showing up to 500 organization records. More may be available.')
    ).toBeTruthy();
    expect(screen.getByText('Showing up to 50 leave types. More may be available.')).toBeTruthy();
    expect(graphState.client.request).toHaveBeenCalledWith(expect.anything(), {
      limit: 50,
      orgLim: 500,
      typeLim: 50,
      today: toDateInputValue(new Date()),
    });
  });

  it('does not claim nobody is on leave when fifty loaded requests filter to no approved rows', async () => {
    graphState.client.request.mockResolvedValue({
      leaveRequests: Array.from({ length: 50 }, (_, index) => ({
        ...leaveRequest(index),
        status: 'pending',
      })),
      leaveTypes: [],
      orgChart: [],
    });
    renderCard();

    expect(
      await screen.findByText('No Approved Leave Is Shown in the Loaded Results.')
    ).toBeTruthy();
    expect(screen.getByText('More may be available.')).toBeTruthy();
    expect(screen.queryByText('No One Is on Leave Today.')).toBeNull();
    expect(
      screen.getByText('Showing up to 50 leave requests. More may be available.')
    ).toBeTruthy();
  });

  it('contains long employee fallback identifiers and uses a Title Case calendar link', async () => {
    const longEmployeeId = `employee-${'Y'.repeat(180)}`;
    graphState.client.request.mockResolvedValue({
      leaveRequests: [{ ...leaveRequest(0), employeeId: longEmployeeId }],
      leaveTypes: [leaveType(0)],
      orgChart: [],
    });
    renderCard();

    const employeeName = await screen.findByText(longEmployeeId);
    expect(employeeName.className).toContain('break-words');
    expect(employeeName.className).toContain('[overflow-wrap:anywhere]');
    expect(employeeName.parentElement?.className).toContain('min-w-0');
    expect(employeeName.parentElement?.className).toContain('flex-1');
    expect(screen.getByRole('link', { name: 'Show All on Calendar →' })).toBeTruthy();
  });
});
