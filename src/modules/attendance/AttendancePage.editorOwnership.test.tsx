// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { AttendanceCurrentDayWindowDocument } from '../../api/attendance/graphql';
import { AttendanceAdjustmentPolicyDocument } from '../../api/graphql/graphql';

import {
  authState,
  boardResponse,
  currentWindowResponse,
  graphClient,
  graphClientState,
  policyResponse,
  renderPage,
  rerenderPage,
  tenantState,
} from './attendancePageTestSupport';

it('discards an open attendance edit when the client or employee changes, including returning to the previous identity', async () => {
  authState.clientSession.permissions = new Set(['attendance:punch_self']);
  const view = renderPage();
  fireEvent.click(await screen.findByRole('button', { name: 'Adjust day' }));
  expect(screen.getByRole('dialog', { name: 'Update Attendance Segment' })).toBeTruthy();
  expect(screen.getByLabelText<HTMLInputElement>('Work Date').value).toBe('2026-08-24');

  authState.clientSession.employeeId = 'employee-replacement';
  graphClientState.current = {
    request: vi.fn((document: unknown) => {
      if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
      if (document === AttendanceCurrentDayWindowDocument) {
        return Promise.resolve(currentWindowResponse);
      }
      return Promise.resolve(boardResponse());
    }),
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

it('uses the server current work date for the initial month and missed-punch default', async () => {
  vi.setSystemTime(new Date('2026-08-31T20:00:00Z'));
  authState.clientSession.permissions = new Set(['attendance:punch_self']);
  graphClient.request.mockImplementation((document: unknown) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    if (document === AttendanceCurrentDayWindowDocument) {
      return Promise.resolve({
        attendanceDayWindow: {
          ...currentWindowResponse.attendanceDayWindow,
          workDate: '2026-08-31',
          startsAt: '2026-08-30T23:30:00Z',
          endsAt: '2026-08-31T23:30:00Z',
        },
      });
    }
    return Promise.resolve(boardResponse());
  });

  renderPage();

  await waitFor(() => expect(screen.getByLabelText<HTMLSelectElement>('Month').value).toBe('7'));
  fireEvent.click(screen.getByRole('button', { name: 'Add Missed Punches' }));
  expect(screen.getByLabelText<HTMLInputElement>('Work Date').value).toBe('2026-08-31');
});

it('preserves a selected historical month while the current attendance window refreshes', async () => {
  authState.clientSession.permissions = new Set(['attendance:punch_self']);
  let currentWindowRequests = 0;
  graphClient.request.mockImplementation((document: unknown) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    if (document === AttendanceCurrentDayWindowDocument) {
      currentWindowRequests += 1;
      return Promise.resolve({
        attendanceDayWindow: {
          ...currentWindowResponse.attendanceDayWindow,
          workDate: currentWindowRequests === 1 ? '2026-08-25' : '2026-08-26',
          endsAt: '2026-08-26T23:30:00Z',
        },
      });
    }
    return Promise.resolve(boardResponse());
  });
  renderPage();
  const month = await screen.findByLabelText<HTMLSelectElement>('Month');
  fireEvent.change(month, { target: { value: '6' } });
  await waitFor(() => expect(month.value).toBe('6'));

  await act(async () => {
    window.dispatchEvent(new Event('focus'));
    await Promise.resolve();
  });

  await waitFor(() => expect(currentWindowRequests).toBe(2));
  expect(month.value).toBe('6');
});

it('expires self-adjustment at tenant midnight while retaining the attendance work-date default', async () => {
  vi.setSystemTime(new Date('2026-09-11T18:29:59.900Z'));
  tenantState.timezone = 'Asia/Kolkata';
  authState.clientSession.permissions = new Set(['attendance:punch_self']);
  const historicalRow = {
    ...boardResponse().myAttendance.edges[0].node,
    id: 'deadline-row',
    workDate: '2026-08-28',
  };
  graphClient.request.mockImplementation((document: unknown) => {
    if (document === AttendanceAdjustmentPolicyDocument) return Promise.resolve(policyResponse);
    if (document === AttendanceCurrentDayWindowDocument) {
      return Promise.resolve({
        attendanceDayWindow: {
          ...currentWindowResponse.attendanceDayWindow,
          workDate: '2026-09-11',
          startsAt: '2026-09-10T23:30:00Z',
          endsAt: '2026-09-11T23:30:00Z',
        },
      });
    }
    return Promise.resolve(boardResponse({ rows: [historicalRow] }));
  });
  renderPage();

  fireEvent.change(await screen.findByLabelText<HTMLSelectElement>('Month'), {
    target: { value: '7' },
  });
  const adjust = await screen.findByRole<HTMLButtonElement>('button', { name: 'Adjust day' });
  expect(adjust.disabled).toBe(false);
  await act(async () => {
    vi.advanceTimersByTime(100);
    await Promise.resolve();
  });
  expect(adjust.disabled).toBe(true);

  fireEvent.click(screen.getByRole('button', { name: 'Add Missed Punches' }));
  expect(screen.getByLabelText<HTMLInputElement>('Work Date').value).toBe('2026-09-11');
});
