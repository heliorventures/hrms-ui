import { useEffect, useMemo, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';

type TabId = 'salary' | 'payslip' | 'incometax';

const tabs: { id: TabId; label: string }[] = [
  { id: 'salary', label: 'Salary' },
  { id: 'payslip', label: 'Payslip' },
  { id: 'incometax', label: 'Income Tax' },
];

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

interface TaxConfigurationRow {
  id: string;
  fiscalYear: number;
  regime?: string | null;
  countryCode: string;
  isActive: boolean;
}

interface TaxSlabRow {
  id: string;
  taxConfigVersionId: string;
  incomeFrom: string;
  incomeTo?: string | null;
  taxRate?: string | null;
}

interface PayrollPayData {
  salaryComponents: SalaryComponentRow[];
  payrollCycles: PayrollCycleRow[];
  taxConfigurations: TaxConfigurationRow[];
  taxSlabs: TaxSlabRow[];
}

interface PayslipLine {
  id: string;
  salaryComponentId: string;
  amount: string;
  componentType?: string | null;
}

interface PayslipRow {
  id: string;
  netSalary: string;
  grossSalary: string;
  totalDeductions: string;
  status: string;
  generatedAt: string;
  lines: PayslipLine[];
}

const PAYROLL_PAY_QUERY = gql`
  query PayrollPayData {
    salaryComponents(limit: 100) {
      id
      name
      code
      componentType
      isTaxable
      isFixed
      isActive
    }
    payrollCycles(limit: 100) {
      id
      name
      month
      year
      status
      paymentDate
    }
    taxConfigurations(limit: 100) {
      id
      fiscalYear
      regime
      countryCode
      isActive
    }
    taxSlabs(limit: 100) {
      id
      taxConfigVersionId
      incomeFrom
      incomeTo
      taxRate
    }
  }
`;

const PAYSLIPS_Q = gql`
  query PayslipsList($limit: Int! = 12) {
    payslips(limit: $limit) {
      id
      netSalary
      grossSalary
      totalDeductions
      status
      generatedAt
      lines {
        id
        salaryComponentId
        amount
        componentType
      }
    }
  }
`;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const PayrollPayPage = () => {
  const client = useGraphClient('client');
  const [activeTab, setActiveTab] = useState<TabId>('salary');
  const [data, setData] = useState<PayrollPayData | null>(null);
  const [payslips, setPayslips] = useState<PayslipRow[] | null>(null);
  const [payslipError, setPayslipError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<PayrollPayData>(PAYROLL_PAY_QUERY);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load pay data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    if (activeTab !== 'payslip') return;
    let c = false;
    (async () => {
      try {
        setPayslipsLoading(true);
        setPayslipError(null);
        const res = await client.request<{ payslips: PayslipRow[] }>(PAYSLIPS_Q, { limit: 12 });
        if (!c) setPayslips(res.payslips);
      } catch (e) {
        if (!c) {
          setPayslipError(
            e instanceof Error ? e.message : 'Payslips need an employee-linked session'
          );
        }
      } finally {
        if (!c) setPayslipsLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client, activeTab]);

  const activeTaxConfig = useMemo(
    () => data?.taxConfigurations.find((config) => config.isActive) ?? null,
    [data]
  );
  const activeTaxSlabs = useMemo(
    () =>
      activeTaxConfig
        ? (data?.taxSlabs ?? []).filter((slab) => slab.taxConfigVersionId === activeTaxConfig.id)
        : [],
    [activeTaxConfig, data]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay</h1>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'salary' && (
        <div className="space-y-6">
          <Card title="Salary Components">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading salary components...
              </p>
            ) : data?.salaryComponents?.length ? (
              <Table
                data={data.salaryComponents}
                keyExtractor={(row) => row.id}
                columns={[
                  { key: 'name', label: 'Component' },
                  { key: 'code', label: 'Code' },
                  { key: 'componentType', label: 'Type' },
                  {
                    key: 'flags',
                    label: 'Flags',
                    render: (row: SalaryComponentRow) => (
                      <div className="flex gap-2">
                        <Badge variant={row.isActive ? 'success' : 'neutral'}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={row.isFixed ? 'info' : 'neutral'}>
                          {row.isFixed ? 'Fixed' : 'Variable'}
                        </Badge>
                        <Badge variant={row.isTaxable ? 'warning' : 'neutral'}>
                          {row.isTaxable ? 'Taxable' : 'Non-taxable'}
                        </Badge>
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No salary components found.
              </p>
            )}
          </Card>

          <Card title="Payroll Cycles">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading payroll cycles...</p>
            ) : data?.payrollCycles?.length ? (
              <Table
                data={data.payrollCycles}
                keyExtractor={(row) => row.id}
                columns={[
                  { key: 'name', label: 'Cycle' },
                  {
                    key: 'period',
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
                    label: 'Payment Date',
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
      )}

      {activeTab === 'payslip' && (
        <Card title="Payslips">
          {payslipsLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading payslips…</p>
          )}
          {payslipError && !payslipsLoading && (
            <p className="text-sm text-amber-800 dark:text-amber-200">{payslipError}</p>
          )}
          {!payslipsLoading && !payslipError && payslips && payslips.length > 0 && (
            <div className="space-y-4">
              {payslips.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(p.generatedAt).toLocaleString('en-IN')}
                    </span>
                    <Badge variant="info">{p.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    Gross {formatCurrency(Number(p.grossSalary))} · Deductions{' '}
                    {formatCurrency(Number(p.totalDeductions))} · Net{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(Number(p.netSalary))}
                    </span>
                  </p>
                  {p.lines?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                      {p.lines.map((l) => (
                        <li key={l.id} className="flex justify-between gap-2">
                          <span>{l.componentType ?? l.salaryComponentId}</span>
                          <span>{formatCurrency(Number(l.amount))}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {!payslipsLoading && !payslipError && payslips && payslips.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No payslips found.</p>
          )}
        </Card>
      )}

      {activeTab === 'incometax' && (
        <div className="space-y-6">
          <Card title="Active Tax Configuration">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading tax configuration...
              </p>
            ) : activeTaxConfig ? (
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={activeTaxConfig.isActive ? 'success' : 'neutral'}>
                  {activeTaxConfig.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="info">{activeTaxConfig.regime ?? 'N/A'}</Badge>
                <Badge variant="neutral">{activeTaxConfig.countryCode}</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  FY {activeTaxConfig.fiscalYear}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No active tax configuration found.
              </p>
            )}
          </Card>

          <Card title="Tax Slabs">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax slabs...</p>
            ) : activeTaxSlabs.length ? (
              <Table
                data={activeTaxSlabs}
                keyExtractor={(row) => row.id}
                columns={[
                  {
                    key: 'incomeFrom',
                    label: 'Income From',
                    render: (row: TaxSlabRow) => formatCurrency(Number(row.incomeFrom)),
                  },
                  {
                    key: 'incomeTo',
                    label: 'Income To',
                    render: (row: TaxSlabRow) =>
                      row.incomeTo ? formatCurrency(Number(row.incomeTo)) : 'No upper limit',
                  },
                  {
                    key: 'taxRate',
                    label: 'Tax Rate',
                    render: (row: TaxSlabRow) => (row.taxRate ? `${row.taxRate}%` : '—'),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No tax slabs found.</p>
            )}
          </Card>

          <Card title="Pending Employee Tax View">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Employee-specific declared deductions, estimated TDS, and payslip-linked tax views are
              still blocked by missing backend mutations and employee payroll detail queries.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PayrollPayPage;
