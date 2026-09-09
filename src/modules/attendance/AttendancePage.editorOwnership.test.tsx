// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { AttendanceAdjustmentPolicyDocument } from '../../api/graphql/graphql';

import {
  authState,
  boardResponse,
  graphClient,
  graphClientState,
  policyResponse,
  renderPage,
  rerenderPage,
} from './attendancePageTestSupport';

it('discards an open attendance edit when the client or employee changes, including returning to the previous identity', async () => {
  authState.clientSession.permissions = new Set(['attendance:punch_self']);
  const view = renderPage();
  fireEvent.click(await screen.findByRole('button', { name: 'Adjust day' }));
  expect(screen.getByRole('dialog', { name: 'Update Attendance Segment' })).toBeTruthy();
  expect(screen.getByLabelText<HTMLInputElement>('Work Date').value).toBe('2026-08-24');

  authState.clientSession.employeeId = 'employee-replacement';
  graphClientState.current = {
    request: vi.fn((document: unknown) =>
      Promise.resolve(
        document === AttendanceAdjustmentPolicyDocument ? policyResponse : boardResponse()
      )
    ),
  };
  rerenderPage(view);
  await waitFor(() =>
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Add Missed Punches' }).disabled
    ).toBe(false)
  );
  expect(screen.queryByRole('dialog')).toBeNull();

  authState.clientSession.employeeId = 'employee-self';
  graphClientState.current = graphClient;
  rerenderPage(view);
  await waitFor(() =>
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Add Missed Punches' }).disabled
    ).toBe(false)
  );
  expect(screen.queryByRole('dialog')).toBeNull();
});
