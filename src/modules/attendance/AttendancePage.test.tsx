// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AttendanceAdjustmentPolicyDocument,
  MyAttendanceBoardDocument,
} from '../../api/graphql/graphql';
import type { ParsedClientSession } from '../../auth/clientSession';

import AttendancePage from './AttendancePage';

const graphClientState = vi.hoisted(() => {
  const defaultClient = { request: vi.fn() };
  return { current: defaultClient, defaultClient };
});
const graphClient = graphClientState.defaultClient;
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

vi.mock('../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphClientState.current,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

const policyResponse = { attendanceAdjustmentPolicy: { maxSelfAdjustDays: 14 } };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function boardResponse({
  endCursor = null,
  hasNextPage = false,
  rows,
}: {
  endCursor?: string | null;
  hasNextPage?: boolean;
  rows?: Array<Record<string, unknown>>;
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
    // Retained so the RED test proves the old generic caller renders the malformed row.
    attendance: pageRows,
    myAttendance: {
      edges: pageRows.map((row, index) => ({ cursor: `opaque-${index}`, node: row })),
      pageInfo: { endCursor, hasNextPage },
    },
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AttendancePage />
    </MemoryRouter>
  );
}

async function advanceToNextPage() {
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
  graphClient.request.mockReset();
  graphClient.request.mockImplementation((document: unknown) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    return Promise.resolve(boardResponse({ endCursor: 'opaque-next', hasNextPage: true }));
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('AttendancePage', () => {
  it('requests the generated self-attendance document without an employee target', async () => {
    renderPage();

    await waitFor(() => {
      expect(graphClient.request).toHaveBeenCalledWith(
        MyAttendanceBoardDocument,
        expect.not.objectContaining({ employeeId: expect.anything() })
      );
    });
  });

  it('suppresses malformed attendance rows that belong to another employee', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Present')).toBeTruthy());

    expect(screen.queryByText('Other Employee')).toBeNull();
  });

  it('resets the cursor to the first page when the selected month changes', async () => {
    renderPage();

    await screen.findByRole('button', { name: 'Next page' });
    await advanceToNextPage();
    await waitFor(() =>
      expect(graphClient.request).toHaveBeenCalledWith(
        MyAttendanceBoardDocument,
        expect.objectContaining({ after: 'opaque-next' })
      )
    );

    const month = screen.getByLabelText<HTMLSelectElement>('Month');
    const differentMonth = (Number(month.value) + 1) % 12;
    fireEvent.change(month, { target: { value: String(differentMonth) } });

    await waitFor(() => {
      const requests = graphClient.request.mock.calls.filter(
        ([document]) => document === MyAttendanceBoardDocument
      );
      expect(requests[requests.length - 1]?.[1]).toEqual(
        expect.objectContaining({ after: undefined, first: 50 })
      );
    });
  });

  it('resets the cursor to the first page when the selected year changes', async () => {
    renderPage();

    await screen.findByRole('button', { name: 'Next page' });
    await advanceToNextPage();
    await waitFor(() =>
      expect(graphClient.request).toHaveBeenCalledWith(
        MyAttendanceBoardDocument,
        expect.objectContaining({ after: 'opaque-next' })
      )
    );

    const year = screen.getByLabelText<HTMLSelectElement>('Year');
    const differentYear = Array.from(year.options).find((option) => option.value !== year.value);
    fireEvent.change(year, { target: { value: differentYear?.value } });

    await waitFor(() => {
      const requests = graphClient.request.mock.calls.filter(
        ([document]) => document === MyAttendanceBoardDocument
      );
      expect(requests[requests.length - 1]?.[1]).toEqual(
        expect.objectContaining({ after: undefined, first: 50 })
      );
    });
  });

  it('refreshes the active cursor page instead of returning to the first page', async () => {
    renderPage();

    await screen.findByRole('button', { name: 'Next page' });
    await advanceToNextPage();
    await waitFor(() =>
      expect(graphClient.request).toHaveBeenCalledWith(
        MyAttendanceBoardDocument,
        expect.objectContaining({ after: 'opaque-next' })
      )
    );

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => {
      const requests = graphClient.request.mock.calls.filter(
        ([document]) => document === MyAttendanceBoardDocument
      );
      expect(requests[requests.length - 1]?.[1]).toEqual(
        expect.objectContaining({ after: 'opaque-next' })
      );
    });
  });

  it('shows page-scoped totals that change with the loaded cursor page', async () => {
    const firstPage = boardResponse({
      endCursor: 'page-two',
      hasNextPage: true,
      rows: [
        {
          id: 'page-one',
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
        },
      ],
    });
    const secondPage = boardResponse({
      rows: [
        {
          id: 'page-two',
          employeeId: 'employee-self',
          workDate: '2026-08-23',
          checkInTime: '10:00:00',
          checkOutTime: '14:00:00',
          checkInLat: null,
          checkInLng: null,
          checkOutLat: null,
          checkOutLng: null,
          status: 'Present',
          source: 'SELF_REPORTED',
          lateMinutes: null,
        },
      ],
    });
    graphClient.request.mockImplementation((document: unknown, variables?: { after?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      return Promise.resolve(variables?.after === 'page-two' ? secondPage : firstPage);
    });

    renderPage();

    const totalTimeCard = screen.getByRole('heading', { name: 'Total Time on This Page' })
      .parentElement;
    if (!totalTimeCard) throw new Error('Total Time card container is missing.');
    await waitFor(() => expect(within(totalTimeCard).getByText('8h 00m')).toBeTruthy());
    expect(screen.getByText('Worked Days on This Page')).toBeTruthy();
    expect(screen.getByText('Total Time on This Page')).toBeTruthy();
    expect(screen.getByText(/Current page data only\./)).toBeTruthy();
    expect(screen.queryByText('Worked Days This Month')).toBeNull();

    await advanceToNextPage();

    await waitFor(() => expect(within(totalTimeCard).getByText('4h 00m')).toBeTruthy());
    expect(within(totalTimeCard).queryByText('8h 00m')).toBeNull();
    expect(screen.getByText('Worked Days on This Page')).toBeTruthy();
  });

  it('uses the local cursor stack when returning to a prior page', async () => {
    graphClient.request.mockImplementation((document: unknown, variables?: { after?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      if (variables?.after === 'cursor-one') {
        return Promise.resolve(boardResponse({ endCursor: 'cursor-two', hasNextPage: true }));
      }
      if (variables?.after === 'cursor-two') return Promise.resolve(boardResponse());
      return Promise.resolve(boardResponse({ endCursor: 'cursor-one', hasNextPage: true }));
    });
    renderPage();

    await screen.findByRole('button', { name: 'Next page' });
    await advanceToNextPage();
    await waitFor(() => expect(screen.getByText(/Page 2/)).toBeTruthy());
    await advanceToNextPage();
    await waitFor(() => expect(screen.getByText(/Page 3/)).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await waitFor(() => {
      const requests = graphClient.request.mock.calls.filter(
        ([document]) => document === MyAttendanceBoardDocument
      );
      expect(requests[requests.length - 1]?.[1]).toEqual(
        expect.objectContaining({ after: 'cursor-one' })
      );
    });
  });

  it('does not let a deferred refresh overwrite a newer month request', async () => {
    const refresh = deferred<ReturnType<typeof boardResponse>>();
    let boardCalls = 0;
    graphClient.request.mockImplementation((document: unknown, variables?: { fromDate?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      boardCalls += 1;
      if (boardCalls === 2) return refresh.promise;
      return Promise.resolve(
        boardResponse({
          rows: [
            {
              id: `page-${boardCalls}`,
              employeeId: 'employee-self',
              workDate: variables?.fromDate ?? '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: boardCalls === 1 ? 'Initial page' : 'Newer month',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });
    renderPage();

    await screen.findByText('Initial page');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    const month = screen.getByLabelText<HTMLSelectElement>('Month');
    fireEvent.change(month, { target: { value: String((Number(month.value) + 1) % 12) } });

    await screen.findByText('Newer month');

    await act(async () => {
      refresh.resolve(
        boardResponse({
          rows: [
            {
              id: 'stale-refresh',
              employeeId: 'employee-self',
              workDate: '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: 'Stale refresh',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });

    await waitFor(() => expect(screen.queryByText('Stale refresh')).toBeNull());
    expect(screen.getByText('Newer month')).toBeTruthy();
  });

  it('hides stale paging controls and rows during a deferred month transition', async () => {
    const nextMonth = deferred<ReturnType<typeof boardResponse>>();
    let boardCalls = 0;
    graphClient.request.mockImplementation((document: unknown, variables?: { fromDate?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      boardCalls += 1;
      if (boardCalls === 2) return nextMonth.promise;
      return Promise.resolve(
        boardResponse({
          endCursor: 'next-page',
          hasNextPage: true,
          rows: [
            {
              id: `page-${boardCalls}`,
              employeeId: 'employee-self',
              workDate: variables?.fromDate ?? '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: boardCalls === 1 ? 'Old page' : 'New month page',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });
    renderPage();

    await screen.findByText('Old page');
    const month = screen.getByLabelText<HTMLSelectElement>('Month');
    fireEvent.change(month, { target: { value: String((Number(month.value) + 1) % 12) } });

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(true);
    expect(screen.queryByText('Old page')).toBeNull();

    await act(async () => {
      nextMonth.resolve(
        boardResponse({
          endCursor: 'next-page',
          hasNextPage: true,
          rows: [
            {
              id: 'new-month-page',
              employeeId: 'employee-self',
              workDate: '2026-09-01',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: 'New month page',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });

    await screen.findByText('New month page');
    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(
        false
      )
    );
  });

  it('hides stale board rows and paging during a deferred client/session transition', async () => {
    const replacement = deferred<ReturnType<typeof boardResponse>>();
    const replacementClient = { request: vi.fn() };
    graphClient.request.mockImplementation((document: unknown) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      return Promise.resolve(
        boardResponse({
          endCursor: 'client-a-next',
          hasNextPage: true,
          rows: [
            {
              id: 'client-a-row',
              employeeId: 'employee-self',
              workDate: '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: 'Client A',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });
    replacementClient.request.mockImplementation((document: unknown) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      return replacement.promise;
    });

    const view = renderPage();

    await screen.findByText('Client A');
    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(false)
    );

    authState.clientSession.employeeId = 'employee-replacement';
    graphClientState.current = replacementClient;
    view.rerender(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    );

    expect(screen.queryByText('Client A')).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(true);

    await act(async () => {
      replacement.resolve(
        boardResponse({
          endCursor: 'client-b-next',
          hasNextPage: true,
          rows: [
            {
              id: 'client-b-row',
              employeeId: 'employee-replacement',
              workDate: '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: 'Client B',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });

    await screen.findByText('Client B');
    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(false)
    );
  });

  it('resets a page-two cursor before requesting a deferred client/session transition', async () => {
    const replacement = deferred<ReturnType<typeof boardResponse>>();
    const replacementClient = { request: vi.fn() };
    graphClient.request.mockImplementation((document: unknown, variables?: { after?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      if (variables?.after === 'client-a-page-two') {
        return Promise.resolve(
          boardResponse({
            endCursor: 'client-a-page-three',
            hasNextPage: true,
            rows: [
              {
                id: 'client-a-page-two-row',
                employeeId: 'employee-self',
                workDate: '2026-08-23',
                checkInTime: '09:00:00',
                checkOutTime: '17:00:00',
                checkInLat: null,
                checkInLng: null,
                checkOutLat: null,
                checkOutLng: null,
                status: 'Client A page 2',
                source: 'SELF_REPORTED',
                lateMinutes: null,
              },
            ],
          })
        );
      }
      return Promise.resolve(
        boardResponse({
          endCursor: 'client-a-page-two',
          hasNextPage: true,
          rows: [
            {
              id: 'client-a-page-one-row',
              employeeId: 'employee-self',
              workDate: '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: 'Client A page 1',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });
    replacementClient.request.mockImplementation((document: unknown) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      return replacement.promise;
    });

    const view = renderPage();

    await screen.findByText('Client A page 1');
    await advanceToNextPage();
    await screen.findByText('Client A page 2');
    expect(screen.getByText(/Page 2/)).toBeTruthy();

    authState.clientSession.employeeId = 'employee-replacement';
    graphClientState.current = replacementClient;
    view.rerender(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    );

    expect(screen.queryByText('Client A page 2')).toBeNull();
    expect(screen.getByText(/Page 1/)).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous page' }).disabled).toBe(
      true
    );
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(true);

    await waitFor(() =>
      expect(replacementClient.request).toHaveBeenCalledWith(
        MyAttendanceBoardDocument,
        expect.objectContaining({ after: undefined })
      )
    );

    await act(async () => {
      replacement.resolve(
        boardResponse({
          endCursor: 'client-b-page-two',
          hasNextPage: true,
          rows: [
            {
              id: 'client-b-page-one-row',
              employeeId: 'employee-replacement',
              workDate: '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: 'Client B page 1',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });

    await screen.findByText('Client B page 1');
    await waitFor(() =>
      expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(false)
    );
  });

  it('does not show refresh success after refresh A is superseded by B and return to A', async () => {
    const pendingRefresh = deferred<ReturnType<typeof boardResponse>>();
    let boardCalls = 0;
    graphClient.request.mockImplementation((document: unknown, variables?: { fromDate?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      boardCalls += 1;
      if (boardCalls === 2) return pendingRefresh.promise;
      return Promise.resolve(
        boardResponse({
          rows: [
            {
              id: `page-${boardCalls}`,
              employeeId: 'employee-self',
              workDate: variables?.fromDate ?? '2026-08-24',
              checkInTime: '09:00:00',
              checkOutTime: '17:00:00',
              checkInLat: null,
              checkInLng: null,
              checkOutLat: null,
              checkOutLng: null,
              status: boardCalls === 1 ? 'Initial A' : boardCalls === 3 ? 'Page B' : 'Return A',
              source: 'SELF_REPORTED',
              lateMinutes: null,
            },
          ],
        })
      );
    });
    renderPage();

    await screen.findByText('Initial A');
    const month = screen.getByLabelText<HTMLSelectElement>('Month');
    const monthA = month.value;
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    fireEvent.change(month, { target: { value: String((Number(monthA) + 1) % 12) } });
    await screen.findByText('Page B');
    fireEvent.change(month, { target: { value: monthA } });
    await screen.findByText('Return A');

    expect(screen.queryByText('Attendance refreshed.')).toBeNull();
  });

  it('keeps adjustment controls unavailable until the policy is resolved without refetching it on paging', async () => {
    const policy = deferred<typeof policyResponse>();
    authState.clientSession.permissions = new Set(['attendance:punch_self']);
    graphClient.request.mockImplementation((document: unknown, variables?: { after?: string }) => {
      if (document === AttendanceAdjustmentPolicyDocument) return policy.promise;
      return Promise.resolve(
        boardResponse({
          endCursor: variables?.after ? null : 'page-two',
          hasNextPage: !variables?.after,
        })
      );
    });
    renderPage();

    const addButton = await screen.findByRole('button', { name: 'Loading adjustment policy…' });
    expect((addButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Adjust day' })).toBeNull();
    await advanceToNextPage();
    await waitFor(() => expect(graphClient.request).toHaveBeenCalledTimes(3));

    await act(async () => {
      policy.resolve(policyResponse);
    });

    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Add Missed Punches' }).disabled
      ).toBe(false)
    );
  });
});
