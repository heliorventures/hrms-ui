import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import PayslipDocument, { type PayslipDocModel } from './components/PayslipDocument';
import PayrollMigrationHint from './components/PayrollMigrationHint';
import {
  PayrollShellDocument,
  PayrollSalaryComponentsDocument,
  ClientOpsPayslipsForPayrollHubDocument,
} from '../../api/graphql/graphql';

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

interface PayslipRow extends PayslipDocModel {
  payrollCycleId: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

function isMissingDbRelation(msg: string) {
  return /does not exist|relation "([^"]+)"|relation '([^']+)'/i.test(msg);
}

/* eslint-disable max-lines-per-function -- Pay hub: data hooks for salary / payslip / tax */
const PayrollPayPage = () => {
  const client = useGraphClient('client');
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabId>('salary');
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycleRow[] | null>(null);
  const [taxConfigurations, setTaxConfigurations] = useState<TaxConfigurationRow[] | null>(null);
  const [taxSlabs, setTaxSlabs] = useState<TaxSlabRow[] | null>(null);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponentRow[] | null>(null);
  const [payslips, setPayslips] = useState<PayslipRow[] | null>(null);
  const [payslipError, setPayslipError] = useState<string | null>(null);
  const [loadingShell, setLoadingShell] = useState(true);
  const [loadingSalary, setLoadingSalary] = useState(true);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [errorShell, setErrorShell] = useState<string | null>(null);
  const [errorSalary, setErrorSalary] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoadingShell(true);
        setErrorShell(null);
        const r = await client.request<{
          payrollCycles: PayrollCycleRow[];
          taxConfigurations: TaxConfigurationRow[];
          taxSlabs: TaxSlabRow[];
        }>(PayrollShellDocument);
        if (!c) {
          setPayrollCycles(r.payrollCycles);
          setTaxConfigurations(r.taxConfigurations);
          setTaxSlabs(r.taxSlabs);
        }
      } catch (e) {
        if (!c) setErrorShell(e instanceof Error ? e.message : 'Failed to load payroll metadata');
      } finally {
        if (!c) setLoadingShell(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoadingSalary(true);
        setErrorSalary(null);
        const r = await client.request<{ salaryComponents: SalaryComponentRow[] }>(
          PayrollSalaryComponentsDocument
        );
        if (!c) setSalaryComponents(r.salaryComponents);
      } catch (e) {
        if (!c) setErrorSalary(e instanceof Error ? e.message : 'Failed to load salary components');
      } finally {
        if (!c) setLoadingSalary(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client]);

  useEffect(() => {
    if (activeTab !== 'payslip') return;
    let c = false;
    void (async () => {
      try {
        setPayslipsLoading(true);
        setPayslipError(null);
        const res = await client.request<{ payslips: PayslipRow[] }>(
          ClientOpsPayslipsForPayrollHubDocument,
          { limit: 24 }
        );
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

  const cycleById = useMemo(() => {
    const m = new Map<string, PayrollCycleRow>();
    (payrollCycles ?? []).forEach((c) => m.set(c.id, c));
    return m;
  }, [payrollCycles]);

  const payslipPeriodOptions = useMemo(() => {
    if (!payslips?.length) return [];
    const seen = new Set<string>();
    const out: { cycleId: string; label: string; payslip: PayslipRow; sort: number }[] = [];
    for (const p of payslips) {
      if (seen.has(p.payrollCycleId)) continue;
      const c = cycleById.get(p.payrollCycleId);
      seen.add(p.payrollCycleId);
      const label = c
        ? new Date(c.year, c.month - 1, 1).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          })
        : p.payrollCycleId.slice(0, 8);
      const sort = c ? c.year * 100 + c.month : 0;
      out.push({ cycleId: p.payrollCycleId, label, payslip: p, sort });
    }
    out.sort((a, b) => b.sort - a.sort);
    return out;
  }, [payslips, cycleById]);

  useEffect(() => {
    if (payslipPeriodOptions.length && !selectedCycleId) {
      setSelectedCycleId(payslipPeriodOptions[0].cycleId);
    }
  }, [payslipPeriodOptions, selectedCycleId]);

  const activePayslip = useMemo(() => {
    if (!selectedCycleId) return null;
    return payslipPeriodOptions.find((o) => o.cycleId === selectedCycleId)?.payslip ?? null;
  }, [payslipPeriodOptions, selectedCycleId]);

  const compNameById = useMemo(() => {
    const m = new Map<string, string>();
    (salaryComponents ?? []).forEach((s) => m.set(s.id, s.name));
    return m;
  }, [salaryComponents]);

  const labelForLine = (line: { salaryComponentId: string; componentType?: string | null }) =>
    compNameById.get(line.salaryComponentId) ??
    line.componentType ??
    `Component ${line.salaryComponentId.slice(0, 8)}…`;

  const activeTaxConfig = useMemo(
    () => taxConfigurations?.find((x) => x.isActive) ?? null,
    [taxConfigurations]
  );
  const activeTaxSlabs = useMemo(
    () =>
      activeTaxConfig
        ? (taxSlabs ?? []).filter((slab) => slab.taxConfigVersionId === activeTaxConfig.id)
        : [],
    [activeTaxConfig, taxSlabs]
  );

  const showMigrationHint =
    (errorShell && isMissingDbRelation(errorShell)) ||
    (errorSalary && isMissingDbRelation(errorSalary));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay</h1>

      {showMigrationHint && <PayrollMigrationHint />}

      {errorShell && !showMigrationHint && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{errorShell}</p>
        </Card>
      )}
      {errorSalary && !showMigrationHint && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{errorSalary}</p>
        </Card>
      )}

      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
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
            {loadingSalary ? (
              <p className="text-sm text-slate-500">Loading salary components…</p>
            ) : errorSalary ? (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Could not load this section.
              </p>
            ) : salaryComponents?.length ? (
              <Table
                data={salaryComponents}
                keyExtractor={(row) => row.id}
                columns={[
                  { key: 'name', label: 'Component' },
                  { key: 'code', label: 'Code' },
                  { key: 'componentType', label: 'Type' },
                  {
                    key: 'flags',
                    label: 'Flags',
                    render: (row: SalaryComponentRow) => (
                      <div className="flex flex-wrap gap-2">
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
              <p className="text-sm text-slate-500">No salary components found.</p>
            )}
          </Card>

          <Card title="Payroll Cycles">
            {loadingShell ? (
              <p className="text-sm text-slate-500">Loading payroll cycles…</p>
            ) : payrollCycles?.length ? (
              <Table
                data={payrollCycles}
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
                    label: 'Payment date',
                    render: (row: PayrollCycleRow) =>
                      row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-IN') : '—',
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-slate-500">No payroll cycles found.</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'payslip' && (
        <div className="space-y-4">
          {payslipsLoading && <p className="text-sm text-slate-500">Loading payslips…</p>}

          {payslipError && !payslipsLoading && isMissingDbRelation(payslipError) && (
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">{payslipError}</p>
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
                Run tenant migrations (same as for Salary tab) so{' '}
                <span className="font-mono">payslip</span> exists.
              </p>
            </Card>
          )}

          {payslipError && !payslipsLoading && !isMissingDbRelation(payslipError) && (
            <p className="text-sm text-amber-800 dark:text-amber-200">{payslipError}</p>
          )}

          {!payslipsLoading && !payslipError && payslips && payslips.length > 0 && (
            <>
              <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <label
                    className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    htmlFor="payslip-period"
                  >
                    Pay period
                  </label>
                  <select
                    id="payslip-period"
                    className="max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    value={selectedCycleId ?? ''}
                    onChange={(e) => setSelectedCycleId(e.target.value || null)}
                  >
                    {payslipPeriodOptions.map((o) => (
                      <option key={o.cycleId} value={o.cycleId}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activePayslip && (
                <PayslipDocument
                  tenantName={currentTenant.name}
                  employeeName={user?.name ?? 'Employee'}
                  employeeCode={user?.employeeId ?? ''}
                  periodLabel={
                    cycleById.get(activePayslip.payrollCycleId)
                      ? new Date(
                          cycleById.get(activePayslip.payrollCycleId)!.year,
                          cycleById.get(activePayslip.payrollCycleId)!.month - 1,
                          1
                        ).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                      : '—'
                  }
                  labelForLine={labelForLine}
                  slip={activePayslip}
                />
              )}
            </>
          )}

          {!payslipsLoading && !payslipError && payslips && payslips.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500">No payslips for your account yet.</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'incometax' && (
        <div className="space-y-6">
          <Card title="Active tax configuration">
            {loadingShell ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : activeTaxConfig ? (
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={activeTaxConfig.isActive ? 'success' : 'neutral'}>
                  {activeTaxConfig.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="info">{activeTaxConfig.regime ?? 'N/A'}</Badge>
                <Badge variant="neutral">{activeTaxConfig.countryCode}</Badge>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  FY {activeTaxConfig.fiscalYear}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active tax configuration found.</p>
            )}
          </Card>

          <Card title="Tax slabs">
            {loadingShell ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : activeTaxSlabs.length ? (
              <Table
                data={activeTaxSlabs}
                keyExtractor={(row) => row.id}
                columns={[
                  {
                    key: 'incomeFrom',
                    label: 'Income from',
                    render: (row: TaxSlabRow) => formatCurrency(Number(row.incomeFrom)),
                  },
                  {
                    key: 'incomeTo',
                    label: 'Income to',
                    render: (row: TaxSlabRow) =>
                      row.incomeTo ? formatCurrency(Number(row.incomeTo)) : 'No upper limit',
                  },
                  {
                    key: 'taxRate',
                    label: 'Tax rate',
                    render: (row: TaxSlabRow) => (row.taxRate ? `${row.taxRate}%` : '—'),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-slate-500">No tax slabs found.</p>
            )}
          </Card>

          <Card title="Employee tax (coming soon)">
            <p className="text-sm text-slate-500">
              Declared deductions and estimated TDS from profile will connect here in a later
              release.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
/* eslint-enable max-lines-per-function */

export default PayrollPayPage;
