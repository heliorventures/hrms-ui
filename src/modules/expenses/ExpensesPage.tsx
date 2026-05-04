import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import { hasBroadDataScopeForResource } from '../../auth/approvalScope';
import { useAuth } from '../../contexts/AuthContext';
import { canApproveExpenseFromAccessToken, canMarkExpensePaymentFromAccessToken } from '../../auth/clientJwt';
import { getClientAccessToken } from '../../auth/tokenStore';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import SubmitTravelModal from './components/SubmitTravelModal';
import RejectReasonModal from './components/RejectReasonModal';
import {
  ApproveExpenseDocument,
  ApproveTravelRequestDocument,
  ExpenseBoardDocument,
  ExpenseSubmissionHintsDocument,
  MarkExpensePaymentStatusDocument,
  RejectExpenseDocument,
  RejectTravelRequestDocument,
  SubmitExpenseDocument,
  type ApproveExpenseMutation,
  type ApproveTravelRequestMutation,
  type ExpenseSubmissionHintsQuery,
  type MarkExpensePaymentStatusMutation,
} from '../../api/graphql/graphql';

interface ExpenseCategoryRow {
  id: string;
  name: string;
  code: string;
  maxAmountPerClaim?: string | null;
}

interface ExpenseRow {
  id: string;
  employeeId: string;
  expenseCategoryId: string;
  travelRequestId?: string | null;
  /** Present when tenant has an **EXPENSE** workflow (**M32**). */
  workflowInstanceId?: string | null;
  amount: string;
  currency: string;
  expenseDate: string;
  title: string;
  status: string;
  /** Workflow step name while PENDING and multi-step approval is in progress. */
  pendingApprovalStage?: string | null;
  /** False when PENDING but this user is not the current step approver (e.g. waiting on HR). */
  viewerMayApprove: boolean;
  submittedAt: string;
  approvedAmount?: string | null;
  paymentStatus?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
  receiptFileStorageId?: string | null;
}

interface TravelRequestRow {
  id: string;
  employeeId: string;
  originLocation?: string | null;
  destinationLocation?: string | null;
  fromDate: string;
  toDate: string;
  purpose: string;
  estimatedAmount?: string | null;
  currency: string;
  status: string;
  pendingApprovalStage?: string | null;
  viewerMayApprove: boolean;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  submittedAt: string;
  workflowInstanceId?: string | null;
}

interface ExpenseBoardData {
  expenseCategories: ExpenseCategoryRow[];
  expenses: ExpenseRow[];
  travelRequests: TravelRequestRow[];
}

type PageNotice = {
  variant: 'error' | 'info' | 'success';
  message: string;
};

// eslint-disable-next-line max-lines-per-function -- single route module
const ExpensesPage = () => {
  const { isAuthenticated, user, clientSession, can } = useAuth();
  const client = useGraphClient('client');
  const [data, setData] = useState<ExpenseBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageNotice, setPageNotice] = useState<PageNotice | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [travelRequestId, setTravelRequestId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [travelOpen, setTravelOpen] = useState(false);
  const [approverBusy, setApproverBusy] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<
    null | { kind: 'expense'; id: string } | { kind: 'travel'; id: string }
  >(null);
  type SubmissionHints =
    ExpenseSubmissionHintsQuery['expenseSubmissionHints'];
  const [submissionHints, setSubmissionHints] = useState<SubmissionHints | null>(null);
  const [receiptFileStorageId, setReceiptFileStorageId] = useState('');
  const [approveTarget, setApproveTarget] = useState<
    null | { id: string; claimAmount: string; currency: string; draftApprove: string }
  >(null);
  const [approveModalError, setApproveModalError] = useState<string | null>(null);

  const token = getClientAccessToken();
  const canApprove =
    isAuthenticated &&
    (canApproveExpenseFromAccessToken(token ?? null) ||
      hasBroadDataScopeForResource(clientSession, 'expense'));

  const canMarkExpensePayment =
    isAuthenticated &&
    (canMarkExpensePaymentFromAccessToken(token ?? null) ||
      hasBroadDataScopeForResource(clientSession, 'expense'));

  const loadBoard = useCallback(async () => {
    return client.request<ExpenseBoardData>(ExpenseBoardDocument, { limit: 20 });
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setPageNotice(null);
        const result = await loadBoard();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setPageNotice({
            variant: 'error',
            message: graphQlUserMessage(e),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard, user?.id]);

  useEffect(() => {
    if (!submitOpen || !categoryId.trim()) {
      setSubmissionHints(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await client.request<ExpenseSubmissionHintsQuery>(ExpenseSubmissionHintsDocument, {
          expenseCategoryId: categoryId,
        });
        if (!cancelled) setSubmissionHints(r.expenseSubmissionHints);
      } catch {
        if (!cancelled) setSubmissionHints(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submitOpen, categoryId, client]);

  const openApproveExpenseModal = (row: ExpenseRow) => {
    setApproveModalError(null);
    setApproveTarget({
      id: row.id,
      claimAmount: row.amount,
      currency: row.currency,
      draftApprove: row.amount,
    });
  };

  const confirmApproveExpense = async () => {
    if (!approveTarget) return;
    setApproveModalError(null);
    setApproverBusy(`e:${approveTarget.id}`);
    try {
      const d = approveTarget.draftApprove.trim();
      const same = d === approveTarget.claimAmount.trim();
      const result = await client.request<ApproveExpenseMutation>(ApproveExpenseDocument, {
        expenseId: approveTarget.id,
        ...(same ? {} : { approvedAmount: d }),
      });
      const exp = result.approveExpense;
      setData(await loadBoard());
      setApproveTarget(null);

      const st = exp.status.toUpperCase();
      if (st === 'PENDING' && exp.workflowInstanceId) {
        setPageNotice({
          variant: 'info',
          message:
            'Your approval was saved. This claim still shows Pending because multi-step approval is in progress — another approver must complete the workflow before it becomes fully approved.',
        });
      } else if (st === 'PARTIAL_APPROVED') {
        setPageNotice({
          variant: 'success',
          message:
            'Partial approval recorded. The reimbursable amount is now the approved amount shown in the table.',
        });
      } else if (st === 'APPROVED') {
        setPageNotice({
          variant: 'success',
          message: 'Expense claim fully approved.',
        });
      }
    } catch (e) {
      setApproveModalError(graphQlUserMessage(e));
    } finally {
      setApproverBusy(null);
    }
  };

  const runMarkExpensePaid = async (expenseId: string) => {
    setApproverBusy(`pay:${expenseId}`);
    try {
      await client.request<MarkExpensePaymentStatusMutation>(MarkExpensePaymentStatusDocument, {
        expenseId,
        paymentStatus: 'PAID',
        paymentReference: undefined,
      });
      setData(await loadBoard());
      setPageNotice({ variant: 'success', message: 'Payment marked as paid.' });
    } catch (e) {
      setPageNotice({
        variant: 'error',
        message: graphQlUserMessage(e),
      });
    } finally {
      setApproverBusy(null);
    }
  };

  const runRejectFromModal = useCallback(
    async (reason: string | null) => {
      const target = rejectTarget;
      if (!target) return;
      const busyKey = target.kind === 'expense' ? `e:${target.id}` : `t:${target.id}`;
      setApproverBusy(busyKey);
      try {
        if (target.kind === 'expense') {
          await client.request(RejectExpenseDocument, {
            expenseId: target.id,
            reason,
          });
        } else {
          await client.request(RejectTravelRequestDocument, {
            travelRequestId: target.id,
            reason,
          });
        }
        setData(await loadBoard());
      } catch (e) {
        throw new Error(graphQlUserMessage(e));
      } finally {
        setApproverBusy(null);
      }
    },
    [rejectTarget, client, loadBoard]
  );

  const runApproveTravel = async (travelRequestId: string) => {
    setApproverBusy(`t:${travelRequestId}`);
    try {
      const result = await client.request<ApproveTravelRequestMutation>(ApproveTravelRequestDocument, {
        travelRequestId,
      });
      const t = result.approveTravelRequest;
      setData(await loadBoard());
      const st = t.status.toUpperCase();
      if (st === 'PENDING' && t.workflowInstanceId) {
        setPageNotice({
          variant: 'info',
          message:
            'Your approval was saved. This travel request still shows Pending until the next approver in the workflow completes their step.',
        });
      } else if (st === 'APPROVED') {
        setPageNotice({ variant: 'success', message: 'Travel request approved.' });
      }
    } catch (e) {
      setPageNotice({
        variant: 'error',
        message: graphQlUserMessage(e),
      });
    } finally {
      setApproverBusy(null);
    }
  };

  const handleSubmitExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || !title.trim() || !amount) {
      setFormError('Category, title, and amount are required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const tid = travelRequestId.trim();
      const rec = receiptFileStorageId.trim();
      await client.request(SubmitExpenseDocument, {
        input: {
          expenseCategoryId: categoryId,
          amount: amount.trim(),
          currency: currency.trim() || 'INR',
          expenseDate,
          title: title.trim(),
          ...(tid ? { travelRequestId: tid } : {}),
          ...(rec ? { receiptFileStorageId: rec } : {}),
        },
      });
      setData(await loadBoard());
      setSubmitOpen(false);
      setTitle('');
      setAmount('');
      setTravelRequestId('');
      setReceiptFileStorageId('');
      setSubmissionHints(null);
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getExpenseStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      case 'partial_approved':
        return 'info';
      case 'submitted':
        return 'warning';
      case 'reimbursed':
        return 'info';
      case 'draft':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const formatCurrency = (amount: string, currency = 'INR') => {
    const parsed = Number(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(parsed) ? parsed : 0);
  };

  const expenseColumns = [
    {
      key: 'expenseCategoryId',
      label: 'Category',
      render: (expense: ExpenseRow) => (
        <span className="capitalize">
          {data?.expenseCategories.find((c) => c.id === expense.expenseCategoryId)?.name ??
            expense.expenseCategoryId}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (expense: ExpenseRow) => <span className="max-w-xs truncate">{expense.title}</span>,
    },
    {
      key: 'travel',
      label: 'Trip',
      render: (expense: ExpenseRow) => (
        <span className="max-w-[8rem] truncate font-mono text-xs text-gray-500 dark:text-gray-400">
          {expense.travelRequestId ? `${expense.travelRequestId.slice(0, 8)}…` : '—'}
        </span>
      ),
    },
    {
      key: 'workflow',
      label: 'Approval',
      render: (expense: ExpenseRow) =>
        expense.workflowInstanceId ? (
          <span className="whitespace-nowrap font-mono text-xs text-teal-700 dark:text-teal-300">
            WF {expense.workflowInstanceId.slice(0, 8)}…
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (expense: ExpenseRow) => formatCurrency(expense.amount, expense.currency),
    },
    {
      key: 'approved',
      label: 'Approved',
      render: (expense: ExpenseRow) =>
        expense.approvedAmount ? (
          <span className="text-sm tabular-nums">
            {formatCurrency(expense.approvedAmount, expense.currency)}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (expense: ExpenseRow) => (
        <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
          {expense.paymentStatus ?? '—'}
        </span>
      ),
    },
    {
      key: 'expenseDate',
      label: 'Date',
      render: (expense: ExpenseRow) => new Date(expense.expenseDate).toLocaleDateString('en-IN'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (expense: ExpenseRow) => (
        <div className="flex flex-col gap-1">
          <Badge variant={getExpenseStatusVariant(expense.status)}>{expense.status}</Badge>
          {expense.pendingApprovalStage ? (
            <span
              className="max-w-[12rem] text-xs leading-snug text-sky-800 dark:text-sky-200"
              title={expense.pendingApprovalStage}
            >
              Awaiting: {expense.pendingApprovalStage}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (expense: ExpenseRow) => new Date(expense.submittedAt).toLocaleDateString('en-IN'),
    },
    ...(canApprove || canMarkExpensePayment
      ? [
          {
            key: 'approverActions',
            label: 'Actions',
            render: (expense: ExpenseRow) => {
              const st = expense.status.toUpperCase();
              const pending = st === 'PENDING';
              const financiallyDone = st === 'APPROVED' || st === 'PARTIAL_APPROVED';
              const pay = (expense.paymentStatus || 'NONE').toUpperCase();
              const showMarkPaid =
                financiallyDone && pay !== 'PAID' && canMarkExpensePayment;
              const mayAct = expense.viewerMayApprove === true;
              if (!pending && !showMarkPaid) {
                return <span className="text-gray-400">—</span>;
              }
              return (
                <div className="flex flex-wrap items-center gap-2">
                  {pending && canApprove && !mayAct ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Awaiting another approver
                    </span>
                  ) : null}
                  {pending && canApprove && mayAct ? (
                    <>
                      <Button
                        variant="secondary"
                        className="!py-1 !px-2 !text-xs"
                        disabled={approverBusy === `e:${expense.id}`}
                        onClick={() => openApproveExpenseModal(expense)}
                      >
                        Approve…
                      </Button>
                      <Button
                        variant="outline"
                        className="!py-1 !px-2 !text-xs"
                        disabled={approverBusy === `e:${expense.id}`}
                        onClick={() => setRejectTarget({ kind: 'expense', id: expense.id })}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {showMarkPaid ? (
                    <Button
                      variant="secondary"
                      className="!py-1 !px-2 !text-xs"
                      disabled={approverBusy === `pay:${expense.id}`}
                      onClick={() => void runMarkExpensePaid(expense.id)}
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses & Travel</h1>
        <div className="flex flex-wrap items-center gap-3">
          {can('expense:manage') ? (
            <Link to="/admin/expense-categories">
              <Button type="button" variant="outline">
                Configure categories
              </Button>
            </Link>
          ) : null}
          <Button onClick={() => setSubmitOpen(true)}>Submit expense</Button>
          <Button variant="secondary" onClick={() => setTravelOpen(true)}>
            Request travel
          </Button>
        </div>
      </div>

      {pageNotice ? (
        <div
          role={pageNotice.variant === 'error' ? 'alert' : 'status'}
          className={
            pageNotice.variant === 'error'
              ? 'flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100'
              : pageNotice.variant === 'success'
                ? 'flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/35 dark:text-amber-100'
          }
        >
          <p className="min-w-0 flex-1 leading-relaxed">{pageNotice.message}</p>
          <button
            type="button"
            className="shrink-0 rounded-md px-2 py-0.5 text-sm font-medium opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
            onClick={() => setPageNotice(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ) : null}

      {canApprove && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You may see approval actions if you have <code className="text-xs">expense:approve</code>,
          <strong> TEAM</strong> list scope for expenses/travel, or an elevated legacy token.
          Multi-step workflows normally require your <strong>reporting manager</strong> first, then
          a second line such as the <strong>accounting role</strong> ({' '}
          <span className="font-mono text-xs">TRAVEL_REQUEST</span> /
          <span className="font-mono text-xs"> EXPENSE</span> workflows) — out-of-order approvers
          are rejected server-side. After you approve, the row shows the <strong>next</strong> workflow
          stage; your Approve/Reject actions stay hidden until another request needs you.
        </p>
      )}

      <RejectReasonModal
        isOpen={rejectTarget !== null}
        title={rejectTarget?.kind === 'travel' ? 'Reject travel request' : 'Reject expense claim'}
        onClose={() => setRejectTarget(null)}
        onConfirm={runRejectFromModal}
      />

      <Modal
        isOpen={approveTarget !== null}
        onClose={() => {
          if (approverBusy) return;
          setApproveModalError(null);
          setApproveTarget(null);
        }}
        title="Approve expense claim"
      >
        {approveTarget ? (
          <div className="space-y-4">
            {approveModalError ? (
              <p
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                role="alert"
              >
                {approveModalError}
              </p>
            ) : null}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Claimed{' '}
              <strong>{formatCurrency(approveTarget.claimAmount, approveTarget.currency)}</strong>.
              Adjust the reimbursable amount on the final approval step only (partial approval sets
              status <span className="font-mono text-xs">PARTIAL_APPROVED</span>).
            </p>
            <Input
              label="Approve amount"
              value={approveTarget.draftApprove}
              onChange={(e) =>
                setApproveTarget((prev) =>
                  prev ? { ...prev, draftApprove: e.target.value } : prev
                )
              }
              fullWidth
              inputMode="decimal"
              required
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={!!approverBusy}
                onClick={() => void confirmApproveExpense()}
              >
                {approverBusy ? 'Submitting…' : 'Submit approval'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!!approverBusy}
                onClick={() => {
                  setApproveModalError(null);
                  setApproveTarget(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <SubmitTravelModal
        isOpen={travelOpen}
        onClose={() => setTravelOpen(false)}
        onSubmitted={() => {
          void (async () => {
            setData(await loadBoard());
          })();
        }}
      />

      <Modal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit expense claim">
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">Select…</option>
              {data?.expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          {submissionHints ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
              {submissionHints.maxAmountPerClaim ? (
                <p>
                  Max per claim:{' '}
                  <strong>{formatCurrency(submissionHints.maxAmountPerClaim, currency.trim() || 'INR')}</strong>
                </p>
              ) : null}
              {submissionHints.limitPerMonth ? (
                <p className={submissionHints.maxAmountPerClaim ? 'mt-1' : ''}>
                  Monthly limit (category):{' '}
                  <strong>{formatCurrency(submissionHints.limitPerMonth, currency.trim() || 'INR')}</strong>
                </p>
              ) : null}
              {submissionHints.limitPerDay ? (
                <p
                  className={
                    submissionHints.maxAmountPerClaim || submissionHints.limitPerMonth ? 'mt-1' : ''
                  }
                >
                  Daily limit (policy):{' '}
                  <strong>{formatCurrency(submissionHints.limitPerDay, currency.trim() || 'INR')}</strong>{' '}
                  <span className="font-normal text-gray-600 dark:text-gray-400">
                    (included in max per claim when lower)
                  </span>
                </p>
              ) : null}
              {submissionHints.receiptRequired ? (
                <p className="mt-1 font-medium text-amber-900 dark:text-amber-200">
                  A receipt attachment (file storage id) is required for this category.
                </p>
              ) : null}
            </div>
          ) : null}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              required
              inputMode="decimal"
            />
            <Input
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              fullWidth
            />
          </div>
          <Input
            type="date"
            label="Expense date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            fullWidth
            required
          />
          <Input
            label="Receipt file ID (optional)"
            value={receiptFileStorageId}
            onChange={(e) => setReceiptFileStorageId(e.target.value)}
            fullWidth
            placeholder="Uploaded file UUID when policy requires receipt"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Link to travel request (optional)
            </label>
            <select
              value={travelRequestId}
              onChange={(e) => setTravelRequestId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">— None —</option>
              {data?.travelRequests
                ?.filter((t) => (t.status || '').toUpperCase() !== 'REJECTED')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.destinationLocation ?? t.originLocation ?? 'Trip'} — {t.fromDate} (
                    {t.id.slice(0, 8)}…)
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be your own trip; the server checks employee match.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !data?.expenseCategories?.length}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Card title="Expense Categories">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
        ) : data?.expenseCategories?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.expenseCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {category.code}
                    </p>
                  </div>
                  <Badge variant="info">Policy</Badge>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Max per claim:{' '}
                  {category.maxAmountPerClaim
                    ? formatCurrency(category.maxAmountPerClaim)
                    : 'No limit'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No expense categories found.</p>
        )}
      </Card>

      <Card title="Expense Claims">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading expenses...</p>
        ) : data?.expenses?.length ? (
          <Table
            data={data.expenses}
            columns={expenseColumns}
            keyExtractor={(expense) => expense.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No expense claims found</p>
        )}
      </Card>

      <Card title="Travel requests">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading travel…</p>
        ) : data?.travelRequests?.length ? (
          <Table
            data={data.travelRequests}
            columns={[
              {
                key: 'purpose',
                label: 'Trip',
                render: (t: TravelRequestRow) => (
                  <span className="max-w-md truncate">
                    {[t.originLocation, t.destinationLocation].filter(Boolean).join(' → ') ||
                      t.purpose}
                  </span>
                ),
              },
              {
                key: 'dates',
                label: 'Dates',
                render: (t: TravelRequestRow) => (
                  <span>
                    {t.fromDate} – {t.toDate}
                  </span>
                ),
              },
              {
                key: 'estimate',
                label: 'Estimate',
                render: (t: TravelRequestRow) =>
                  t.estimatedAmount ? formatCurrency(t.estimatedAmount, t.currency) : '—',
              },
              {
                key: 'workflow',
                label: 'Approval',
                render: (t: TravelRequestRow) =>
                  t.workflowInstanceId ? (
                    <span className="whitespace-nowrap font-mono text-xs text-teal-700 dark:text-teal-300">
                      WF {t.workflowInstanceId.slice(0, 8)}…
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (t: TravelRequestRow) => (
                  <div className="flex flex-col gap-1">
                    <Badge variant={getExpenseStatusVariant(t.status)}>{t.status}</Badge>
                    {t.pendingApprovalStage ? (
                      <span
                        className="max-w-[12rem] text-xs leading-snug text-sky-800 dark:text-sky-200"
                        title={t.pendingApprovalStage}
                      >
                        Awaiting: {t.pendingApprovalStage}
                      </span>
                    ) : null}
                  </div>
                ),
              },
              {
                key: 'decision',
                label: 'Decision',
                render: (t: TravelRequestRow) => {
                  const st = t.status.toUpperCase();
                  if (st === 'APPROVED') {
                    return (
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Approver
                        {t.approvedBy ? (
                          <span className="ml-1 font-mono text-emerald-700 dark:text-emerald-400">
                            {t.approvedBy.slice(0, 8)}…
                          </span>
                        ) : (
                          ' —'
                        )}
                      </span>
                    );
                  }
                  if (st === 'REJECTED') {
                    return (
                      <div className="max-w-[14rem] space-y-1">
                        {t.rejectionReason ? (
                          <p className="text-xs text-red-700 dark:text-red-400">
                            {t.rejectionReason}
                          </p>
                        ) : null}
                        <p className="text-xs text-gray-500">
                          By
                          {t.rejectedBy ? (
                            <span className="ml-1 font-mono">{t.rejectedBy.slice(0, 8)}…</span>
                          ) : (
                            ' —'
                          )}
                        </p>
                      </div>
                    );
                  }
                  return <span className="text-gray-400">—</span>;
                },
              },
              {
                key: 'submittedAt',
                label: 'Submitted',
                render: (t: TravelRequestRow) =>
                  new Date(t.submittedAt).toLocaleDateString('en-IN'),
              },
              ...(canApprove
                ? [
                    {
                      key: 'travelApproverActions',
                      label: 'Actions',
                      render: (t: TravelRequestRow) => {
                        const pending = t.status.toUpperCase() === 'PENDING';
                        const mayAct = t.viewerMayApprove === true;
                        if (!pending) {
                          return <span className="text-gray-400">—</span>;
                        }
                        if (!mayAct) {
                          return (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Awaiting another approver
                            </span>
                          );
                        }
                        return (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              className="!py-1 !px-2 !text-xs"
                              disabled={approverBusy === `t:${t.id}`}
                              onClick={() => void runApproveTravel(t.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="!py-1 !px-2 !text-xs"
                              disabled={approverBusy === `t:${t.id}`}
                              onClick={() => setRejectTarget({ kind: 'travel', id: t.id })}
                            >
                              Reject
                            </Button>
                          </div>
                        );
                      },
                    },
                  ]
                : []),
            ]}
            keyExtractor={(t) => t.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No travel requests yet.</p>
        )}
      </Card>
    </div>
  );
};

export default ExpensesPage;
