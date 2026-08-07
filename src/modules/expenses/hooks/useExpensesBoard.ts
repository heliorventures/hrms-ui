import { useCallback, useEffect, useState } from 'react';
import {
  ExpenseBoardDocument,
  ExpenseSubmissionHintsDocument,
  type ExpenseSubmissionHintsQuery,
} from '../../../api/graphql/graphql';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { EXPENSE_BOARD_LIMIT } from '../constants';
import type { ExpenseBoardData, ExpenseNotice, ExpenseSubmissionHints } from '../types';

export function useExpensesBoard(userId?: string) {
  const client = useGraphClient('client');
  const [data, setData] = useState<ExpenseBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<ExpenseNotice | null>(null);
  const [submissionHints, setSubmissionHints] = useState<ExpenseSubmissionHints | null>(null);

  const loadBoard = useCallback(async () => {
    return client.request<ExpenseBoardData>(ExpenseBoardDocument, {
      limit: EXPENSE_BOARD_LIMIT,
    });
  }, [client]);

  const refresh = useCallback(async () => {
    const result = await loadBoard();
    setData(result);
    return result;
  }, [loadBoard]);

  const loadSubmissionHints = useCallback(
    async (expenseCategoryId: string) => {
      if (!expenseCategoryId.trim()) {
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
    [client]
  );

  useEffect(() => {
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
  }, [loadBoard, userId]);

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
