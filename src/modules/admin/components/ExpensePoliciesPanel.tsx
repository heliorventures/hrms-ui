import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import type { ExpenseCategoryRow, ExpensePolicyRow } from '../expenseCategoryTypes';
import { formatMaybeAmount, selectFieldClass } from '../expenseCategoryUtils';

interface ExpensePoliciesPanelProps {
  categories: ExpenseCategoryRow[];
  selectedCategoryId: string;
  rows: ExpensePolicyRow[];
  loading: boolean;
  policyError: string | null;
  directoryLoading: boolean;
  onCategoryChange: (categoryId: string) => void;
  onAddPolicy: () => void;
  onEditPolicy: (policy: ExpensePolicyRow) => void;
  onDeletePolicy: (policy: ExpensePolicyRow) => void;
  summarizeScope: (policy: ExpensePolicyRow) => string;
}

const ExpensePoliciesPanel = ({
  categories,
  selectedCategoryId,
  rows,
  loading,
  policyError,
  directoryLoading,
  onCategoryChange,
  onAddPolicy,
  onEditPolicy,
  onDeletePolicy,
  summarizeScope,
}: ExpensePoliciesPanelProps) => (
  <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
        Expense policies by category
      </h3>
      {categories.length ? (
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1 !text-xs"
          onClick={onAddPolicy}
        >
          Add policy
        </Button>
      ) : null}
    </div>
    {!categories.length ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Create a category first.</p>
    ) : (
      <>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={`max-w-md ${selectFieldClass}`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.code})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Policies apply the most specific match: department, designation, role, then all employees.
          </p>
        </div>
        {directoryLoading ? (
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Loading organization directory. Names in the grid update when ready.
          </p>
        ) : null}
        {policyError ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{policyError}</p> : null}
        <Table
          data={rows}
          keyExtractor={(policy) => policy.id}
          loading={loading}
          loadingMessage="Loading policies..."
          emptyMessage="No policies for this category. Category-level max only applies."
          columns={[
            {
              key: 'applicable',
              label: 'Applicable',
              render: (policy) => (
                <div>
                  <div className="font-mono text-xs font-medium">{policy.applicableTo}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {summarizeScope(policy)}
                  </div>
                </div>
              ),
            },
            {
              key: 'caps',
              label: 'Limits',
              render: (policy) => (
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  <div>Day: {formatMaybeAmount(policy.limitPerDay)}</div>
                  <div>Month: {formatMaybeAmount(policy.limitPerMonth)}</div>
                  <div>Policy max / claim: {formatMaybeAmount(policy.maxAmountPerClaim)}</div>
                </div>
              ),
            },
            {
              key: 'flags',
              label: 'Rules',
              render: (policy) => (
                <div className="text-xs">
                  Receipt: {policy.receiptRequired ? 'yes' : 'no'} - Approval:{' '}
                  {policy.approvalRequired ? 'yes' : 'no'}
                </div>
              ),
            },
            {
              key: 'actions',
              label: '',
              render: (policy) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-2 !py-1 !text-xs"
                    onClick={() => onEditPolicy(policy)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-2 !py-1 !text-xs"
                    onClick={() => onDeletePolicy(policy)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </>
    )}
  </>
);

export default ExpensePoliciesPanel;
