import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import { formatCurrency } from '../utils/formatters';
import type { ExpenseCategoryRow } from '../types';

interface ExpenseCategoryGridProps {
  categories: ExpenseCategoryRow[];
  loading: boolean;
}

const ExpenseCategoryGrid = ({ categories, loading }: ExpenseCategoryGridProps) => {
  return (
    <Card title="Expense Categories">
      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading Categories...</p>
      ) : categories.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
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
                {category.maxAmountPerClaim ? formatCurrency(category.maxAmountPerClaim) : 'No Limit'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No Expense Categories Found.</p>
      )}
    </Card>
  );
};

export default ExpenseCategoryGrid;
