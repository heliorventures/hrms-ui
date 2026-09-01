// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AdjustLeaveBalanceEntitlementAdminDocument,
  AdminLeaveConsoleDocument,
} from '../../../api/graphql/graphql';

import { useAdminLeaveSettings } from './useAdminLeaveSettings';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));
vi.mock('../../../contexts/DialogContext', () => ({
  useDialogs: () => ({ confirm: vi.fn(), alert: vi.fn() }),
}));
vi.mock('./useAdminLeaveHolidays', () => ({ useAdminLeaveHolidays: () => ({}) }));

const consoleData = {
  employees: [],
  leaveTypes: [],
  leavePolicies: [],
  leaveBalances: [],
  holidayCalendars: [],
};
let submittedAdjustmentInput: Record<string, unknown> | undefined;

beforeEach(() => {
  submittedAdjustmentInput = undefined;
  graphState.client = {
    request: vi.fn((document: unknown, variables?: { input?: Record<string, unknown> }) => {
      if (document === AdjustLeaveBalanceEntitlementAdminDocument) {
        submittedAdjustmentInput = variables?.input;
      }
      return Promise.resolve(document === AdminLeaveConsoleDocument ? consoleData : {});
    }),
  };
});

afterEach(cleanup);

describe('useAdminLeaveSettings', () => {
  it('submits entitlement adjustment without the obsolete balance-credit flag', async () => {
    const { result } = renderHook(() => useAdminLeaveSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setAdjustmentForm({
        employeeId: ' employee-1 ',
        leaveTypeId: 'leave-type-1',
        year: '2026',
        delta: '2.5',
      });
    });
    await act(async () => {
      await result.current.adjustBalance({ preventDefault: vi.fn() } as never);
    });

    expect(graphState.client.request).toHaveBeenCalledWith(
      AdjustLeaveBalanceEntitlementAdminDocument,
      expect.objectContaining({
        input: {
          employeeId: 'employee-1',
          leaveTypeId: 'leave-type-1',
          year: 2026,
          entitledDelta: '2.5',
        },
      })
    );
    expect(submittedAdjustmentInput).not.toHaveProperty('alsoCreditBalance');
  });
});
