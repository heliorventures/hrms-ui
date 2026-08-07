import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { EXPENSE_BUSY_PREFIX, EXPENSE_STATUS } from '../constants';
import { expenseStatusVariant, formatCurrency, formatDate, shortId } from '../utils/formatters';
import type { ExpenseCategoryRow, ExpenseRow } from '../types';

interface ExpenseClaimsTableProps {
  busyKey: string | null;
  canApprove: boolean;
  canMarkPayment: boolean;
  categories: ExpenseCategoryRow[];
  expenses: ExpenseRow[];
  loading: boolean;
  onApprove: (row: ExpenseRow) => void;
  onMarkPaid: (expenseId: string) => void;
  onReject: (expenseId: string) => void;
}

function categoryName(categories: ExpenseCategoryRow[], categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? categoryId;
}

function canShowPaidAction(row: ExpenseRow, canMarkPayment: boolean): boolean {
  const status = row.status.toUpperCase();
  const paymentStatus = (row.paymentStatus ?? '').toUpperCase();
  return (
    canMarkPayment &&
    paymentStatus !== EXPENSE_STATUS.paid &&
    (status === EXPENSE_STATUS.approved || status === EXPENSE_STATUS.partialApproved)
  );
}

const ExpenseClaimsTable = ({
  busyKey,
  canApprove,
  canMarkPayment,
  categories,
  expenses,
  loading,
  onApprove,
  onMarkPaid,
  onReject,
}: ExpenseClaimsTableProps) => {
  return (
    <Card title="Expense Claims">
      <Table
        data={expenses}
        loading={loading}
        emptyMessage="No expense claims found."
        keyExtractor={(expense) => expense.id}
        columns={[
          {
            key: 'expenseCategoryId',
            label: 'Category',
            render: (expense) => <span>{categoryName(categories, expense.expenseCategoryId)}</span>,
          },
          {
            key: 'title',
            label: 'Title',
            render: (expense) => <span className="max-w-xs truncate">{expense.title}</span>,
          },
          {
            key: 'travelRequestId',
            label: 'Trip',
            render: (expense) => (
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {shortId(expense.travelRequestId)}
              </span>
            ),
          },
          {
            key: 'amount',
            label: 'Amount',
            render: (expense) => formatCurrency(expense.amount, expense.currency),
          },
          {
            key: 'approvedAmount',
            label: 'Approved',
            render: (expense) =>
              expense.approvedAmount ? formatCurrency(expense.approvedAmount, expense.currency) : '-',
          },
          {
            key: 'paymentStatus',
            label: 'Payment',
            render: (expense) => expense.paymentStatus ?? '-',
          },
          {
            key: 'status',
            label: 'Status',
            render: (expense) => (
              <div className="flex flex-col gap-1">
                <Badge variant={expenseStatusVariant(expense.status)}>{expense.status}</Badge>
                {expense.pendingApprovalStage ? (
                  <span className="max-w-[12rem] text-xs text-sky-800 dark:text-sky-200">
                    Awaiting: {expense.pendingApprovalStage}
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            key: 'submittedAt',
            label: 'Submitted',
            render: (expense) => formatDate(expense.submittedAt),
          },
          ...(canApprove || canMarkPayment
            ? [
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (expense: ExpenseRow) => {
                    const pending = expense.status.toUpperCase() === EXPENSE_STATUS.pending;
                    const showPaid = canShowPaidAction(expense, canMarkPayment);
                    if (!pending && !showPaid) return <span className="text-gray-400">-</span>;
                    if (pending && !expense.viewerMayApprove) {
                      return (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Awaiting another approver
                        </span>
                      );
                    }
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        {pending && canApprove ? (
                          <>
                            <Button
                              variant="secondary"
                              className="!px-2 !py-1 !text-xs"
                              disabled={busyKey === `${EXPENSE_BUSY_PREFIX.expense}:${expense.id}`}
                              onClick={() => onApprove(expense)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="!px-2 !py-1 !text-xs"
                              disabled={busyKey === `${EXPENSE_BUSY_PREFIX.expense}:${expense.id}`}
                              onClick={() => onReject(expense.id)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {showPaid ? (
                          <Button
                            variant="secondary"
                            className="!px-2 !py-1 !text-xs"
                            disabled={busyKey === `${EXPENSE_BUSY_PREFIX.payment}:${expense.id}`}
                            onClick={() => onMarkPaid(expense.id)}
                          >
                            Mark paid
                          </Button>
                        ) : null}
                      </div>
                    );
                  },
                },
              ]
            : []),
        ]}
      />
    </Card>
  );
};

export default ExpenseClaimsTable;
