// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ManagedAttendancePageDocument,
  UpdateManagedAttendanceSegmentDocument,
} from '../../api/graphql/graphql';

import HrAttendanceManagementPage from './HrAttendanceManagementPage';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

const ashaRow = {
  id: 'attendance-42', employeeId: 'employee-42', employeeName: 'Asha Rao', employeeCode: 'EMP-0042',
  workDate: '2026-08-24', checkInTime: '09:00:00', checkOutTime: '17:30:00',
  status: 'PRESENT', source: 'BIOMETRIC', regularizationStatus: 'REGULARIZED',
  createdAt: '2026-08-24T09:00:00Z', updatedAt: '2026-08-24T17:30:00Z',
};

const managedPage = (
  rows = [ashaRow],
  pageInfo: { endCursor: string | null; hasNextPage: boolean } = { endCursor: 'opaque-next', hasNextPage: true }
) => ({ managedAttendance: { edges: rows.map((node, index) => ({ cursor: `row-${index}`, node })), pageInfo } });

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  return { promise: new Promise<T>((done) => { resolve = done; }), resolve };
};

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 25, 12));
  graphState.client = { request: vi.fn() };
  graphState.client.request.mockResolvedValue(managedPage());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('HrAttendanceManagementPage', () => {
  it('requests the frozen current month with the generated document only', async () => {
    render(<HrAttendanceManagementPage />);
    await settle();

    expect(screen.getByText('Asha Rao')).toBeTruthy();
    expect(graphState.client.request).toHaveBeenCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-01', toDate: '2026-08-31', first: 50,
    });
    expect(graphState.client.request.mock.calls.every(([document]: [unknown]) => document === ManagedAttendancePageDocument)).toBe(true);
  });

  it('holds meaningful normalized search for exactly 300 ms before requesting page one', async () => {
    render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.change(screen.getByLabelText('Employee name or code'), { target: { value: '  EMP-0042  ' } });

    expect(screen.getByText('Updating attendance search')).toBeTruthy();
    expect(graphState.client.request).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTime(299));
    expect(graphState.client.request).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(1); await Promise.resolve(); });
    expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-01', toDate: '2026-08-31', employeeSearch: 'EMP-0042', first: 50,
    });
  });

  it('ignores whitespace-only edits of an applied search', async () => {
    render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.change(screen.getByLabelText('Employee name or code'), { target: { value: 'EMP-0042' } });
    await act(async () => { vi.advanceTimersByTime(300); await Promise.resolve(); });
    expect(graphState.client.request).toHaveBeenCalledTimes(2);

    fireEvent.change(screen.getByLabelText('Employee name or code'), { target: { value: '  EMP-0042  ' } });
    await act(async () => vi.advanceTimersByTime(300));
    expect(graphState.client.request).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Updating attendance search…')).toBeNull();
  });

  it('does not request page two with the old search while a new search is pending', async () => {
    graphState.client.request.mockImplementation((_: unknown, variables?: { after?: string }) => Promise.resolve(
      variables?.after === 'opaque-next'
        ? managedPage([{ ...ashaRow, id: 'attendance-43', employeeName: 'Bina Shah' }], { endCursor: null, hasNextPage: false })
        : managedPage()
    ));
    render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await settle();
    expect(screen.getByText('Bina Shah')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Employee name or code'), { target: { value: 'Asha' } });
    expect(graphState.client.request).toHaveBeenCalledTimes(2);
    await act(async () => vi.advanceTimersByTime(299));
    expect(graphState.client.request).toHaveBeenCalledTimes(2);
    await act(async () => { vi.advanceTimersByTime(1); await Promise.resolve(); });
    expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-01', toDate: '2026-08-31', employeeSearch: 'Asha', first: 50,
    });
  });

  it('does not publish a superseded response after a newer search completes', async () => {
    const stale = deferred<ReturnType<typeof managedPage>>();
    const current = deferred<ReturnType<typeof managedPage>>();
    graphState.client.request.mockReturnValueOnce(stale.promise).mockReturnValueOnce(current.promise);
    render(<HrAttendanceManagementPage />);
    fireEvent.change(screen.getByLabelText('Employee name or code'), { target: { value: 'Bina' } });

    await act(async () => { stale.resolve(managedPage([{ ...ashaRow, id: 'attendance-stale', employeeName: 'Stale Asha' }])); await Promise.resolve(); });
    expect(screen.queryByText('Stale Asha')).toBeNull();

    await act(async () => vi.advanceTimersByTime(300));

    await act(async () => { current.resolve(managedPage([{ ...ashaRow, id: 'attendance-43', employeeName: 'Bina Shah' }])); await Promise.resolve(); });
    expect(screen.getByText('Bina Shah')).toBeTruthy();
    await act(async () => { stale.resolve(managedPage([{ ...ashaRow, id: 'attendance-stale', employeeName: 'Stale Asha' }])); await Promise.resolve(); });
    expect(screen.queryByText('Stale Asha')).toBeNull();
  });

  it('hands scope-derived add and exact adjust targets to explicit callers', async () => {
    const onAdd = vi.fn();
    const onAdjust = vi.fn();
    render(<HrAttendanceManagementPage onAdd={onAdd} onAdjust={onAdjust} />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Add segment for Asha Rao' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adjust Asha Rao on 2026-08-24' }));

    expect(onAdd).toHaveBeenCalledWith({ employeeId: 'employee-42', employeeName: 'Asha Rao', employeeCode: 'EMP-0042' });
    expect(onAdjust).toHaveBeenCalledWith(ashaRow);
  });

  it('returns to the prior page and refreshes the current opaque page', async () => {
    graphState.client.request.mockImplementation((_: unknown, variables?: { after?: string }) => Promise.resolve(
      variables?.after === 'opaque-next'
        ? managedPage([{ ...ashaRow, id: 'attendance-43', employeeName: 'Bina Shah' }], { endCursor: null, hasNextPage: false })
        : managedPage()
    ));
    render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh attendance' }));
    await settle();
    expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, expect.objectContaining({ after: 'opaque-next' }));

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await settle();
    expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-01', toDate: '2026-08-31', first: 50,
    });
  });

  it('resets to page one, refetches, and identifies the employee after a successful adjustment', async () => {
    graphState.client.request.mockImplementation((document: unknown, variables?: { after?: string }) => {
      if (document === UpdateManagedAttendanceSegmentDocument) return Promise.resolve({});
      return Promise.resolve(
        variables?.after === 'opaque-next'
          ? managedPage(
              [{ ...ashaRow, id: 'attendance-43', employeeName: 'Bina Shah', employeeCode: 'EMP-0043' }],
              { endCursor: null, hasNextPage: false }
            )
          : managedPage()
      );
    });
    render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Adjust Bina Shah on 2026-08-24' }));
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Approved biometric correction' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update segment' }));
    await settle();

    expect(graphState.client.request).toHaveBeenCalledWith(
      UpdateManagedAttendanceSegmentDocument,
      expect.anything()
    );
    expect(graphState.client.request).toHaveBeenLastCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-01', toDate: '2026-08-31', first: 50,
    });
    expect(screen.getByText('Attendance updated for Bina Shah on 2026-08-24.')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows an actionable error without an empty-record message', async () => {
    graphState.client.request.mockRejectedValueOnce(new Error('transport internals'));
    render(<HrAttendanceManagementPage />);
    await settle();
    expect(screen.getAllByRole('alert').some((alert) => alert.textContent?.includes('Attendance could not be loaded'))).toBe(true);
    expect(screen.queryByText('No attendance records match these filters.')).toBeNull();
    expect(document.body.textContent).not.toContain('transport internals');
  });

  it('fails closed across a client replacement and ignores the old page request', async () => {
    const replacementPage = deferred<ReturnType<typeof managedPage>>();
    const oldClient = graphState.client;
    oldClient.request.mockImplementation((_: unknown, variables?: { after?: string }) =>
      Promise.resolve(
        variables?.after
          ? managedPage(
          [{ ...ashaRow, id: 'attendance-43', employeeName: 'Bina Shah' }],
          { endCursor: null, hasNextPage: false }
        )
          : managedPage()
      )
    );

    const { rerender } = render(<HrAttendanceManagementPage />);
    await settle();
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-02' } });
    await settle();
    fireEvent.change(screen.getByLabelText('Employee name or code'), {
      target: { value: 'Bina' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Adjust Bina Shah on 2026-08-24' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    const replacementClient = { request: vi.fn().mockReturnValue(replacementPage.promise) };
    graphState.client = replacementClient;
    rerender(<HrAttendanceManagementPage />);

    expect(screen.queryByText('Bina Shah')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Adjust Bina Shah on 2026-08-24' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Previous page' })).toBeNull();
    expect(screen.getByLabelText<HTMLInputElement>('Start date').value).toBe('2026-08-01');
    expect(screen.getByLabelText<HTMLInputElement>('Employee name or code').value).toBe('');
    expect(replacementClient.request).toHaveBeenCalledWith(ManagedAttendancePageDocument, {
      fromDate: '2026-08-01', toDate: '2026-08-31', first: 50,
    });
    expect(replacementClient.request.mock.calls[0][1]).not.toHaveProperty('employeeSearch');
    expect(replacementClient.request.mock.calls[0][1]).not.toHaveProperty('employeeId');
    expect(replacementClient.request.mock.calls[0][1]).not.toHaveProperty('after');

    await act(async () => {
      replacementPage.resolve(
        managedPage([{ ...ashaRow, id: 'attendance-new', employeeName: 'Replacement Client Row' }])
      );
      await Promise.resolve();
    });
    expect(screen.getByText('Replacement Client Row')).toBeTruthy();
    expect(oldClient.request).toHaveBeenCalledTimes(4);
  });

  it('does not publish a late query completion from a replaced client', async () => {
    const oldPage = deferred<ReturnType<typeof managedPage>>();
    graphState.client.request.mockReturnValueOnce(oldPage.promise);
    const { rerender } = render(<HrAttendanceManagementPage />);

    const replacementClient = { request: vi.fn().mockResolvedValue(
      managedPage([{ ...ashaRow, id: 'attendance-new', employeeName: 'Replacement Client Row' }])
    ) };
    graphState.client = replacementClient;
    rerender(<HrAttendanceManagementPage />);
    await settle();
    expect(screen.getByText('Replacement Client Row')).toBeTruthy();

    await act(async () => {
      oldPage.resolve(
        managedPage([{ ...ashaRow, id: 'attendance-stale', employeeName: 'Stale Client Row' }])
      );
      await Promise.resolve();
    });
    expect(screen.queryByText('Stale Client Row')).toBeNull();
    expect(screen.getByText('Replacement Client Row')).toBeTruthy();
  });

  it('hides an old-client failure notice synchronously on client replacement', async () => {
    graphState.client.request.mockRejectedValueOnce(new Error('old client failure'));
    const { rerender } = render(<HrAttendanceManagementPage />);
    await settle();
    expect(screen.getByText('Attendance could not be loaded')).toBeTruthy();

    graphState.client = { request: vi.fn().mockReturnValue(new Promise(() => undefined)) };
    rerender(<HrAttendanceManagementPage />);

    expect(screen.queryByText('Attendance could not be loaded')).toBeNull();
    expect(screen.getByText(/Loading attendance records/)).toBeTruthy();
  });
});
