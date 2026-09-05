// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PunchDaySummaryDocument, PunchTodayDocument } from '../../../api/graphql/graphql';

import PunchInOut from './PunchInOut';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: new Set<string>(),
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'employee-1',
      permissions: graphState.permissions,
      permissionScopes: { 'attendance:read': 'SELF', 'attendance:punch_self': 'SELF' },
      resourceScopes: {},
    },
  }),
}));

vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { timezone: 'Asia/Kolkata' } }),
}));

const deferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
};

const segment = (index: number) => ({
  id: `segment-${index}`,
  checkInTime: '2026-08-21T09:00:00.000Z',
  checkOutTime: '2026-08-21T10:00:00.000Z',
  checkInLat: null,
  checkInLng: null,
  checkOutLat: null,
  checkOutLng: null,
  source: 'web',
  status: 'completed',
});

const summary = (segmentCount = 1) => ({
  punchDaySummary: {
    workDate: '2026-08-21',
    totalWorkedMinutes: segmentCount * 60,
    openSegment: null,
    segments: Array.from({ length: segmentCount }, (_, index) => segment(index)),
  },
});

const openSummary = () => ({
  punchDaySummary: {
    ...summary(0).punchDaySummary,
    openSegment: { ...segment(3), checkOutTime: null },
  },
});

function renderCard() {
  return render(<PunchInOut />);
}

beforeEach(() => {
  vi.setSystemTime(new Date('2026-08-21T12:00:00Z'));
  graphState.permissions = new Set(['attendance:read', 'attendance:punch_self']);
  graphState.client.request = vi.fn((document) => {
    if (document === PunchDaySummaryDocument) return Promise.resolve(summary());
    return Promise.resolve({ punchToday: segment(2) });
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('PunchInOut truthful states', () => {
  it('does not render or request attendance without attendance:read', async () => {
    graphState.permissions = new Set();
    const view = renderCard();

    await act(async () => Promise.resolve());
    expect(view.container.innerHTML).toBe('');
    expect(graphState.client.request).not.toHaveBeenCalled();
  });

  it('loads attendance read-only without rendering punch controls', async () => {
    graphState.permissions = new Set(['attendance:read']);
    renderCard();

    expect(await screen.findByText('Segment 1')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Punch In' })).toBeNull();
    expect(graphState.client.request).toHaveBeenCalledWith(PunchDaySummaryDocument);
  });

  it('renders an actionable summary failure and disables punching until summary data is ready', async () => {
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));
    renderCard();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Attendance Summary Could Not Be Loaded');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);
    expect(screen.queryByText('No Attendance Recorded Today.')).toBeNull();
  });

  it('renders intentional empty copy for a successfully loaded day without attendance', async () => {
    graphState.client.request.mockResolvedValue(summary(0));
    renderCard();

    expect(await screen.findByText('No Attendance Recorded Today.')).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(
      false
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows loading while retrying an initial summary failure and then renders ready data', async () => {
    const retry = deferred<ReturnType<typeof summary>>();
    graphState.client.request
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockImplementationOnce(() => retry.promise);
    const user = userEvent.setup();
    renderCard();

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Loading Attendance Summary…')).toBeTruthy();

    act(() => retry.resolve(summary()));
    expect(await screen.findByText('Segment 1')).toBeTruthy();
  });

  it('retains the attendance summary after its refresh fails', async () => {
    const retry = deferred<ReturnType<typeof summary>>();
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Segment 1');
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));

    await user.click(screen.getByRole('button', { name: 'Refresh Attendance Summary' }));

    expect(await screen.findByText('Attendance Summary May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Segment 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);

    graphState.client.request.mockImplementationOnce(() => retry.promise);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);
    act(() => retry.resolve(summary()));
    await screen.findByText('Segment 1');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(
      false
    );
  });

  it('keeps punching disabled when mutation success is followed by a failed summary refresh', async () => {
    const retry = deferred<ReturnType<typeof openSummary>>();
    let summaryRequestCount = 0;
    graphState.client.request = vi.fn((document) => {
      if (document === PunchDaySummaryDocument) {
        summaryRequestCount += 1;
        if (summaryRequestCount === 1) return Promise.resolve(summary());
        if (summaryRequestCount === 2) return Promise.reject(new Error('Failed to fetch'));
        return retry.promise;
      }
      if (document === PunchTodayDocument) return Promise.resolve({ punchToday: segment(2) });
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Segment 1');
    await user.click(screen.getByRole('checkbox', { name: /Record GPS location/i }));

    await user.click(screen.getByRole('button', { name: 'Punch In' }));

    expect(await screen.findByText('Attendance Summary May Be Out of Date')).toBeTruthy();
    expect(screen.getByText(/Source: web/)).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);
    act(() => retry.resolve(openSummary()));
    expect(await screen.findByRole('button', { name: 'Punch Out' })).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch Out' }).disabled).toBe(
      false
    );
  });

  it('keeps mutation errors separate from the loaded summary', async () => {
    graphState.client.request = vi.fn((document) => {
      if (document === PunchDaySummaryDocument) return Promise.resolve(summary());
      if (document === PunchTodayDocument) return Promise.reject(new Error('Failed to fetch'));
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Segment 1');
    await user.click(screen.getByRole('checkbox', { name: /Record GPS location/i }));

    await user.click(screen.getByRole('button', { name: 'Punch In' }));

    expect(await screen.findByText('Punch Could Not Be Recorded')).toBeTruthy();
    expect(screen.getByText('Segment 1')).toBeTruthy();
    expect(screen.queryByText('Attendance Summary May Be Out of Date')).toBeNull();
  });
});

describe('PunchInOut submission and display safeguards', () => {
  it('prevents duplicate punch submissions while a mutation is busy', async () => {
    const mutation = deferred<{ punchToday: ReturnType<typeof segment> }>();
    graphState.client.request = vi.fn((document) => {
      if (document === PunchDaySummaryDocument) return Promise.resolve(summary());
      if (document === PunchTodayDocument) return mutation.promise;
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Segment 1');
    await user.click(screen.getByRole('checkbox', { name: /Record GPS location/i }));

    const punchButton = screen.getByRole('button', { name: 'Punch In' });
    await user.dblClick(punchButton);

    expect(graphState.client.request).toHaveBeenCalledTimes(2);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Recording/i }).disabled).toBe(
      true
    );
    act(() => mutation.resolve({ punchToday: segment(2) }));
    expect(await screen.findByText(/Source: web/)).toBeTruthy();
  });

  it('does not invent source-cap copy for attendance segments', async () => {
    graphState.client.request.mockResolvedValue(summary(20));
    renderCard();

    await screen.findByText('Segment 20');
    expect(screen.queryByText(/More may be available\./)).toBeNull();
  });

  it('uses platform-neutral helper copy with curly quotes for an open segment', async () => {
    graphState.client.request.mockResolvedValue(openSummary());
    renderCard();

    const helper = await screen.findByText(/Open: checked in at/);
    expect(helper.textContent).toContain('Select “Punch Out” to close this block.');
    expect(helper.textContent).not.toContain('tap');
    expect(helper.textContent).not.toContain('"Punch Out"');
  });
});
