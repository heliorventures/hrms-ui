import { FormEvent, useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';

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
  amount: string;
  currency: string;
  expenseDate: string;
  title: string;
  status: string;
  submittedAt: string;
}

interface ExpenseBoardData {
  expenseCategories: ExpenseCategoryRow[];
  expenses: ExpenseRow[];
}

const EXPENSE_BOARD = gql`
  query ExpenseBoard($limit: Int! = 20) {
    expenseCategories(limit: $limit) {
      id
      name
      code
      maxAmountPerClaim
    }
    expenses(limit: $limit) {
      id
      employeeId
      expenseCategoryId
      amount
      currency
      expenseDate
      title
      status
      submittedAt
    }
  }
`;

const SUBMIT_EXPENSE = gql`
  mutation SubmitExpense($input: SubmitExpenseInput!) {
    submitExpense(input: $input) {
      id
      status
      amount
      title
    }
  }
`;

const ExpensesPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<ExpenseBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    return client.request<ExpenseBoardData>(EXPENSE_BOARD, { limit: 20 });
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadBoard();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load expense data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  const handleSubmitExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || !title.trim() || !amount) {
      setFormError('Category, title, and amount are required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await client.request(SUBMIT_EXPENSE, {
        input: {
          expenseCategoryId: categoryId,
          amount: amount.trim(),
          currency: currency.trim() || 'INR',
          expenseDate,
          title: title.trim(),
        },
      });
      setData(await loadBoard());
      setSubmitOpen(false);
      setTitle('');
      setAmount('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Submit failed');
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
      key: 'amount',
      label: 'Amount',
      render: (expense: ExpenseRow) => formatCurrency(expense.amount, expense.currency),
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
        <Badge variant={getExpenseStatusVariant(expense.status)}>{expense.status}</Badge>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (expense: ExpenseRow) => new Date(expense.submittedAt).toLocaleDateString('en-IN'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses & Travel</h1>
        <div className="flex gap-3">
          <Button onClick={() => setSubmitOpen(true)}>Submit expense</Button>
          <Button variant="secondary" disabled title="Travel requests are not exposed yet">
            Request travel
          </Button>
        </div>
      </div>

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

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

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

      <Card title="Travel Requests">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Travel request queries/mutations are not exposed by a backend subgraph yet, so this
          section remains pending while expenses are now live.
        </p>
      </Card>
    </div>
  );
};

export default ExpensesPage;
