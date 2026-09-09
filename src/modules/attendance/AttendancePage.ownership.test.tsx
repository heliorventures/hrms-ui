// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { MyAttendanceBoardDocument } from '../../api/attendance/graphql';
import { AttendanceAdjustmentPolicyDocument } from '../../api/graphql/graphql';

import {
  graphClientState,
  graphClient,
  authState,
  policyResponse,
  deferred,
  boardResponse,
  renderPage,
  rerenderPage,
  advanceToNextPage,
} from './attendancePageTestSupport';

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
    await Promise.resolve();
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
    await Promise.resolve();
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
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(
      false
    )
  );

  authState.clientSession.employeeId = 'employee-replacement';
  graphClientState.current = replacementClient;
  rerenderPage(view);

  expect(screen.queryByText('Client A')).toBeNull();
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(true);

  await act(async () => {
    await Promise.resolve();
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
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(
      false
    )
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
  rerenderPage(view);

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
    await Promise.resolve();
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
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(
      false
    )
  );
});
