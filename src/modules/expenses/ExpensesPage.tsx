import { useMemo, useState } from 'react';
import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import { PERMISSIONS } from '../../auth/permissions';
import { useAuth } from '../../contexts/AuthContext';
import ApproveExpenseModal from './components/ApproveExpenseModal';
import ExpenseCategoryGrid from './components/ExpenseCategoryGrid';
import ExpenseClaimsTable from './components/ExpenseClaimsTable';
import ExpenseNotice from './components/ExpenseNotice';
import ExpensesHeader from './components/ExpensesHeader';
import PaymentReferenceModal from './components/PaymentReferenceModal';
import RejectReasonModal from './components/RejectReasonModal';
import SubmitExpenseModal from './components/SubmitExpenseModal';
import SubmitTravelModal from './components/SubmitTravelModal';
import TravelRequestsTable from './components/TravelRequestsTable';
import { useExpenseActions } from './hooks/useExpenseActions';
import { useExpensesBoard } from './hooks/useExpensesBoard';
import type { ExpenseRow } from './types';

const ExpensesPage = () => {
  const { clientSession } = useAuth();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<ExpenseRow | null>(null);
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const ownerKey = authorizationStateKey(clientSession);
  const canReadEmployees = permissions.canScopedPermission(PERMISSIONS.employeeRead, [
    'TEAM',
    'DEPARTMENT',
    'ALL',
  ]);
  const canSubmitExpense = permissions.canCapability('action.expense.submit');
  const canSubmitTravel = permissions.canCapability('action.travel.submit');
  const canApproveExpense = permissions.canCapability('action.expense.approve');
  const canApproveTravel = permissions.canCapability('action.travel.approve');
  const canManageExpense = permissions.canCapability('action.expense.manage');
  const canMarkPayment = permissions.canCapability('action.expense.pay');
  const canAccessExpenses =
    permissions.canScopedPermission(PERMISSIONS.expenseRead) ||
    canSubmitExpense ||
    canApproveExpense ||
    canManageExpense ||
    canMarkPayment;
  const canAccessTravel =
    permissions.canScopedPermission(PERMISSIONS.travelRead) ||
    canSubmitTravel ||
    canApproveTravel ||
    permissions.canCapability('action.travel.manage');
  const {
    client,
    data,
    loadSubmissionHints,
    loading,
    notice,
    refresh,
    setNotice,
    submissionHints,
  } = useExpensesBoard({
    canReadEmployees,
    canReadExpenses: canAccessExpenses,
    canReadTravel: canAccessTravel,
    canSubmitExpenses: canSubmitExpense,
    ownerKey,
  });

  const actions = useExpenseActions({
    canApproveExpense,
    canApproveTravel,
    canMarkExpensePaid: canMarkPayment,
    canSubmitExpense,
    client,
    ownerKey,
    refresh,
    setNotice,
  });

  const categories = data?.expenseCategories ?? [];
  const expenses = data?.expenses ?? [];
  const travelRequests = data?.travelRequests ?? [];
  const employeeLabels = data?.employeeLabels ?? {};
  const travelRequestLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const row of travelRequests) {
      const route = [row.originLocation, row.destinationLocation].filter(Boolean).join(' -> ');
      labels[row.id] = `${route || row.purpose} (${row.fromDate})`;
    }
    return labels;
  }, [travelRequests]);

  if (!canAccessExpenses && !canAccessTravel) return null;

  return (
    <div className="space-y-4">
      <ExpensesHeader
        canManageExpense={canManageExpense}
        canSubmitExpense={canSubmitExpense}
        canSubmitTravel={canSubmitTravel}
        onOpenExpense={() => setSubmitOpen(true)}
        onOpenTravel={() => setTravelOpen(true)}
      />

      <ExpenseNotice notice={notice} onDismiss={() => setNotice(null)} />

      {canApproveExpense || canApproveTravel ? (
        <RejectReasonModal
          isOpen={actions.rejectTarget !== null}
          title={
            actions.rejectTarget?.kind === 'travel'
              ? 'Reject travel request'
              : 'Reject expense claim'
          }
          onClose={() => actions.setRejectTarget(null)}
          onConfirm={actions.rejectFromModal}
        />
      ) : null}

      {canApproveExpense ? (
        <ApproveExpenseModal
          busy={Boolean(actions.busyKey)}
          error={actions.approveError}
          target={actions.approveTarget}
          onCancel={() => {
            if (actions.busyKey) return;
            actions.setApproveError(null);
            actions.setApproveTarget(null);
          }}
          onChange={actions.setApproveTarget}
          onConfirm={() => void actions.approveExpense()}
        />
      ) : null}

      {canMarkPayment ? (
        <PaymentReferenceModal
          busy={Boolean(actions.busyKey)}
          target={paymentTarget}
          onCancel={() => {
            if (actions.busyKey) return;
            setPaymentTarget(null);
          }}
          onConfirm={(paymentReference) => {
            if (!paymentTarget) return;
            void actions.markExpensePaid(paymentTarget.id, paymentReference).then((saved) => {
              if (saved) setPaymentTarget(null);
            });
          }}
        />
      ) : null}

      {canSubmitTravel ? (
        <SubmitTravelModal
          isOpen={travelOpen}
          onClose={() => setTravelOpen(false)}
          onSubmitted={() => void refresh()}
        />
      ) : null}

      {canSubmitExpense ? (
        <SubmitExpenseModal
          categories={categories}
          isOpen={submitOpen}
          loading={loading}
          submissionHints={submissionHints}
          submitting={actions.submittingExpense}
          travelRequests={travelRequests}
          onCategoryChange={loadSubmissionHints}
          onClose={() => setSubmitOpen(false)}
          onSubmit={actions.submitExpense}
        />
      ) : null}

      {canAccessExpenses ? <ExpenseCategoryGrid categories={categories} loading={loading} /> : null}

      {canAccessExpenses ? (
        <ExpenseClaimsTable
          busyKey={actions.busyKey}
          canApprove={canApproveExpense}
          canMarkPayment={canMarkPayment}
          categories={categories}
          employeeLabels={employeeLabels}
          expenses={expenses}
          loading={loading}
          travelRequestLabels={travelRequestLabels}
          onApprove={actions.openApproveExpense}
          onMarkPaid={setPaymentTarget}
          onReject={(row) => {
            if (!row.pendingApprovalStepId) {
              setNotice({
                variant: 'warning',
                message: 'Refresh the expense board before rejecting this claim.',
              });
              return;
            }
            actions.setRejectTarget({
              kind: 'expense',
              id: row.id,
              expectedWorkflowStepId: row.pendingApprovalStepId,
            });
          }}
        />
      ) : null}

      {canAccessTravel ? (
        <TravelRequestsTable
          busyKey={actions.busyKey}
          canApprove={canApproveTravel}
          employeeLabels={employeeLabels}
          loading={loading}
          rows={travelRequests}
          onApprove={(row) => void actions.approveTravel(row)}
          onReject={(row) => {
            if (!row.pendingApprovalStepId) {
              setNotice({
                variant: 'warning',
                message: 'Refresh the travel requests before rejecting this request.',
              });
              return;
            }
            actions.setRejectTarget({
              kind: 'travel',
              id: row.id,
              expectedWorkflowStepId: row.pendingApprovalStepId,
            });
          }}
        />
      ) : null}
    </div>
  );
};

export default ExpensesPage;
