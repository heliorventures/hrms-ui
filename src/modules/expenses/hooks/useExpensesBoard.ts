import { useCallback, useEffect, useState } from 'react';
import {
  ExpenseBoardDocument,
  ExpenseSubmissionHintsDocument,
  OrgChartDocument,
  type ExpenseBoardQueryVariables,
  type ExpenseSubmissionHintsQuery,
} from '../../../api/graphql/graphql';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { EXPENSE_BOARD_LIMIT } from '../constants';
import type { ExpenseBoardData, ExpenseNotice, ExpenseSubmissionHints } from '../types';

interface UseExpensesBoardOptions {
  canReadEmployees: boolean;
  canReadExpenses: boolean;
  canReadTravel: boolean;
  canSubmitExpenses: boolean;
  ownerKey: string;
}

export function useExpensesBoard({
  canReadEmployees,
  canReadExpenses,
  canReadTravel,
  canSubmitExpenses,
  ownerKey,
}: UseExpensesBoardOptions) {
  const client = useGraphClient('client');
  const [data, setData] = useState<ExpenseBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<ExpenseNotice | null>(null);
  const [submissionHints, setSubmissionHints] = useState<ExpenseSubmissionHints | null>(null);

  const loadBoard = useCallback(async () => {
    if (!canReadExpenses && !canReadTravel) return { employeeLabels: {} };
    const variables: ExpenseBoardQueryVariables = {
      includeExpenses: canReadExpenses,
      includeTravel: canReadTravel,
      limit: EXPENSE_BOARD_LIMIT,
    };
    const [board, org] = await Promise.all([
      client.request<ExpenseBoardData>(ExpenseBoardDocument, variables),
      canReadEmployees
        ? client
            .request<{
              orgChart: { employeeId: string; employeeCode: string; fullName: string }[];
            }>(OrgChartDocument, { limit: 500 })
            .catch(() => ({ orgChart: [] }))
        : Promise.resolve({ orgChart: [] }),
    ]);
    const employeeLabels: Record<string, string> = {};
    for (const row of org.orgChart ?? []) {
      employeeLabels[row.employeeId] = `${row.fullName} (${row.employeeCode})`;
    }
    return { ...board, employeeLabels };
  }, [canReadEmployees, canReadExpenses, canReadTravel, client]);

  const refresh = useCallback(async () => {
    const result = await loadBoard();
    setData(result);
    return result;
  }, [loadBoard]);

  const loadSubmissionHints = useCallback(
    async (expenseCategoryId: string) => {
      if (!canSubmitExpenses || !expenseCategoryId.trim()) {
        setSubmissionHints(null);
        return;
      }
      try {
        const result = await client.request<ExpenseSubmissionHintsQuery>(
          ExpenseSubmissionHintsDocument,
          { expenseCategoryId }
        );
        setSubmissionHints(result.expenseSubmissionHints);
      } catch {
        setSubmissionHints(null);
      }
    },
    [canSubmitExpenses, client]
  );

  useEffect(() => {
    if (!canReadExpenses && !canReadTravel) {
      setData(null);
      setSubmissionHints(null);
      setNotice(null);
      setLoading(false);
      return undefined;
    }
    setData(null);
    setSubmissionHints(null);
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setNotice(null);
        const result = await loadBoard();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setNotice({ variant: 'error', message: graphQlUserMessage(err) });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canReadExpenses, canReadTravel, loadBoard, ownerKey]);

  return {
    client,
    data,
    loadSubmissionHints,
    loading,
    notice,
    refresh,
    setNotice,
    submissionHints,
  };
}
