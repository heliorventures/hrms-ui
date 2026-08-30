// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ExpenseBoardDocument,
  ExpenseSubmissionHintsDocument,
  OrgChartDocument,
} from '../../../api/graphql/graphql';

import { useExpensesBoard } from './useExpensesBoard';

const graphState = vi.hoisted(() => ({ client: { request: vi.fn() } }));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => graphState.client }));

beforeEach(() => {
  graphState.client.request = vi.fn((document: unknown) => {
    if (document === ExpenseBoardDocument) {
      return Promise.resolve({ expenseCategories: [], expenses: [], travelRequests: [] });
    }
    if (document === OrgChartDocument) return Promise.resolve({ orgChart: [] });
    return Promise.reject(new Error('Unexpected GraphQL document.'));
  });
});

describe('useExpensesBoard authorization', () => {
  it('does not issue any request without expense or travel read permission', async () => {
    const { result } = renderHook(() =>
      useExpensesBoard({
        canReadEmployees: false,
        canReadExpenses: false,
        canReadTravel: false,
        canSubmitExpenses: false,
        ownerKey: 'employee-1|none',
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(graphState.client.request).not.toHaveBeenCalled();
    await expect(result.current.refresh()).resolves.toEqual({ employeeLabels: {} });
  });

  it('requests only the authorized expense branch and skips employee directory labels', async () => {
    const { result } = renderHook(() =>
      useExpensesBoard({
        canReadEmployees: false,
        canReadExpenses: true,
        canReadTravel: false,
        canSubmitExpenses: false,
        ownerKey: 'employee-1|expense:read',
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(graphState.client.request).toHaveBeenCalledTimes(1);
    expect(graphState.client.request).toHaveBeenCalledWith(ExpenseBoardDocument, {
      includeExpenses: true,
      includeTravel: false,
      limit: 20,
    });
  });

  it('does not request submission hints without expense:submit scope', async () => {
    const { result } = renderHook(() =>
      useExpensesBoard({
        canReadEmployees: false,
        canReadExpenses: true,
        canReadTravel: false,
        canSubmitExpenses: false,
        ownerKey: 'employee-1|expense:read',
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.loadSubmissionHints('category-1');

    expect(graphState.client.request).not.toHaveBeenCalledWith(
      ExpenseSubmissionHintsDocument,
      expect.anything()
    );
  });
});
