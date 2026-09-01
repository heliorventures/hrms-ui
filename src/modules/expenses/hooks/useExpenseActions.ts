import { useCallback, useEffect, useState } from 'react';
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
  TravelRequestRow,
} from '../types';
import { parseStrictMoney, validatePositiveMoney } from '../utils/amountValidation';

interface UseExpenseActionsArgs {
  canApproveExpense: boolean;
  canApproveTravel: boolean;
  canMarkExpensePaid: boolean;
  canSubmitExpense: boolean;
  client: GraphQLClient;
  ownerKey: string;
  refresh: () => Promise<ExpenseBoardData>;
  setNotice: (notice: ExpenseNotice | null) => void;
}

export function useExpenseActions({
  canApproveExpense,
  canApproveTravel,
  canMarkExpensePaid,
  canSubmitExpense,
  client,
  ownerKey,
  refresh,
  setNotice,
}: UseExpenseActionsArgs) {
  const [approveTarget, setApproveTarget] = useState<ApproveExpenseTarget | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  useEffect(() => {
    setApproveTarget(null);
    setApproveError(null);
    setRejectTarget(null);
    setBusyKey(null);
    setSubmittingExpense(false);
  }, [ownerKey]);

  const openApproveExpense = useCallback((row: ExpenseRow) => {
    if (!canApproveExpense) return;
    if (!row.pendingApprovalStepId) {
      setNotice({
        variant: 'warning',
        message: 'This approval step is no longer available. Refresh the expense board and try again.',
      });
      return;
    }
    setApproveError(null);
    setApproveTarget({
      id: row.id,
      expectedWorkflowStepId: row.pendingApprovalStepId,
      claimAmount: row.amount,
      currency: row.currency,
      draftApprove: row.amount,
    });
  }, [canApproveExpense, setNotice]);

  const approveExpense = useCallback(async () => {
    if (!canApproveExpense || !approveTarget) return;
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
        expectedWorkflowStepId: approveTarget.expectedWorkflowStepId,
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
  }, [approveTarget, canApproveExpense, client, refresh, setNotice]);

  const markExpensePaid = useCallback(
    async (expenseId: string, paymentReference: string) => {
      if (!canMarkExpensePaid) return false;
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
    [canMarkExpensePaid, client, refresh, setNotice]
  );

  const rejectFromModal = useCallback(
    async (reason: string | null) => {
      const target = rejectTarget;
      if (!target) return;
      if (
        (target.kind === 'expense' && !canApproveExpense) ||
        (target.kind === 'travel' && !canApproveTravel)
      ) {
        setRejectTarget(null);
        return;
      }
      const prefix =
        target.kind === 'expense' ? EXPENSE_BUSY_PREFIX.expense : EXPENSE_BUSY_PREFIX.travel;
      setBusyKey(`${prefix}:${target.id}`);
      try {
        if (target.kind === 'expense') {
          await client.request(RejectExpenseDocument, {
            expenseId: target.id,
            expectedWorkflowStepId: target.expectedWorkflowStepId,
            reason,
          });
        } else {
          await client.request(RejectTravelRequestDocument, {
            travelRequestId: target.id,
            expectedWorkflowStepId: target.expectedWorkflowStepId,
            reason,
          });
        }
        await refresh();
      } catch (err) {
        throw new Error(graphQlUserMessage(err));
      } finally {
        setBusyKey(null);
      }
    },
    [canApproveExpense, canApproveTravel, client, refresh, rejectTarget]
  );

  const approveTravel = useCallback(
    async (row: TravelRequestRow) => {
      if (!canApproveTravel) return;
      if (!row.pendingApprovalStepId) {
        setNotice({
          variant: 'warning',
          message: 'This approval step is no longer available. Refresh the travel requests and try again.',
        });
        return;
      }
      setBusyKey(`${EXPENSE_BUSY_PREFIX.travel}:${row.id}`);
      try {
        const result = await client.request<ApproveTravelRequestMutation>(
          ApproveTravelRequestDocument,
          {
            travelRequestId: row.id,
            expectedWorkflowStepId: row.pendingApprovalStepId,
          }
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
    [canApproveTravel, client, refresh, setNotice]
  );

  const submitExpense = useCallback(
    async (input: SubmitExpenseInput) => {
      if (!canSubmitExpense) return;
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
    [canSubmitExpense, client, refresh, setNotice]
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
