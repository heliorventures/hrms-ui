import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import type { SalaryComponentRow } from '../payrollTypes';

interface PayrollSalaryComponentsCardProps {
  rows: SalaryComponentRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PayrollSalaryComponentsCard = ({
  rows,
  loading,
  error,
  onRetry,
}: PayrollSalaryComponentsCardProps) => (
  <Card title="Salary Components">
    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
      Once a component is used, its code, type and tax treatment are protected. Create a new
      component for future financial changes. Company payslip visibility remains editable.
    </p>
    {loading && (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading Salary Components...</p>
    )}
    {!loading && error && (
      <div role="alert" className="space-y-2 text-sm text-content-secondary">
        <p>{error}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry salary components
        </Button>
      </div>
    )}
    {!loading && !error && rows.length > 0 && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {item.code}
                </p>
              </div>
              <Badge variant={item.isActive ? 'success' : 'neutral'}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant="info">{item.componentType}</Badge>
              <Badge variant={item.isTaxable ? 'warning' : 'neutral'}>
                {item.isTaxable ? 'Taxable' : 'Non-taxable'}
              </Badge>
              <Badge variant={item.isFixed ? 'success' : 'neutral'}>
                {item.isFixed ? 'Fixed' : 'Variable'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    )}
    {!loading && !error && rows.length === 0 && (
      <p className="text-sm text-gray-500 dark:text-gray-400">No Salary Components Found.</p>
    )}
  </Card>
);

export default PayrollSalaryComponentsCard;
