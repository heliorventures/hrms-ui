import { useState } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { mockExpenses, mockTravelRequests } from '../../mocks/expenses';
import { ExpenseClaim, TravelRequest, ExpenseStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SubmitExpenseModal from './components/SubmitExpenseModal';
import SubmitTravelModal from './components/SubmitTravelModal';

const ExpensesPage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);

  const { data: expenses, loading: expensesLoading } = useMockApi(
    () =>
      mockExpenses
        .filter(
          (e) => e.tenantId === currentTenant.id && e.userId === user?.id
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    { delay: 400 }
  );

  const { data: travelRequests, loading: travelLoading } = useMockApi(
    () =>
      mockTravelRequests
        .filter(
          (t) => t.tenantId === currentTenant.id && t.userId === user?.id
        )
        .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn)),
    { delay: 400 }
  );

  const getExpenseStatusVariant = (status: ExpenseStatus) => {
    switch (status) {
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

  const getTravelStatusVariant = (
    status: 'pending' | 'approved' | 'rejected' | 'completed'
  ) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const expenseColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (expense: ExpenseClaim) => (
        <span className="capitalize">{expense.type}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (expense: ExpenseClaim) => (
        <span className="max-w-xs truncate">{expense.description}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (expense: ExpenseClaim) => formatCurrency(expense.amount),
    },
    {
      key: 'date',
      label: 'Date',
      render: (expense: ExpenseClaim) =>
        new Date(expense.date).toLocaleDateString('en-IN'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (expense: ExpenseClaim) => (
        <Badge variant={getExpenseStatusVariant(expense.status)}>
          {expense.status}
        </Badge>
      ),
    },
  ];

  const travelColumns = [
    {
      key: 'fromLocation',
      label: 'From',
    },
    {
      key: 'toLocation',
      label: 'To',
    },
    {
      key: 'fromDate',
      label: 'Travel Date',
      render: (travel: TravelRequest) =>
        `${new Date(travel.fromDate).toLocaleDateString('en-IN')} - ${new Date(travel.toDate).toLocaleDateString('en-IN')}`,
    },
    {
      key: 'estimatedCost',
      label: 'Est. Cost',
      render: (travel: TravelRequest) => formatCurrency(travel.estimatedCost),
    },
    {
      key: 'status',
      label: 'Status',
      render: (travel: TravelRequest) => (
        <Badge variant={getTravelStatusVariant(travel.status)}>
          {travel.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expenses & Travel
        </h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowExpenseModal(true)}>
            Submit Expense
          </Button>
          <Button variant="secondary" onClick={() => setShowTravelModal(true)}>
            Request Travel
          </Button>
        </div>
      </div>

      <Card title="Expense Claims">
        {expensesLoading ? (
          <LoadingSpinner />
        ) : expenses && expenses.length > 0 ? (
          <Table
            data={expenses}
            columns={expenseColumns}
            keyExtractor={(expense) => expense.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No expense claims found
          </p>
        )}
      </Card>

      <Card title="Travel Requests">
        {travelLoading ? (
          <LoadingSpinner />
        ) : travelRequests && travelRequests.length > 0 ? (
          <Table
            data={travelRequests}
            columns={travelColumns}
            keyExtractor={(travel) => travel.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No travel requests found
          </p>
        )}
      </Card>

      <SubmitExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <SubmitTravelModal
        isOpen={showTravelModal}
        onClose={() => setShowTravelModal(false)}
      />
    </div>
  );
};

export default ExpensesPage;
