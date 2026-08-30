// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { describe, expect, it, vi } from 'vitest';

import {
  ApproveExpenseDocument,
  ApproveTravelRequestDocument,
  RejectExpenseDocument,
  RejectTravelRequestDocument,
} from '../../../api/graphql/graphql';
import type { ExpenseRow, TravelRequestRow } from '../types';
import { useExpenseActions } from './useExpenseActions';

const expenseRow = (pendingApprovalStepId?: string | null): ExpenseRow => ({
  id: 'expense-1',
  employeeId: 'employee-1',
  expenseCategoryId: 'category-1',
  amount: '100.00',
  currency: 'INR',
  expenseDate: '2026-08-27',
  title: 'Taxi',
  status: 'PENDING',
  pendingApprovalStepId,
  viewerMayApprove: true,
  submittedAt: '2026-08-27T00:00:00Z',
});

const travelRow = (pendingApprovalStepId?: string | null): TravelRequestRow => ({
  id: 'travel-1',
  employeeId: 'employee-1',
  fromDate: '2026-09-01',
  toDate: '2026-09-02',
  purpose: 'Client visit',
  currency: 'INR',
  status: 'PENDING',
  pendingApprovalStepId,
  viewerMayApprove: true,
  submittedAt: '2026-08-27T00:00:00Z',
});

function setup() {
  const request = vi.fn((document: unknown) => {
    if (document === ApproveExpenseDocument) {
      return Promise.resolve({
        approveExpense: { status: 'APPROVED', workflowInstanceId: 'workflow-1' },
      });
    }
    if (document === ApproveTravelRequestDocument) {
      return Promise.resolve({
        approveTravelRequest: { status: 'APPROVED', workflowInstanceId: 'workflow-1' },
      });
    }
    return Promise.resolve({});
  });
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const refresh = vi.fn().mockResolvedValue({ employeeLabels: {} });
  const setNotice = vi.fn();
  const hook = renderHook(() =>
    useExpenseActions({
      canApproveExpense: true,
      canApproveTravel: true,
      canMarkExpensePaid: false,
      canSubmitExpense: false,
      client,
      ownerKey: 'approver|expense:approve=TEAM',
      refresh,
      setNotice,
    })
  );
  return { ...hook, refresh, request, setNotice };
}

describe('expense and travel workflow-step actions', () => {
  it('refuses an expense approval when the server step is absent', () => {
    const { result, setNotice } = setup();

    act(() => result.current.openApproveExpense(expenseRow(null)));

    expect(result.current.approveTarget).toBeNull();
    expect(setNotice).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'warning', message: expect.stringContaining('Refresh') })
    );
  });

  it('passes the expense step to approve and reject mutations', async () => {
    const { result, request } = setup();
    act(() => result.current.openApproveExpense(expenseRow('expense-step')));
    await act(async () => result.current.approveExpense());
    expect(request).toHaveBeenCalledWith(ApproveExpenseDocument, {
      expenseId: 'expense-1',
      expectedWorkflowStepId: 'expense-step',
    });

    act(() =>
      result.current.setRejectTarget({
        kind: 'expense',
        id: 'expense-1',
        expectedWorkflowStepId: 'expense-step',
      })
    );
    await act(async () => result.current.rejectFromModal('Incorrect amount'));
    expect(request).toHaveBeenCalledWith(RejectExpenseDocument, {
      expenseId: 'expense-1',
      expectedWorkflowStepId: 'expense-step',
      reason: 'Incorrect amount',
    });
  });

  it('passes the travel step to approve and reject mutations', async () => {
    const { result, request } = setup();
    await act(async () => result.current.approveTravel(travelRow('travel-step')));
    expect(request).toHaveBeenCalledWith(ApproveTravelRequestDocument, {
      travelRequestId: 'travel-1',
      expectedWorkflowStepId: 'travel-step',
    });

    act(() =>
      result.current.setRejectTarget({
        kind: 'travel',
        id: 'travel-1',
        expectedWorkflowStepId: 'travel-step',
      })
    );
    await act(async () => result.current.rejectFromModal('Dates unavailable'));
    expect(request).toHaveBeenCalledWith(RejectTravelRequestDocument, {
      travelRequestId: 'travel-1',
      expectedWorkflowStepId: 'travel-step',
      reason: 'Dates unavailable',
    });
  });
});
