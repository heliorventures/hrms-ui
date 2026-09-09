// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MyAttendanceBoardDocument } from '../../api/attendance/graphql';
import { AttendanceAdjustmentPolicyDocument } from '../../api/graphql/graphql';

import {
  graphClient,
  policyResponse,
  boardResponse,
  renderPage,
  advanceToNextPage,
  requestCalls,
} from './attendancePageTestSupport';

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
    const requests = requestCalls().filter(([document]) => document === MyAttendanceBoardDocument);
    expect(requests[requests.length - 1]?.[1]).toEqual(
      expect.objectContaining({ after: 'opaque-next' })
    );
  });
});

it('keeps complete monthly totals unchanged when navigating attendance pages', async () => {
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

  const summary = screen.getByLabelText('Monthly attendance summary');
  await waitFor(() => expect(within(summary).getByText('12h 00m')).toBeTruthy());
  expect(within(summary).getByText('6h 00m')).toBeTruthy();
  expect(screen.queryByText(/on This Page/)).toBeNull();

  await advanceToNextPage();

  await waitFor(() =>
    expect(graphClient.request).toHaveBeenCalledWith(
      MyAttendanceBoardDocument,
      expect.objectContaining({ after: 'page-two' })
    )
  );
  await waitFor(() => expect(within(summary).getByText('12h 00m')).toBeTruthy());
  expect(within(summary).getByText('6h 00m')).toBeTruthy();
});

it('shows no average for an open-only month while identifying incomplete punches', async () => {
  graphClient.request.mockImplementation((document: unknown) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    return Promise.resolve(
      boardResponse({
        summary: {
          completedMinutes: 0,
          workedDays: 0,
          averageMinutes: null,
          incompleteSegments: 3,
        },
      })
    );
  });
  renderPage();
  const summary = screen.getByLabelText('Monthly attendance summary');
  await waitFor(() => expect(within(summary).getByText('0h 00m')).toBeTruthy());
  expect(within(summary).getByText('—')).toBeTruthy();
  expect(within(summary).getByText('3')).toBeTruthy();
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
    const requests = requestCalls().filter(([document]) => document === MyAttendanceBoardDocument);
    expect(requests[requests.length - 1]?.[1]).toEqual(
      expect.objectContaining({ after: 'cursor-one' })
    );
  });
});
