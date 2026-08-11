import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import type { ExpenseCategoryRow } from '../expenseCategoryTypes';
import { formatMaybeAmount } from '../expenseCategoryUtils';

interface ExpenseCategoriesTableProps {
  rows: ExpenseCategoryRow[];
  loading: boolean;
  onEdit: (row: ExpenseCategoryRow) => void;
  onDelete: (row: ExpenseCategoryRow) => void;
}

const ExpenseCategoriesTable = ({ rows, loading, onEdit, onDelete }: ExpenseCategoriesTableProps) => (
  <Table
    data={rows}
    keyExtractor={(row) => row.id}
    loading={loading}
    loadingMessage="Loading Categories..."
    emptyMessage="No Expense Categories Yet."
    columns={[
      {
        key: 'name',
        label: 'Name',
        render: (row) => (
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{row.code}</div>
          </div>
        ),
      },
      {
        key: 'cap',
        label: 'Max / Claim',
        render: (row) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatMaybeAmount(row.maxAmountPerClaim)}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="!px-2 !py-1 !text-xs"
              onClick={() => onEdit(row)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="!px-2 !py-1 !text-xs"
              onClick={() => onDelete(row)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ]}
  />
);

export default ExpenseCategoriesTable;
