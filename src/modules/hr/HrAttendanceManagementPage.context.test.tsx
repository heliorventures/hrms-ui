// @vitest-environment jsdom

import { act, cleanup, fireEvent, render as renderUi, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AddManagedAttendanceSegmentDocument,
  ManagedAttendancePageDocument,
  UpdateManagedAttendanceSegmentDocument,
} from '../../api/graphql/graphql';

import HrAttendanceManagementPage from './HrAttendanceManagementPage';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));
const authState = vi.hoisted(() => ({
  identity: 'employee-a',
  userId: 'user-a',
  tenantId: 'tenant-a',
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: authState.identity,
    user: { id: authState.userId },
    tenantId: authState.tenantId,
  }),
}));
vi.mock('../../auth/permissionService', () => ({
  authorizationStateKey: (session: string) => session,
}));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

const render = (ui: ReactElement) => renderUi(ui, { wrapper: MemoryRouter });

const RouteControls = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="url">{location.search}</output>
      <button onClick={() => navigate(-1)}>Back</button>
      <Link to="/away">Leave page</Link>
    </>
  );
};

const RouteHarness = () => {
  return (
    <>
      <RouteControls />
      <Routes>
        <Route path="/" element={<HrAttendanceManagementPage />} />
        <Route path="/away" element={<Link to="/">Return to attendance</Link>} />
      </Routes>
    </>
  );
};

const ashaRow = {
  id: 'attendance-42',
  employeeId: 'employee-42',
  employeeName: 'Asha Rao',
  employeeCode: 'EMP-0042',
  workDate: '2026-08-24',
  checkInTime: '09:00:00',
  checkOutTime: '17:30:00',
  status: 'PRESENT',
  source: 'BIOMETRIC',
  regularizationStatus: 'REGULARIZED',
  createdAt: '2026-08-24T09:00:00Z',
  updatedAt: '2026-08-24T17:30:00Z',
};

const managedPage = (
  rows = [ashaRow],
  pageInfo: { endCursor: string | null; hasNextPage: boolean } = {
    endCursor: 'opaque-next',
    hasNextPage: true,
  }
) => ({
  managedAttendance: {
    edges: rows.map((node, index) => ({ cursor: `row-${index}`, node })),
    pageInfo,
  },
});

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(() => {
  authState.identity = 'employee-a';
  authState.userId = 'user-a';
  authState.tenantId = 'tenant-a';
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 25, 12));
  graphState.client = { request: vi.fn() };
  graphState.client.request.mockResolvedValue(managedPage());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('HR attendance context', () => {
  it('creates from a historical row with its employee and date without reusing its edit id', async () => {
    render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.click(screen.getAllByRole('button', { name: 'Add segment for Asha Rao' })[0]);
    expect(screen.getByLabelText<HTMLInputElement>('Work Date').value).toBe('2026-08-24');
    fireEvent.change(screen.getByLabelText('Punch In'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Punch Out'), { target: { value: '19:00' } });
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Approved evening work' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save segment' }));
    await settle();
    expect(graphState.client.request).toHaveBeenCalledWith(AddManagedAttendanceSegmentDocument, {
      input: {
        employeeId: 'employee-42',
        workDate: '2026-08-24',
        checkInTime: '18:00:00',
        checkOutTime: '19:00:00',
        reason: 'Approved evening work',
      },
    });
    expect(
      graphState.client.request.mock.calls.some(
        ([document]) => document === UpdateManagedAttendanceSegmentDocument
      )
    ).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('restores dates and private search on return, supports Back, and resets opaque pagination', async () => {
    render(<RouteHarness />);
    await settle();
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-02' } });
    await settle();
    fireEvent.change(screen.getByLabelText('Employee name or code'), { target: { value: 'Asha' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await settle();
    expect(screen.getByTestId('url').textContent).not.toContain('Asha');
    fireEvent.click(screen.getByText('Leave page'));
    graphState.client = { request: vi.fn().mockResolvedValue(managedPage()) };
    fireEvent.click(screen.getByText('Return to attendance'));
    await settle();
    expect(screen.getByLabelText<HTMLInputElement>('Start date').value).toBe('2026-08-02');
    expect(screen.getByLabelText<HTMLInputElement>('Employee name or code').value).toBe('Asha');
    expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-02',
      toDate: '2026-08-31',
      employeeSearch: 'Asha',
      first: 50,
    });
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-03' } });
    await settle();
    fireEvent.click(screen.getByText('Back'));
    await settle();
    expect(screen.getByLabelText<HTMLInputElement>('Start date').value).toBe('2026-08-02');
  });

  it.each(['identity', 'userId', 'tenantId'] as const)(
    'clears private search and dates when %s changes with the same client',
    async (field) => {
      const app = render(<HrAttendanceManagementPage />);
      await settle();
      fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-02' } });
      fireEvent.change(screen.getByLabelText('Employee name or code'), {
        target: { value: 'Asha' },
      });
      await act(async () => {
        vi.advanceTimersByTime(300);
        await Promise.resolve();
      });
      authState[field] = 'replacement';
      app.rerender(<HrAttendanceManagementPage />);
      await settle();
      expect(screen.getByLabelText<HTMLInputElement>('Start date').value).toBe('2026-08-01');
      expect(screen.getByLabelText<HTMLInputElement>('Employee name or code').value).toBe('');
      expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, {
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
        first: 50,
      });
    }
  );
});
