// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';

import { AttendanceCurrentDayWindowDocument } from '../../api/attendance/graphql';
import { AttendanceAdjustmentPolicyDocument } from '../../api/graphql/graphql';

import {
  graphClient,
  authState,
  policyResponse,
  deferred,
  boardResponse,
  currentWindowResponse,
  renderPage,
  advanceToNextPage,
} from './attendancePageTestSupport';

it('does not show refresh success after refresh A is superseded by B and return to A', async () => {
  const pendingRefresh = deferred<ReturnType<typeof boardResponse>>();
  let boardCalls = 0;
  graphClient.request.mockImplementation((document: unknown, variables?: { fromDate?: string }) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    if (document === AttendanceCurrentDayWindowDocument)
      return Promise.resolve(currentWindowResponse);
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
            status:
              new Map([
                [1, 'Initial A'],
                [3, 'Page B'],
              ]).get(boardCalls) ?? 'Return A',
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
    if (document === AttendanceCurrentDayWindowDocument)
      return Promise.resolve(currentWindowResponse);
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
  await waitFor(() => expect(graphClient.request).toHaveBeenCalledTimes(4));

  await act(async () => {
    await Promise.resolve();
    policy.resolve(policyResponse);
  });

  await waitFor(() =>
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Add Missed Punches' }).disabled
    ).toBe(false)
  );
});
