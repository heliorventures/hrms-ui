import { useMemo, useState } from 'react';
import { createPermissionService } from '../../auth/permissionService';
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
  const { isAuthenticated, user, clientSession } = useAuth();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<ExpenseRow | null>(null);
  const { client, data, loadSubmissionHints, loading, notice, refresh, setNotice, submissionHints } =
    useExpensesBoard(user?.id);
  const permissions = useMemo(() => createPermissionService(clientSession), [clientSession]);
  const canApprove =
    isAuthenticated && permissions.canCapability('action.expense.approve');
  const canManageExpense = permissions.canCapability('action.expense.manage');
  const canMarkPayment =
    isAuthenticated && permissions.canCapability('action.expense.pay');

  const actions = useExpenseActions({
    client,
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

  return (
    <div className="space-y-6">
      <ExpensesHeader
        canManageExpense={canManageExpense}
        onOpenExpense={() => setSubmitOpen(true)}
        onOpenTravel={() => setTravelOpen(true)}
      />

      <ExpenseNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

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

      <SubmitTravelModal
        isOpen={travelOpen}
        onClose={() => setTravelOpen(false)}
        onSubmitted={() => void refresh()}
      />

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

      <ExpenseCategoryGrid
        categories={categories}
        loading={loading}
      />

      <ExpenseClaimsTable
        busyKey={actions.busyKey}
        canApprove={canApprove}
        canMarkPayment={canMarkPayment}
        categories={categories}
        employeeLabels={employeeLabels}
        expenses={expenses}
        loading={loading}
        travelRequestLabels={travelRequestLabels}
        onApprove={actions.openApproveExpense}
        onMarkPaid={setPaymentTarget}
        onReject={(expenseId) => actions.setRejectTarget({ kind: 'expense', id: expenseId })}
      />

      <TravelRequestsTable
        busyKey={actions.busyKey}
        canApprove={canApprove}
        employeeLabels={employeeLabels}
        loading={loading}
        rows={travelRequests}
        onApprove={(travelRequestId) => void actions.approveTravel(travelRequestId)}
        onReject={(travelRequestId) =>
          actions.setRejectTarget({ kind: 'travel', id: travelRequestId })
        }
      />
    </div>
  );
};

export default ExpensesPage;
