import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import PayslipDocument, { type PayslipDocModel } from './components/PayslipDocument';
import PayrollMigrationHint from './components/PayrollMigrationHint';
import { PayslipLogoSignedReadUrlDocument } from './documents';
import {
  PayrollShellDocument,
  PayrollSalaryComponentsDocument,
  ClientOpsPayslipsForPayrollHubDocument,
  PayrollComplianceSettingDocument,
  TaxComputationsListDocument,
  TaxProofLinesDocument,
  TaxSectionDefinitionsDocument,
  UpsertTaxComputationDocument,
  SubmitTaxProofLineDocument,
} from '../../api/graphql/graphql';
import { indiaFyAnchorYear } from './utils/indiaFy';
import type {
  PayrollComplianceSettingQuery,
  TaxComputationsListQuery,
  TaxProofLinesQuery,
  TaxSectionDefinitionsQuery,
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

type TaxComputationSelfRow = TaxComputationsListQuery['taxComputations'][number];

type TaxProofLineSelfRow = TaxProofLinesQuery['taxProofLines'][number];

type TaxSectionCatalogRow = TaxSectionDefinitionsQuery['taxSectionDefinitions'][number];

interface PayslipRow extends PayslipDocModel {
  payrollCycleId: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

function formatAmtString(s?: string | null) {
  if (s == null || s === '') return '—';
  const n = Number(s);
  return Number.isFinite(n) ? formatCurrency(n) : s;
}

function isMissingDbRelation(msg: string) {
  return /does not exist|relation "([^"]+)"|relation '([^']+)'/i.test(msg);
}

function isMissingPayrollCoreTable(msg: string) {
  if (!isMissingDbRelation(msg)) return false;
  return /salary_component|payslip|payroll_cycle|payslip_component|payroll_compliance_setting/i.test(
    msg
  );
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
  const [payslipBranding, setPayslipBranding] =
    useState<PayrollComplianceSettingQuery['payrollComplianceSetting']>(null);
  const [payslipLogoReadUrl, setPayslipLogoReadUrl] = useState<string | null>(null);

  const [taxComputationsSelf, setTaxComputationsSelf] = useState<TaxComputationSelfRow[] | null>(null);
  const [taxProofLinesSelf, setTaxProofLinesSelf] = useState<TaxProofLineSelfRow[] | null>(null);
  const [loadingEmployeeTax, setLoadingEmployeeTax] = useState(false);
  const [employeeTaxError, setEmployeeTaxError] = useState<string | null>(null);
  const [declFy, setDeclFy] = useState(() => String(new Date().getFullYear()));
  const [declRegime, setDeclRegime] = useState('');
  const [declGross, setDeclGross] = useState('');
  const [declDed, setDeclDed] = useState('');
  const [declSubmitting, setDeclSubmitting] = useState(false);
  const [declMsg, setDeclMsg] = useState<string | null>(null);
  /** Active HR catalogue for deduction section codes (`tax_section_definition`). */
  const [taxSectionCatalog, setTaxSectionCatalog] = useState<TaxSectionCatalogRow[] | null>(null);
  const [proofSectionCode, setProofSectionCode] = useState('');
  const [proofDeclared, setProofDeclared] = useState('');
  const [proofActual, setProofActual] = useState('');
  const [proofBusy, setProofBusy] = useState(false);
  const [proofMsg, setProofMsg] = useState<string | null>(null);

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
    if (activeTab !== 'payslip' && activeTab !== 'incometax') return;
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

  useEffect(() => {
    if (activeTab !== 'payslip') return;
    let cancelled = false;
    void (async () => {
      try {
        const q = await client.request<PayrollComplianceSettingQuery>(PayrollComplianceSettingDocument);
        if (!cancelled) setPayslipBranding(q.payrollComplianceSetting ?? null);
      } catch {
        if (!cancelled) setPayslipBranding(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, activeTab]);

  useEffect(() => {
    const id = payslipBranding?.payslipLogoFileStorageId?.trim();
    if (!id || activeTab !== 'payslip') {
      setPayslipLogoReadUrl(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const r = await client.request<{ payslipLogoSignedReadUrl: string }>(
          PayslipLogoSignedReadUrlDocument,
          { fileStorageId: id }
        );
        if (!cancelled) setPayslipLogoReadUrl(r.payslipLogoSignedReadUrl);
      } catch {
        if (!cancelled) setPayslipLogoReadUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, activeTab, payslipBranding?.payslipLogoFileStorageId]);

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

  /** Gross + withheld TDS from processed payslips whose cycle falls in active tax FY (India anchor). */
  const payslipIndiaFyTotals = useMemo(() => {
    const cfg = activeTaxConfig;
    if (!cfg?.fiscalYear) return null;
    const fyAnchor = cfg.fiscalYear;
    let gross = 0;
    let tds = 0;
    let slipCount = 0;
    for (const slip of payslips ?? []) {
      const c = cycleById.get(slip.payrollCycleId);
      if (!c) continue;
      if (indiaFyAnchorYear(c.month, c.year) !== fyAnchor) continue;
      const g = Number(slip.grossSalary);
      const tRaw = slip.tdsAmount != null ? Number(slip.tdsAmount) : 0;
      gross += Number.isFinite(g) ? g : 0;
      tds += Number.isFinite(tRaw) ? tRaw : 0;
      slipCount += 1;
    }
    return { fyAnchor, gross, tds, slipCount };
  }, [activeTaxConfig, payslips, cycleById]);

  useEffect(() => {
    if (!activeTaxConfig) return;
    setDeclFy(String(activeTaxConfig.fiscalYear));
    setDeclRegime(activeTaxConfig.regime?.trim() ? activeTaxConfig.regime!.trim() : '');
  }, [activeTaxConfig?.fiscalYear, activeTaxConfig?.id, activeTaxConfig?.regime]);

  useEffect(() => {
    if ((taxSectionCatalog?.length ?? 0) === 0 || proofSectionCode) return;
    setProofSectionCode(taxSectionCatalog![0].sectionCode);
  }, [taxSectionCatalog, proofSectionCode]);

  useEffect(() => {
    if (activeTab !== 'incometax') return;
    let cancelled = false;
    void (async () => {
      try {
        setLoadingEmployeeTax(true);
        setEmployeeTaxError(null);
        const fy = activeTaxConfig?.fiscalYear ?? null;
        const [compsRes, proofsRes, catRes] = await Promise.all([
          client.request<TaxComputationsListQuery>(TaxComputationsListDocument, { limit: 20 }),
          client.request<TaxProofLinesQuery>(TaxProofLinesDocument, {
            employeeId: null,
            taxConfigVersionId: activeTaxConfig?.id ?? null,
            fiscalYear: fy,
          }),
          client.request<TaxSectionDefinitionsQuery>(TaxSectionDefinitionsDocument, {
            activeOnly: true,
            limit: 120,
          }),
        ]);
        if (!cancelled) {
          setTaxComputationsSelf(compsRes.taxComputations);
          setTaxProofLinesSelf(proofsRes.taxProofLines);
          setTaxSectionCatalog(catRes.taxSectionDefinitions);
        }
      } catch (e) {
        if (!cancelled) {
          setEmployeeTaxError(
            e instanceof Error ? e.message : 'Could not load your tax declarations or proofs'
          );
          setTaxComputationsSelf([]);
          setTaxProofLinesSelf([]);
          setTaxSectionCatalog([]);
        }
      } finally {
        if (!cancelled) setLoadingEmployeeTax(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, activeTab, activeTaxConfig?.fiscalYear, activeTaxConfig?.id]);

  const handleDeclUpsert = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setDeclMsg(null);
      const cfgId = activeTaxConfig?.id;
      if (!cfgId) {
        setDeclMsg('No active tax configuration. Ask HR to set up tax slabs for your tenant.');
        return;
      }
      const fy = Number(declFy.trim());
      if (!Number.isFinite(fy)) {
        setDeclMsg('Enter a valid fiscal year (India FY anchor year, e.g. 2025).');
        return;
      }
      setDeclSubmitting(true);
      try {
        await client.request(UpsertTaxComputationDocument, {
          input: {
            taxConfigVersionId: cfgId,
            fiscalYear: fy,
            taxRegimeChosen: declRegime.trim() || null,
            grossIncome: declGross.trim() || null,
            totalDeductions: declDed.trim() || null,
            taxableIncome: null,
            finalTax: null,
            tdsPerMonth: null,
          },
        });
        setDeclMsg('Saved your estimated declaration.');
        const compsRes = await client.request<TaxComputationsListQuery>(
          TaxComputationsListDocument,
          { limit: 20 }
        );
        setTaxComputationsSelf(compsRes.taxComputations);
        const proofsRes = await client.request<TaxProofLinesQuery>(TaxProofLinesDocument, {
          employeeId: null,
          taxConfigVersionId: cfgId,
          fiscalYear: fy,
        });
        setTaxProofLinesSelf(proofsRes.taxProofLines);
      } catch (err) {
        setDeclMsg(err instanceof Error ? err.message : 'Could not save declaration.');
      } finally {
        setDeclSubmitting(false);
      }
    },
    [activeTaxConfig?.id, client, declDed, declFy, declGross, declRegime]
  );

  const handleProofSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setProofMsg(null);
      const cfgId = activeTaxConfig?.id;
      if (!cfgId) {
        setProofMsg('No active tax configuration. Ask HR to configure tax slabs.');
        return;
      }
      const fy = Number(declFy.trim());
      if (!Number.isFinite(fy)) {
        setProofMsg('Set a valid FY on the Estimated declaration section (above).');
        return;
      }
      const code = proofSectionCode.trim().toUpperCase();
      if (!code) {
        setProofMsg('Choose or enter a deduction section.');
        return;
      }
      setProofBusy(true);
      try {
        await client.request(SubmitTaxProofLineDocument, {
          input: {
            taxConfigVersionId: cfgId,
            fiscalYear: fy,
            sectionCode: code,
            declaredAmount: proofDeclared.trim() || '0',
            actualAmount: proofActual.trim() || proofDeclared.trim() || '0',
            fileStorageId: null,
          },
        });
        setProofMsg('Proof line submitted — status PENDING until HR approves.');
        setProofDeclared('');
        setProofActual('');
        const proofsRes = await client.request<TaxProofLinesQuery>(TaxProofLinesDocument, {
          employeeId: null,
          taxConfigVersionId: cfgId,
          fiscalYear: fy,
        });
        setTaxProofLinesSelf(proofsRes.taxProofLines);
      } catch (err) {
        setProofMsg(err instanceof Error ? err.message : 'Could not submit proof.');
      } finally {
        setProofBusy(false);
      }
    },
    [
      activeTaxConfig?.id,
      client,
      declFy,
      proofDeclared,
      proofActual,
      proofSectionCode,
    ]
  );

  function proofBadgeVariant(s: string) {
    switch (s) {
      case 'APPROVED':
        return 'success' as const;
      case 'REJECTED':
        return 'warning' as const;
      default:
        return 'neutral' as const;
    }
  }

  const showMigrationHint =
    (errorShell && isMissingPayrollCoreTable(errorShell)) ||
    (errorSalary && isMissingPayrollCoreTable(errorSalary));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay</h1>

      {showMigrationHint && <PayrollMigrationHint tenantId={currentTenant?.id} />}

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

          {payslipError && !payslipsLoading && isMissingPayrollCoreTable(payslipError) && (
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">{payslipError}</p>
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
                Run tenant migrations (same as for Salary tab) so{' '}
                <span className="font-mono">payslip</span> exists.
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                Active tenant: <span className="font-mono">{currentTenant?.id}</span>
              </p>
            </Card>
          )}

          {payslipError && !payslipsLoading && !isMissingPayrollCoreTable(payslipError) && (
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
                  companyHeaderName={payslipBranding?.payslipHeaderTitle}
                  payslipLogoReadUrl={payslipLogoReadUrl}
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

          {payslipIndiaFyTotals && activeTaxConfig && (
            <Card title={`Payslip summary (India FY ${payslipIndiaFyTotals.fyAnchor}–${payslipIndiaFyTotals.fyAnchor + 1})`}>
              {payslipsLoading ? (
                <p className="text-sm text-slate-500">Loading payslip data…</p>
              ) : payslipError ? (
                <p className="text-sm text-amber-800 dark:text-amber-200">{payslipError}</p>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Gross (payslips in FY)
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(payslipIndiaFyTotals.gross)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        TDS withheld (payslips)
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(payslipIndiaFyTotals.tds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Payslip periods
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {payslipIndiaFyTotals.slipCount}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Rolled up from stored payslips for cycles in this FY anchor (April–March). Not a
                    statutory certificate; use for planning next to your declaration above.
                  </p>
                </>
              )}
            </Card>
          )}

          {employeeTaxError && (
            <Card>
              <p className="text-sm text-red-600 dark:text-red-400">{employeeTaxError}</p>
            </Card>
          )}

          <Card title="Your tax declaration">
            {loadingEmployeeTax && !employeeTaxError ? (
              <p className="text-sm text-slate-500">Loading your declaration…</p>
            ) : taxComputationsSelf?.length ? (
              <Table
                data={taxComputationsSelf}
                keyExtractor={(row) => row.id}
                columns={[
                  {
                    key: 'fy',
                    label: 'FY',
                    render: (row: TaxComputationSelfRow) => `FY ${row.fiscalYear}`,
                  },
                  {
                    key: 'taxRegimeChosen',
                    label: 'Regime',
                    render: (row: TaxComputationSelfRow) => row.taxRegimeChosen ?? '—',
                  },
                  {
                    key: 'grossIncome',
                    label: 'Gross declared',
                    render: (row: TaxComputationSelfRow) => formatAmtString(row.grossIncome),
                  },
                  {
                    key: 'totalDeductions',
                    label: 'Deductions',
                    render: (row: TaxComputationSelfRow) => formatAmtString(row.totalDeductions),
                  },
                  {
                    key: 'finalTax',
                    label: 'Estimated tax',
                    render: (row: TaxComputationSelfRow) => formatAmtString(row.finalTax),
                  },
                  {
                    key: 'tdsPerMonth',
                    label: 'TDS / month',
                    render: (row: TaxComputationSelfRow) => formatAmtString(row.tdsPerMonth),
                  },
                  {
                    key: 'computedAt',
                    label: 'Updated',
                    render: (row: TaxComputationSelfRow) =>
                      new Date(row.computedAt).toLocaleDateString('en-IN'),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-slate-500">
                No declaration yet — use the form below once HR has activated a tax regime.
              </p>
            )}
          </Card>

          <Card title="Proof submissions (FY)">
            {loadingEmployeeTax && !employeeTaxError ? (
              <p className="text-sm text-slate-500">Loading proofs…</p>
            ) : taxProofLinesSelf?.length ? (
              <Table
                data={taxProofLinesSelf}
                keyExtractor={(row) => row.id}
                columns={[
                  { key: 'sectionCode', label: 'Section' },
                  {
                    key: 'declaredAmount',
                    label: 'Declared',
                    render: (row: TaxProofLineSelfRow) => formatAmtString(row.declaredAmount),
                  },
                  {
                    key: 'actualAmount',
                    label: 'Actual (proof)',
                    render: (row: TaxProofLineSelfRow) => formatAmtString(row.actualAmount),
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row: TaxProofLineSelfRow) => (
                      <Badge variant={proofBadgeVariant(row.status)}>{row.status}</Badge>
                    ),
                  },
                  {
                    key: 'fiscalYear',
                    label: 'FY',
                    render: (row: TaxProofLineSelfRow) => String(row.fiscalYear),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-slate-500">
                No proofs for this FY yet — use Submit deduction proof below (if HR activated sections).
              </p>
            )}
          </Card>

          <Card title="Submit deduction proof">
            {!activeTaxConfig ? (
              <p className="text-sm text-slate-500">Tax configuration missing — HR must enable Manage Tax.</p>
            ) : loadingEmployeeTax ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <form className="max-w-xl space-y-4" onSubmit={handleProofSubmit}>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Record declared vs claimed amounts under an IT deduction section (
                  <span className="font-mono">80C</span>, <span className="font-mono">24</span>, etc.).
                  {(taxSectionCatalog?.length ?? 0) > 0
                    ? ' Pick from your tenant catalogue; HR may cap amounts.'
                    : ' No HR catalogue yet — enter a section code freely (validation applies when catalogue exists).'}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(taxSectionCatalog?.length ?? 0) > 0 ? (
                    <div>
                      <label
                        htmlFor="proof-section"
                        className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                      >
                        Section
                      </label>
                      <select
                        id="proof-section"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        value={proofSectionCode}
                        onChange={(e) => setProofSectionCode(e.target.value)}
                      >
                        {taxSectionCatalog!.map((row) => (
                          <option key={row.id} value={row.sectionCode}>
                            {row.sectionCode} · {row.sectionLabel}
                            {row.maxDeductionAmount != null ? ` (cap ₹${row.maxDeductionAmount})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="proof-section-free"
                        className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                      >
                        Section code
                      </label>
                      <Input
                        id="proof-section-free"
                        placeholder="80C"
                        value={proofSectionCode}
                        onChange={(e) => setProofSectionCode(e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="proof-declared"
                      className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Declared (₹)
                    </label>
                    <Input
                      id="proof-declared"
                      inputMode="decimal"
                      placeholder="150000"
                      value={proofDeclared}
                      onChange={(e) => setProofDeclared(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="proof-actual"
                      className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Actual / invested (₹)
                    </label>
                    <Input
                      id="proof-actual"
                      inputMode="decimal"
                      placeholder="Same as declared if proof pending"
                      value={proofActual}
                      onChange={(e) => setProofActual(e.target.value)}
                    />
                  </div>
                </div>
                {proofMsg && (
                  <p
                    className={`text-sm ${
                      proofMsg.startsWith('Proof line submitted')
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {proofMsg}
                  </p>
                )}
                <Button type="submit" disabled={proofBusy}>
                  {proofBusy ? 'Submitting…' : 'Submit proof line'}
                </Button>
              </form>
            )}
          </Card>

          <Card title="Estimated declaration">
            {!activeTaxConfig ? (
              <p className="text-sm text-slate-500">
                Activate a tax configuration (HR → Manage Tax) before saving declarations.
              </p>
            ) : (
              <form className="max-w-xl space-y-4" onSubmit={handleDeclUpsert}>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Save a rough gross and deduction estimate for the selected FY — HR can reconcile with slabs
                  and proof approvals separately.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="decl-fy"
                      className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Fiscal year (India anchor year)
                    </label>
                    <Input
                      id="decl-fy"
                      inputMode="numeric"
                      value={declFy}
                      onChange={(e) => setDeclFy(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="decl-regime"
                      className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Regime (optional)
                    </label>
                    <Input
                      id="decl-regime"
                      placeholder="NEW_REGIME / OLD_REGIME"
                      value={declRegime}
                      onChange={(e) => setDeclRegime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="decl-gross"
                      className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Gross income (estimated)
                    </label>
                    <Input
                      id="decl-gross"
                      inputMode="decimal"
                      placeholder="850000"
                      value={declGross}
                      onChange={(e) => setDeclGross(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="decl-ded"
                      className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Total deductions (estimated)
                    </label>
                    <Input
                      id="decl-ded"
                      inputMode="decimal"
                      placeholder="175000"
                      value={declDed}
                      onChange={(e) => setDeclDed(e.target.value)}
                    />
                  </div>
                </div>
                {declMsg && (
                  <p
                    className={`text-sm ${
                      declMsg.startsWith('Saved') ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {declMsg}
                  </p>
                )}
                <Button type="submit" disabled={declSubmitting || loadingEmployeeTax}>
                  {declSubmitting ? 'Saving…' : 'Save declaration'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
/* eslint-enable max-lines-per-function */

export default PayrollPayPage;
