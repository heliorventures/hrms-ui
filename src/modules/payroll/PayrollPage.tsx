import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';

interface SalaryComponentRow {
  id: string;
  name: string;
  code: string;
  componentType: string;
  isTaxable: boolean;
  isFixed: boolean;
  isActive: boolean;
}

interface PayrollCycleRow {
  id: string;
  name: string;
  month: number;
  year: number;
  status: string;
  paymentDate?: string | null;
}

interface PayrollBoardData {
  salaryComponents: SalaryComponentRow[];
  payrollCycles: PayrollCycleRow[];
}

const PAYROLL_BOARD = gql`
  query PayrollBoard($limit: Int! = 20) {
    salaryComponents(limit: $limit) {
      id
      name
      code
      componentType
      isTaxable
      isFixed
      isActive
    }
    payrollCycles(limit: $limit) {
      id
      name
      month
      year
      status
      paymentDate
    }
  }
`;

const PayrollPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<PayrollBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<PayrollBoardData>(PAYROLL_BOARD, {
          limit: 20,
        });
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load payroll data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Live salary components and payroll cycles from the payroll subgraph.
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Salary Components">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading salary components…</p>
        ) : data?.salaryComponents?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.salaryComponents.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
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

      <Card title="Payroll Cycles">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading payroll cycles…</p>
        ) : data?.payrollCycles?.length ? (
          <Table
            data={data.payrollCycles}
            keyExtractor={(row) => row.id}
            columns={[
              { key: 'name', label: 'Cycle', render: (row: PayrollCycleRow) => row.name },
              {
                key: 'month',
                label: 'Period',
                render: (row: PayrollCycleRow) =>
                  new Date(row.year, row.month - 1, 1).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  }),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: PayrollCycleRow) => <Badge variant="info">{row.status}</Badge>,
              },
              {
                key: 'paymentDate',
                label: 'Payment date',
                render: (row: PayrollCycleRow) =>
                  row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-IN') : '—',
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No payroll cycles found.</p>
        )}
      </Card>
    </div>
  );
};

export default PayrollPage;
