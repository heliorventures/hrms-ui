import { useCallback, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  ApproveExpenseDocument,
  ApproveTravelRequestDocument,
  MarkExpensePaymentStatusDocument,
  RejectExpenseDocument,
  RejectTravelRequestDocument,
  SubmitExpenseDocument,
  type ApproveExpenseMutation,
  type ApproveTravelRequestMutation,
  type MarkExpensePaymentStatusMutation,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { EXPENSE_BUSY_PREFIX, EXPENSE_STATUS } from '../constants';
import type {
  ApproveExpenseTarget,
  ExpenseBoardData,
  ExpenseNotice,
  ExpenseRow,
  RejectTarget,
  SubmitExpenseInput,
} from '../types';
import { parseStrictMoney, validatePositiveMoney } from '../utils/amountValidation';

interface UseExpenseActionsArgs {
  client: GraphQLClient;
  refresh: () => Promise<ExpenseBoardData>;
  setNotice: (notice: ExpenseNotice | null) => void;
}

export function useExpenseActions({ client, refresh, setNotice }: UseExpenseActionsArgs) {
  const [approveTarget, setApproveTarget] = useState<ApproveExpenseTarget | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const openApproveExpense = useCallback((row: ExpenseRow) => {
    setApproveError(null);
    setApproveTarget({
      id: row.id,
      claimAmount: row.amount,
      currency: row.currency,
      draftApprove: row.amount,
    });
  }, []);

  const approveExpense = useCallback(async () => {
    if (!approveTarget) return;
    setApproveError(null);
    const approvedAmount = approveTarget.draftApprove.trim();
    const approvedError = validatePositiveMoney(approvedAmount, 'Approved amount');
    if (approvedError) {
      setApproveError(approvedError);
      return;
    }
    const claimedAmountNumber = parseStrictMoney(approveTarget.claimAmount);
    const approvedAmountNumber = parseStrictMoney(approvedAmount);
    if (!Number.isFinite(claimedAmountNumber) || claimedAmountNumber <= 0) {
      setApproveError('Claim amount is invalid; refresh the expense board before approving.');
      return;
    }
    if (approvedAmountNumber > claimedAmountNumber) {
      setApproveError('Approved amount cannot exceed the claimed amount.');
      return;
    }
    setBusyKey(`${EXPENSE_BUSY_PREFIX.expense}:${approveTarget.id}`);
    try {
      const result = await client.request<ApproveExpenseMutation>(ApproveExpenseDocument, {
        expenseId: approveTarget.id,
        ...(approvedAmountNumber === claimedAmountNumber ? {} : { approvedAmount }),
      });
      await refresh();
      setApproveTarget(null);
      const status = result.approveExpense.status.toUpperCase();
      if (status === EXPENSE_STATUS.pending && result.approveExpense.workflowInstanceId) {
        setNotice({
          variant: 'info',
          message: 'Approval saved. Another approver must complete the workflow.',
        });
      } else if (status === EXPENSE_STATUS.partialApproved) {
        setNotice({
          variant: 'success',
          message: 'Partial approval recorded with the approved reimbursable amount.',
        });
      } else if (status === EXPENSE_STATUS.approved) {
        setNotice({ variant: 'success', message: 'Expense claim approved.' });
      }
    } catch (err) {
      setApproveError(graphQlUserMessage(err));
    } finally {
      setBusyKey(null);
    }
  }, [approveTarget, client, refresh, setNotice]);

  const markExpensePaid = useCallback(
    async (expenseId: string, paymentReference: string) => {
      const reference = paymentReference.trim();
      if (!reference) {
        setNotice({
          variant: 'error',
          message: 'Payment reference is required before marking an expense as paid.',
        });
        return false;
      }
      setBusyKey(`${EXPENSE_BUSY_PREFIX.payment}:${expenseId}`);
      try {
        await client.request<MarkExpensePaymentStatusMutation>(MarkExpensePaymentStatusDocument, {
          expenseId,
          paymentStatus: EXPENSE_STATUS.paid,
          paymentReference: reference,
        });
        await refresh();
        setNotice({ variant: 'success', message: 'Payment marked as paid.' });
        return true;
      } catch (err) {
        setNotice({ variant: 'error', message: graphQlUserMessage(err) });
        return false;
      } finally {
        setBusyKey(null);
      }
    },
    [client, refresh, setNotice]
  );

  const rejectFromModal = useCallback(
    async (reason: string | null) => {
      const target = rejectTarget;
      if (!target) return;
      const prefix =
        target.kind === 'expense' ? EXPENSE_BUSY_PREFIX.expense : EXPENSE_BUSY_PREFIX.travel;
      setBusyKey(`${prefix}:${target.id}`);
      try {
        if (target.kind === 'expense') {
          await client.request(RejectExpenseDocument, { expenseId: target.id, reason });
        } else {
          await client.request(RejectTravelRequestDocument, { travelRequestId: target.id, reason });
        }
        await refresh();
      } catch (err) {
        throw new Error(graphQlUserMessage(err));
      } finally {
        setBusyKey(null);
      }
    },
    [client, refresh, rejectTarget]
  );

  const approveTravel = useCallback(
    async (travelRequestId: string) => {
      setBusyKey(`${EXPENSE_BUSY_PREFIX.travel}:${travelRequestId}`);
      try {
        const result = await client.request<ApproveTravelRequestMutation>(
          ApproveTravelRequestDocument,
          { travelRequestId }
        );
        await refresh();
        const status = result.approveTravelRequest.status.toUpperCase();
        if (status === EXPENSE_STATUS.pending && result.approveTravelRequest.workflowInstanceId) {
          setNotice({
            variant: 'info',
            message: 'Travel approval saved. The next approver must complete their step.',
          });
        } else if (status === EXPENSE_STATUS.approved) {
          setNotice({ variant: 'success', message: 'Travel request approved.' });
        }
      } catch (err) {
        setNotice({ variant: 'error', message: graphQlUserMessage(err) });
      } finally {
        setBusyKey(null);
      }
    },
    [client, refresh, setNotice]
  );

  const submitExpense = useCallback(
    async (input: SubmitExpenseInput) => {
      setSubmittingExpense(true);
      try {
        await client.request(SubmitExpenseDocument, { input });
        await refresh();
        setNotice({ variant: 'success', message: 'Expense claim submitted.' });
      } catch (err) {
        throw err;
      } finally {
        setSubmittingExpense(false);
      }
    },
    [client, refresh, setNotice]
  );

  return {
    approveError,
    approveExpense,
    approveTarget,
    approveTravel,
    busyKey,
    markExpensePaid,
    openApproveExpense,
    rejectFromModal,
    rejectTarget,
    setApproveError,
    setApproveTarget,
    setRejectTarget,
    submitExpense,
    submittingExpense,
  };
}
