// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AttendancePolicySettingsDocument,
  PreviewAttendanceDayPolicyDocument,
  ScheduleAttendanceDayPolicyDocument,
} from '../../api/attendance/graphql';
import type { ParsedClientSession } from '../../auth/clientSession';

import AdminAttendancePolicyPage from './AdminAttendancePolicyPage';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  tenantId: 'tenant-1',
  userId: 'admin-user-1',
  session: {
    employeeId: 'admin-1',
    jwtRoles: [],
    mustChangePassword: false,
    persona: 'ADMIN',
    permissions: new Set(['attendance:punch_policy']),
    permissionScopes: { 'attendance:punch_policy': 'ALL' },
    resourceScopes: {},
  } as ParsedClientSession,
}));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: state.session,
    tenantId: state.tenantId,
    user: { id: state.userId },
  }),
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

const policy = (revision = 7, ipAllowlist: string | null = null) => ({
  attendanceDayPolicy: {
    revision,
    initialized: true,
    legacyActivationPending: false,
    legacyActivationDate: '2026-09-12',
    currentPolicy: {
      effectiveWorkDate: '2026-09-12',
      boundaryMinutes: 300,
      timezone: 'Asia/Kolkata',
    },
    pendingPolicy: {
      effectiveWorkDate: '2026-09-20',
      boundaryMinutes: 360,
      timezone: 'Asia/Kolkata',
    },
    currentWindow: {
      workDate: '2026-09-11',
      startsAt: '2026-09-10T23:30:00Z',
      endsAt: '2026-09-11T23:30:00Z',
      timezone: 'Asia/Kolkata',
      boundaryMinutes: 300,
    },
  },
  attendancePunchPolicy: {
    id: 'policy-1',
    isEnforced: false,
    siteLatitude: null,
    siteLongitude: null,
    maxDistanceMeters: null,
    ipAllowlist,
    updatedAt: null,
  },
  shifts: [],
});

const preview = {
  previewAttendanceDayPolicy: {
    revision: 8,
    transition: {
      workDate: '2026-09-20',
      startsAt: '2026-09-19T23:30:00Z',
      endsAt: '2026-09-21T00:30:00Z',
      timezone: 'Asia/Kolkata',
      boundaryMinutes: 360,
    },
    following: {
      workDate: '2026-09-21',
      startsAt: '2026-09-21T00:30:00Z',
      endsAt: '2026-09-22T00:30:00Z',
      timezone: 'Asia/Kolkata',
      boundaryMinutes: 360,
    },
  },
};

beforeEach(() => {
  state.tenantId = 'tenant-1';
  state.userId = 'admin-user-1';
  state.session.permissions = new Set(['attendance:punch_policy']);
  state.session.permissionScopes = { 'attendance:punch_policy': 'ALL' };
  state.client = { request: vi.fn() };
  state.client.request.mockImplementation((document: unknown) => {
    if (document === AttendancePolicySettingsDocument) return Promise.resolve(policy());
    if (document === PreviewAttendanceDayPolicyDocument) return Promise.resolve(preview);
    if (document === ScheduleAttendanceDayPolicyDocument)
      return Promise.resolve({ scheduleAttendanceDayPolicy: policy(8).attendanceDayPolicy });
    throw new Error('Unexpected operation');
  });
});

afterEach(cleanup);

describe('attendance day policy settings', () => {
  it('does not issue policy operations without exact ALL authority', async () => {
    state.session.permissionScopes = { 'attendance:punch_policy': 'TEAM' };
    render(<AdminAttendancePolicyPage />);
    expect(screen.getByRole('status').textContent).toContain('do not have access');
    await Promise.resolve();
    expect(state.client.request).not.toHaveBeenCalled();
  });

  it('shows current and pending policy and schedules only after exact interval confirmation', async () => {
    render(<AdminAttendancePolicyPage />);
    expect(await screen.findByText('Current start: 05:00')).toBeTruthy();
    expect(screen.getByText('Scheduled start: 06:00 from 2026-09-20')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Attendance day starts at'), {
      target: { value: '06:00' },
    });
    fireEvent.change(screen.getByLabelText('Effective work date'), {
      target: { value: '2026-09-20' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));

    expect(await screen.findByText(/20 Sept 2026, 05:00.*21 Sept 2026, 06:00/)).toBeTruthy();
    expect(screen.getAllByText(/Asia\/Kolkata/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Schedule change' }).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm this exact transition/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Schedule change' }));

    await waitFor(() =>
      expect(state.client.request).toHaveBeenCalledWith(ScheduleAttendanceDayPolicyDocument, {
        input: {
          boundaryTime: '06:00',
          effectiveWorkDate: '2026-09-20',
          expectedRevision: 7,
        },
      })
    );
  });

  it('reloads a revision conflict without discarding the administrator draft', async () => {
    state.client.request.mockImplementation((document: unknown) => {
      if (document === AttendancePolicySettingsDocument)
        return Promise.resolve(
          state.client.request.mock.calls.filter(([operation]) => operation === document).length > 1
            ? policy(8)
            : policy(7)
        );
      if (document === PreviewAttendanceDayPolicyDocument) return Promise.resolve(preview);
      if (document === ScheduleAttendanceDayPolicyDocument)
        return Promise.reject({ code: 'CONFLICT' });
      throw new Error('Unexpected operation');
    });
    render(<AdminAttendancePolicyPage />);
    await screen.findByText('Current start: 05:00');
    fireEvent.change(screen.getByLabelText('Attendance day starts at'), {
      target: { value: '06:30' },
    });
    fireEvent.change(screen.getByLabelText('Effective work date'), {
      target: { value: '2026-09-22' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
    await screen.findByText(/20 Sept 2026, 05:00/);
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm this exact transition/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Schedule change' }));

    expect(await screen.findByText(/changed while you were reviewing/i)).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Attendance day starts at').value).toBe('06:30');
    expect(screen.getByLabelText<HTMLInputElement>('Effective work date').value).toBe('2026-09-22');
    expect(state.client.request).toHaveBeenCalledWith(AttendancePolicySettingsDocument);
  });
});

describe('attendance day proposal ownership', () => {
  it('discards a delayed preview when the administrator edits the proposal', async () => {
    const firstPreview = deferred<typeof preview>();
    let previewCount = 0;
    state.client.request.mockImplementation((document: unknown) => {
      if (document === AttendancePolicySettingsDocument) return Promise.resolve(policy());
      if (document === PreviewAttendanceDayPolicyDocument) {
        previewCount += 1;
        return previewCount === 1 ? firstPreview.promise : Promise.resolve(preview);
      }
      if (document === ScheduleAttendanceDayPolicyDocument) {
        return Promise.resolve({ scheduleAttendanceDayPolicy: policy(8).attendanceDayPolicy });
      }
      throw new Error('Unexpected operation');
    });
    render(<AdminAttendancePolicyPage />);
    await screen.findByText('Current start: 05:00');

    fireEvent.change(screen.getByLabelText('Attendance day starts at'), {
      target: { value: '06:00' },
    });
    fireEvent.change(screen.getByLabelText('Effective work date'), {
      target: { value: '2026-09-20' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
    fireEvent.change(screen.getByLabelText('Attendance day starts at'), {
      target: { value: '07:00' },
    });

    await act(async () => {
      firstPreview.resolve(preview);
      await firstPreview.promise;
    });

    expect(screen.queryByRole('button', { name: 'Schedule change' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
    await screen.findByRole('button', { name: 'Schedule change' });
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm this exact transition/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Schedule change' }));
    await waitFor(() =>
      expect(state.client.request).toHaveBeenCalledWith(ScheduleAttendanceDayPolicyDocument, {
        input: {
          boundaryTime: '07:00',
          effectiveWorkDate: '2026-09-20',
          expectedRevision: 7,
        },
      })
    );
  });

  it('discards policy and preview responses owned by a replaced tenant, user, and client', async () => {
    const stalePreview = deferred<typeof preview>();
    const oldClient = state.client;
    oldClient.request.mockImplementation((document: unknown) => {
      if (document === AttendancePolicySettingsDocument) return Promise.resolve(policy(7));
      if (document === PreviewAttendanceDayPolicyDocument) return stalePreview.promise;
      throw new Error('Unexpected operation');
    });
    const view = render(<AdminAttendancePolicyPage />);
    await screen.findByText('Current start: 05:00');
    fireEvent.change(screen.getByLabelText('Attendance day starts at'), {
      target: { value: '06:00' },
    });
    fireEvent.change(screen.getByLabelText('Effective work date'), {
      target: { value: '2026-09-20' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));

    const replacementPolicy = policy(7, '10.0.0.1');
    replacementPolicy.attendanceDayPolicy.currentPolicy.boundaryMinutes = 420;
    replacementPolicy.attendancePunchPolicy.id = 'policy-tenant-2';
    state.tenantId = 'tenant-2';
    state.userId = 'admin-user-2';
    state.client = { request: vi.fn().mockResolvedValue(replacementPolicy) };
    view.rerender(<AdminAttendancePolicyPage />);

    expect(await screen.findByText('Current start: 07:00')).toBeTruthy();
    expect(document.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('10.0.0.1');
    await act(async () => {
      stalePreview.resolve(preview);
      await stalePreview.promise;
    });

    expect(screen.queryByRole('button', { name: 'Schedule change' })).toBeNull();
    expect(screen.getByText('Current start: 07:00')).toBeTruthy();
    expect(state.client.request).not.toHaveBeenCalledWith(
      ScheduleAttendanceDayPolicyDocument,
      expect.anything()
    );
  });
});

describe('attendance policy context ownership', () => {
  it('does not publish a delayed live-punch policy load after context replacement', async () => {
    const staleLoad = deferred<ReturnType<typeof policy>>();
    const oldClient = state.client;
    oldClient.request.mockReturnValue(staleLoad.promise);
    const view = render(<AdminAttendancePolicyPage />);
    await waitFor(() =>
      expect(oldClient.request).toHaveBeenCalledWith(AttendancePolicySettingsDocument)
    );

    const replacementPolicy = policy(7, '10.0.0.2');
    replacementPolicy.attendanceDayPolicy.currentPolicy.boundaryMinutes = 420;
    state.tenantId = 'tenant-2';
    state.userId = 'admin-user-2';
    state.client = { request: vi.fn().mockResolvedValue(replacementPolicy) };
    view.rerender(<AdminAttendancePolicyPage />);
    expect(await screen.findByText('Current start: 07:00')).toBeTruthy();

    const stalePolicy = policy(7, '192.0.2.1');
    await act(async () => {
      staleLoad.resolve(stalePolicy);
      await staleLoad.promise;
    });

    expect(screen.getByText('Current start: 07:00')).toBeTruthy();
    expect(document.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('10.0.0.2');
  });

  it('does not reload or publish a delayed schedule conflict after context replacement', async () => {
    const staleSchedule = deferred<never>();
    const oldClient = state.client;
    oldClient.request.mockImplementation((document: unknown) => {
      if (document === AttendancePolicySettingsDocument) return Promise.resolve(policy(7));
      if (document === PreviewAttendanceDayPolicyDocument) return Promise.resolve(preview);
      if (document === ScheduleAttendanceDayPolicyDocument) return staleSchedule.promise;
      throw new Error('Unexpected operation');
    });
    const view = render(<AdminAttendancePolicyPage />);
    await screen.findByText('Current start: 05:00');
    fireEvent.change(screen.getByLabelText('Attendance day starts at'), {
      target: { value: '06:00' },
    });
    fireEvent.change(screen.getByLabelText('Effective work date'), {
      target: { value: '2026-09-20' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview change' }));
    await screen.findByRole('button', { name: 'Schedule change' });
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm this exact transition/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Schedule change' }));

    const replacementPolicy = policy(7);
    replacementPolicy.attendanceDayPolicy.currentPolicy.boundaryMinutes = 420;
    state.tenantId = 'tenant-2';
    state.userId = 'admin-user-2';
    state.client = { request: vi.fn().mockResolvedValue(replacementPolicy) };
    view.rerender(<AdminAttendancePolicyPage />);
    await screen.findByText('Current start: 07:00');

    await act(async () => {
      staleSchedule.reject({ code: 'CONFLICT' });
      try {
        await staleSchedule.promise;
      } catch {
        // The rejected request is intentionally stale.
      }
    });

    expect(screen.queryByText(/changed while you were reviewing/i)).toBeNull();
    expect(screen.getByText('Current start: 07:00')).toBeTruthy();
    expect(
      oldClient.request.mock.calls.filter(
        ([document]) => document === AttendancePolicySettingsDocument
      )
    ).toHaveLength(1);
  });
});
