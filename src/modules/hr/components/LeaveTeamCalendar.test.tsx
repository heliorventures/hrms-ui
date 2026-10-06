// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type { LeaveCalendarData } from './leaveCalendarModel';
import LeaveTeamCalendar from './LeaveTeamCalendar';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  clientSession: {
    permissions: new Set<string>(),
    permissionScopes: {} as Record<string, string>,
    resourceScopes: {},
    mustChangePassword: false,
  },
}));
vi.mock('../../../contexts/AuthContext', () => ({ useAuth: () => state }));
vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));

const today = new Date();
const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-06`;
const data: LeaveCalendarData = {
  leaveRequests: [
    {
      id: 'request-1',
      employeeId: 'person-1',
      leaveTypeId: 'annual',
      fromDate: date,
      toDate: date,
      status: 'APPROVED',
      isHalfDay: false,
      halfDaySession: null,
    },
  ],
  orgChart: [{ employeeId: 'person-1', fullName: 'Priya Mehta', employeeCode: 'SCL/01' }],
  leaveTypes: [{ id: 'annual', name: 'Annual leave', code: 'AL' }],
  upcomingHolidays: [
    {
      id: 'holiday-1',
      holidayDate: date,
      name: 'Company holiday',
      calendarName: 'Office calendar',
      holidayType: 'COMPANY',
    },
  ],
};

beforeEach(() => {
  state.clientSession.permissions = new Set(['leave:read', 'employee:read', 'attendance:read']);
  state.clientSession.permissionScopes = {
    'leave:read': 'ALL',
    'employee:read': 'ALL',
    'attendance:read': 'SELF',
  };
  state.client.request.mockReset().mockResolvedValue(data);
});
afterEach(cleanup);

it('loads leave and holiday metadata together and starts with the compact list', async () => {
  render(<LeaveTeamCalendar />);
  expect(await screen.findByText('Priya Mehta')).toBeTruthy();
  expect(screen.getByText('Company holiday')).toBeTruthy();
  expect(screen.getByText('Office calendar · COMPANY')).toBeTruthy();
  expect(screen.getByRole('combobox', { name: 'Calendar view' })).toHaveProperty('value', 'list');
});

it('omits fields protected by other permissions and keeps leave requests usable', async () => {
  state.clientSession.permissions = new Set(['leave:read']);
  state.clientSession.permissionScopes = { 'leave:read': 'SELF' };
  state.client.request.mockResolvedValue({
    leaveRequests: data.leaveRequests,
    leaveTypes: data.leaveTypes,
  });
  render(<LeaveTeamCalendar />);
  expect(await screen.findByText('Annual leave')).toBeTruthy();
  expect(state.client.request.mock.calls[0]?.[1]).toMatchObject({
    includeEmployees: false,
    includeHolidays: false,
  });
  expect(screen.queryByRole('region', { name: 'Holidays' })).toBeNull();
  expect(screen.queryByRole('option', { name: 'Monthly calendar' })).toBeNull();
});
