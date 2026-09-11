// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, vi } from 'vitest';

import { AttendanceCurrentDayWindowDocument } from '../../api/attendance/graphql';
import { AttendanceAdjustmentPolicyDocument } from '../../api/graphql/graphql';
import type { ParsedClientSession } from '../../auth/clientSession';

import AttendancePage from './AttendancePage';

const graphClientState = vi.hoisted(() => {
  const defaultClient = { request: vi.fn() };
  return { current: defaultClient, defaultClient };
});
export const graphClient = graphClientState.defaultClient;
const authState = vi.hoisted(() => ({
  clientSession: {
    jwtRoles: [],
    permissions: new Set<string>(),
    permissionScopes: { 'attendance:punch_self': 'SELF' },
    resourceScopes: {},
    employeeId: 'employee-self',
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  } as ParsedClientSession,
}));
const tenantState = vi.hoisted(() => ({ timezone: 'Asia/Kolkata' }));

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphClientState.current,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { timezone: tenantState.timezone } }),
}));

export const policyResponse = { attendanceAdjustmentPolicy: { maxSelfAdjustDays: 14 } };
export const currentWindowResponse = {
  attendanceDayWindow: {
    workDate: '2026-08-25',
    startsAt: '2026-08-24T23:30:00Z',
    endsAt: '2026-08-25T23:30:00Z',
    timezone: 'Asia/Kolkata',
    boundaryMinutes: 300,
  },
};

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

export function boardResponse({
  endCursor = null,
  hasNextPage = false,
  rows,
  summary = { completedMinutes: 720, workedDays: 2, averageMinutes: 360, incompleteSegments: 0 },
}: {
  endCursor?: string | null;
  hasNextPage?: boolean;
  rows?: Array<Record<string, unknown>>;
  summary?: {
    completedMinutes: number;
    workedDays: number;
    averageMinutes: number | null;
    incompleteSegments: number;
  };
} = {}) {
  const selfRow = {
    id: 'self-row',
    employeeId: 'employee-self',
    workDate: '2026-08-24',
    checkInTime: '09:00:00',
    checkOutTime: '17:00:00',
    checkInLat: null,
    checkInLng: null,
    checkOutLat: null,
    checkOutLng: null,
    status: 'Present',
    source: 'SELF_REPORTED',
    lateMinutes: null,
  };
  const otherRow = {
    ...selfRow,
    id: 'other-row',
    employeeId: 'employee-other',
    workDate: '2026-08-23',
    status: 'Other Employee',
  };

  const pageRows = rows ?? [selfRow, otherRow];

  return {
    shifts: [],
    myAttendanceSummary: summary,
    // Retained so the RED test proves the old generic caller renders the malformed row.
    attendance: pageRows,
    myAttendance: {
      edges: pageRows.map((row, index) => ({ cursor: `opaque-${index}`, node: row })),
      pageInfo: { endCursor, hasNextPage },
    },
  };
}

export function renderPage() {
  return render(
    <MemoryRouter>
      <AttendancePage />
    </MemoryRouter>
  );
}

export function rerenderPage(view: ReturnType<typeof renderPage>) {
  view.rerender(
    <MemoryRouter>
      <AttendancePage />
    </MemoryRouter>
  );
}

export async function advanceToNextPage() {
  const nextPage = screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' });
  await waitFor(() => expect(nextPage.disabled).toBe(false));
  fireEvent.click(nextPage);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
  graphClientState.current = graphClient;
  authState.clientSession.employeeId = 'employee-self';
  authState.clientSession.permissions = new Set();
  tenantState.timezone = 'Asia/Kolkata';
  graphClient.request.mockReset();
  graphClient.request.mockImplementation((document: unknown) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    if (document === AttendanceCurrentDayWindowDocument) {
      return Promise.resolve(currentWindowResponse);
    }
    return Promise.resolve(boardResponse({ endCursor: 'opaque-next', hasNextPage: true }));
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

export const requestCalls = () =>
  graphClient.request.mock.calls as Array<[unknown, Record<string, unknown>?]>;

export { graphClientState, authState, tenantState };
