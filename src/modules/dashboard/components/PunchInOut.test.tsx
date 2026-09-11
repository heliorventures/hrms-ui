// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AttendancePunchDaySummaryDocument,
  AttendancePunchTodayDocument,
} from '../../../api/attendance/graphql';

import PunchInOut from './PunchInOut';

const graphState = vi.hoisted(() => ({
  client: { request: vi.fn() },
  permissions: new Set<string>(),
  tenantId: 'tenant-1',
  userId: 'user-1',
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    tenantId: graphState.tenantId,
    user: { id: graphState.userId },
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
    startsAt: '2026-08-20T23:30:00Z',
    endsAt: '2026-08-21T23:30:00Z',
    timezone: 'Asia/Kolkata',
    boundaryMinutes: 300,
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
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-08-21T12:00:00Z'));
  graphState.permissions = new Set(['attendance:read', 'attendance:punch_self']);
  graphState.tenantId = 'tenant-1';
  graphState.userId = 'user-1';
  graphState.client.request = vi.fn((document) => {
    if (document === AttendancePunchDaySummaryDocument) return Promise.resolve(summary());
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

    expect(await screen.findByText('Session 1')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Punch In' })).toBeNull();
    expect(graphState.client.request).toHaveBeenCalledWith(AttendancePunchDaySummaryDocument);
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

  it('accepts the server-owned prior work date before the tenant boundary', async () => {
    vi.setSystemTime(new Date('2026-08-21T20:00:00Z'));
    renderCard();

    expect(await screen.findByText('Attendance work date: 2026-08-21')).toBeTruthy();
    expect(screen.getByText(/05:00.*05:00.*Asia\/Kolkata/)).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(
      false
    );
  });

  it('invalidates at the exact exclusive end and loads the replacement summary', async () => {
    vi.setSystemTime(new Date('2026-08-21T23:29:59Z'));
    const next = summary(0);
    next.punchDaySummary.workDate = '2026-08-22';
    next.punchDaySummary.startsAt = '2026-08-21T23:30:00Z';
    next.punchDaySummary.endsAt = '2026-08-22T23:30:00Z';
    graphState.client.request.mockResolvedValueOnce(summary()).mockResolvedValueOnce(next);
    renderCard();
    await screen.findByText('Session 1');

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText('Attendance work date: 2026-08-22')).toBeTruthy();
    expect(graphState.client.request).toHaveBeenCalledTimes(2);
  });

  it('refreshes stale attendance once when the window regains focus', async () => {
    renderCard();
    await screen.findByText('Session 1');
    window.dispatchEvent(new Event('focus'));
    await waitFor(() => expect(graphState.client.request).toHaveBeenCalledTimes(2));
  });
});

describe('PunchInOut lifecycle ownership', () => {
  it('keeps one focus listener after a StrictMode remount', async () => {
    render(
      <StrictMode>
        <PunchInOut />
      </StrictMode>
    );
    await screen.findByText('Session 1');
    const initialSummaryRequests = graphState.client.request.mock.calls.filter(
      ([document]) => document === AttendancePunchDaySummaryDocument
    ).length;

    window.dispatchEvent(new Event('focus'));

    await waitFor(() =>
      expect(
        graphState.client.request.mock.calls.filter(
          ([document]) => document === AttendancePunchDaySummaryDocument
        )
      ).toHaveLength(initialSummaryRequests + 1)
    );
  });

  it('does not publish a late focus refresh after the tenant and client change', async () => {
    const stale = deferred<ReturnType<typeof summary>>();
    const oldClient = graphState.client;
    oldClient.request.mockResolvedValueOnce(summary()).mockImplementationOnce(() => stale.promise);
    const view = renderCard();
    await screen.findByText('Attendance work date: 2026-08-21');

    window.dispatchEvent(new Event('focus'));
    await waitFor(() => expect(oldClient.request).toHaveBeenCalledTimes(2));

    const replacement = summary(0);
    replacement.punchDaySummary.workDate = '2026-08-22';
    replacement.punchDaySummary.startsAt = '2026-08-21T00:00:00Z';
    replacement.punchDaySummary.endsAt = '2026-08-22T23:30:00Z';
    graphState.tenantId = 'tenant-2';
    graphState.client = { request: vi.fn().mockResolvedValue(replacement) };
    view.rerender(<PunchInOut />);
    await screen.findByText('Attendance work date: 2026-08-22');

    const late = summary(0);
    late.punchDaySummary.workDate = '2026-08-20';
    await act(async () => {
      stale.resolve(late);
      await Promise.resolve();
    });

    expect(screen.queryByText('Attendance work date: 2026-08-20')).toBeNull();
    expect(screen.getByText('Attendance work date: 2026-08-22')).toBeTruthy();
  });

  it('clears an owned busy mutation when only the GraphQL client is replaced', async () => {
    const staleMutation = deferred<{ punchToday: ReturnType<typeof segment> }>();
    const oldClient = graphState.client;
    oldClient.request.mockImplementation((document) => {
      if (document === AttendancePunchDaySummaryDocument) return Promise.resolve(summary());
      if (document === AttendancePunchTodayDocument) return staleMutation.promise;
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    const view = renderCard();
    await screen.findByText('Session 1');
    await user.click(screen.getByRole('checkbox', { name: /Record GPS location/i }));
    await user.click(screen.getByRole('button', { name: 'Punch In' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Recording/i }).disabled).toBe(
      true
    );

    const replacementPunch = { ...segment(4), source: 'replacement-client' };
    const replacementClient = {
      request: vi.fn((document) => {
        if (document === AttendancePunchDaySummaryDocument) return Promise.resolve(summary(0));
        if (document === AttendancePunchTodayDocument) {
          return Promise.resolve({ punchToday: replacementPunch });
        }
        throw new Error('Unexpected document');
      }),
    };
    graphState.client = replacementClient;
    view.rerender(<PunchInOut />);

    const replacementButton = await screen.findByRole<HTMLButtonElement>('button', {
      name: 'Punch In',
    });
    expect(replacementButton.disabled).toBe(false);
    await user.click(replacementButton);
    expect(await screen.findByText('Source: replacement-client')).toBeTruthy();

    await act(async () => {
      staleMutation.resolve({ punchToday: { ...segment(5), source: 'stale-client' } });
      await staleMutation.promise;
    });

    expect(screen.queryByText('Source: stale-client')).toBeNull();
    expect(screen.getByText('Source: replacement-client')).toBeTruthy();
  });
});

describe('PunchInOut truthful refresh states', () => {
  it('shows an expired incomplete segment as correction-required without a fake checkout', async () => {
    graphState.client.request.mockResolvedValueOnce({
      punchDaySummary: {
        ...summary(0).punchDaySummary,
        segments: [{ ...segment(1), checkOutAt: null, checkOutTime: null, status: 'INCOMPLETE' }],
      },
    });
    renderCard();

    expect(await screen.findByText(/Missed punch out.*correction required/i)).toBeTruthy();
    expect(screen.queryByText(/Select.*Punch Out.*close this block/i)).toBeNull();
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
    expect(await screen.findByText('Session 1')).toBeTruthy();
  });

  it('retains the attendance summary after its refresh fails', async () => {
    const retry = deferred<ReturnType<typeof summary>>();
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Session 1');
    graphState.client.request.mockRejectedValue(new Error('Failed to fetch'));

    await user.click(screen.getByRole('button', { name: 'Refresh Attendance Summary' }));

    expect(await screen.findByText('Attendance Summary May Be Out of Date')).toBeTruthy();
    expect(screen.getByText('Session 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);

    graphState.client.request.mockImplementationOnce(() => retry.promise);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(true);
    act(() => retry.resolve(summary()));
    await screen.findByText('Session 1');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Punch In' }).disabled).toBe(
      false
    );
  });

  it('keeps punching disabled when mutation success is followed by a failed summary refresh', async () => {
    const retry = deferred<ReturnType<typeof openSummary>>();
    let summaryRequestCount = 0;
    graphState.client.request = vi.fn((document) => {
      if (document === AttendancePunchDaySummaryDocument) {
        summaryRequestCount += 1;
        if (summaryRequestCount === 1) return Promise.resolve(summary());
        if (summaryRequestCount === 2) return Promise.reject(new Error('Failed to fetch'));
        return retry.promise;
      }
      if (document === AttendancePunchTodayDocument)
        return Promise.resolve({ punchToday: segment(2) });
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Session 1');
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
      if (document === AttendancePunchDaySummaryDocument) return Promise.resolve(summary());
      if (document === AttendancePunchTodayDocument)
        return Promise.reject(new Error('Failed to fetch'));
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Session 1');
    await user.click(screen.getByRole('checkbox', { name: /Record GPS location/i }));

    await user.click(screen.getByRole('button', { name: 'Punch In' }));

    expect(await screen.findByText('Punch Could Not Be Recorded')).toBeTruthy();
    expect(screen.getByText('Session 1')).toBeTruthy();
    expect(screen.queryByText('Attendance Summary May Be Out of Date')).toBeNull();
  });
});

describe('PunchInOut submission and display safeguards', () => {
  it('prevents duplicate punch submissions while a mutation is busy', async () => {
    const mutation = deferred<{ punchToday: ReturnType<typeof segment> }>();
    graphState.client.request = vi.fn((document) => {
      if (document === AttendancePunchDaySummaryDocument) return Promise.resolve(summary());
      if (document === AttendancePunchTodayDocument) return mutation.promise;
      throw new Error('Unexpected document');
    });
    const user = userEvent.setup();
    renderCard();
    await screen.findByText('Session 1');
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

    await screen.findByText('Session 20');
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
