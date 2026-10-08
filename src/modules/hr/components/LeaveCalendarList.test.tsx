// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import type { HrLeaveCalendarQuery } from '../../../api/graphql/graphql';

import LeaveCalendarList from './LeaveCalendarList';

afterEach(cleanup);

const data: HrLeaveCalendarQuery = {
  orgChart: [{ employeeId: 'person-1', fullName: 'Priya Mehta', employeeCode: 'SCL/01' }],
  leaveTypes: [{ id: 'annual', name: 'Annual leave', code: 'AL' }],
  upcomingHolidays: [],
  leaveRequests: Array.from({ length: 12 }, (_, index) => ({
    id: String(index),
    employeeId: 'person-1',
    leaveTypeId: 'annual',
    fromDate: '2026-10-06',
    toDate: '2026-10-06',
    status: index === 11 ? 'PENDING' : 'APPROVED',
    isHalfDay: false,
    halfDaySession: null,
  })),
};

it('shows ten requests and makes the remaining requests accessible with pagination', () => {
  render(<LeaveCalendarList data={data} />);
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(11);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  expect(screen.getByText('11–12 of 12')).toBeTruthy();
});

it('resets pagination when filtering and searches employee and leave type names', () => {
  render(<LeaveCalendarList data={data} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Leave status' }), {
    target: { value: 'PENDING' },
  });
  expect(screen.getByText('1–1 of 1')).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search team leave' }), {
    target: { value: 'unmatched' },
  });
  expect(screen.getByText('No leave matches this period and filters.')).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search team leave' }), {
    target: { value: 'Annual' },
  });
  expect(screen.getByText('Priya Mehta')).toBeTruthy();
});
