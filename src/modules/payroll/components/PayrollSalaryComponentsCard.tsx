import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import type { SalaryComponentRow } from '../payrollTypes';

interface PayrollSalaryComponentsCardProps {
  rows: SalaryComponentRow[];
  loading: boolean;
}

const PayrollSalaryComponentsCard = ({ rows, loading }: PayrollSalaryComponentsCardProps) => (
  <Card title="Salary Components">
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading salary components…</p>
    ) : rows.length ? (
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
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">No salary components found.</p>
    )}
  </Card>
);

export default PayrollSalaryComponentsCard;
