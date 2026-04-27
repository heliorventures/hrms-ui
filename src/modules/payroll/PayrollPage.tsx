import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  PayrollBoardDocument,
  IndiaTdsMonthlySummaryCsvDocument,
  IndiaPfEsiMonthlySummaryCsvDocument,
  RunPayrollForCycleDocument,
  CreatePayrollCycleDocument,
  PayrollBankTransferCsvDocument,
  CreatePayrollArrearDocument,
  PayrollArrearsListDocument,
} from '../../api/graphql/graphql';

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

interface PayrollArrearRow {
  id: string;
  employeeId: string;
  amount: string;
  reason?: string | null;
  status: string;
  createdAt: string;
}

interface PayrollBoardData {
  salaryComponents: SalaryComponentRow[];
  payrollCycles: PayrollCycleRow[];
  /** Present when the payroll subgraph (or schema extension) exposes `payrollArrears`. */
  payrollArrears?: PayrollArrearRow[];
}

const PayrollPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<PayrollBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tdsMonth, setTdsMonth] = useState(() => new Date().getMonth() + 1);
  const [tdsYear, setTdsYear] = useState(() => new Date().getFullYear());
  const [tdsExporting, setTdsExporting] = useState(false);
  const [tdsExportError, setTdsExportError] = useState<string | null>(null);
  const [pfEsiExporting, setPfEsiExporting] = useState(false);
  const [pfEsiExportError, setPfEsiExportError] = useState<string | null>(null);
  const [bankExporting, setBankExporting] = useState(false);
  const [bankExportError, setBankExportError] = useState<string | null>(null);
  const [runBusy, setRunBusy] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runOk, setRunOk] = useState<string | null>(null);
  const [newCycleName, setNewCycleName] = useState(() => {
    const d = new Date();
    return `${d.toLocaleString('en-IN', { month: 'long' })} ${d.getFullYear()} payroll`;
  });
  const [newCycleMonth, setNewCycleMonth] = useState(() => new Date().getMonth() + 1);
  const [newCycleYear, setNewCycleYear] = useState(() => new Date().getFullYear());
  const [newCyclePayDate, setNewCyclePayDate] = useState('');
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOk, setCreateOk] = useState<string | null>(null);
  const [arrearEmployeeId, setArrearEmployeeId] = useState('');
  const [arrearAmount, setArrearAmount] = useState('');
  const [arrearReason, setArrearReason] = useState('');
  const [arrearBusy, setArrearBusy] = useState(false);
  const [arrearError, setArrearError] = useState<string | null>(null);
  const [arrearOk, setArrearOk] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.request<PayrollBoardData>(PayrollBoardDocument, {
        limit: 20,
      });
      let merged: PayrollBoardData = result;
      try {
        const ar = await client.request<{
          payrollArrears: PayrollArrearRow[];
        }>(PayrollArrearsListDocument, { limit: 100 });
        merged = { ...result, payrollArrears: ar.payrollArrears };
      } catch {
        merged = { ...result, payrollArrears: [] };
      }
      setData(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const createCycle = useCallback(async () => {
    setCreateBusy(true);
    setCreateError(null);
    setCreateOk(null);
    try {
      await client.request(CreatePayrollCycleDocument, {
        input: {
          name: newCycleName.trim(),
          month: newCycleMonth,
          year: newCycleYear,
          ...(newCyclePayDate ? { paymentDate: newCyclePayDate } : {}),
        },
      });
      setCreateOk(
        `Draft cycle created for ${new Date(newCycleYear, newCycleMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`
      );
      await loadData();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Could not create cycle');
    } finally {
      setCreateBusy(false);
    }
  }, [client, loadData, newCycleMonth, newCycleName, newCyclePayDate, newCycleYear]);

  const createArrear = useCallback(async () => {
    setArrearBusy(true);
    setArrearError(null);
    setArrearOk(null);
    try {
      await client.request(CreatePayrollArrearDocument, {
        input: {
          employeeId: arrearEmployeeId.trim(),
          amount: arrearAmount.trim(),
          reason: arrearReason.trim() || null,
        },
      });
      setArrearOk('PENDING arrear saved — it will be paid in the next run with an ARREAR line.');
      setArrearAmount('');
      setArrearReason('');
      await loadData();
    } catch (e) {
      setArrearError(e instanceof Error ? e.message : 'Could not create arrear');
    } finally {
      setArrearBusy(false);
    }
  }, [arrearAmount, arrearEmployeeId, arrearReason, client, loadData]);

  const runPayroll = useCallback(
    async (payrollCycleId: string) => {
      setRunBusy(payrollCycleId);
      setRunError(null);
      setRunOk(null);
      try {
        await client.request(RunPayrollForCycleDocument, { payrollCycleId });
        setRunOk('Pay run completed — cycle is PROCESSED (v1 engine: employment history + BASIC line).');
        await loadData();
      } catch (e) {
        setRunError(e instanceof Error ? e.message : 'Pay run failed');
      } finally {
        setRunBusy(null);
      }
    },
    [client, loadData]
  );

  useEffect(() => {
    const c = data?.payrollCycles?.[0];
    if (!c) return;
    setTdsMonth(c.month);
    setTdsYear(c.year);
  }, [data?.payrollCycles]);

  const downloadIndiaPfEsiCsv = async () => {
    try {
      setPfEsiExporting(true);
      setPfEsiExportError(null);
      const res = await client.request<{ indiaPfEsiMonthlySummaryCsv: string }>(
        IndiaPfEsiMonthlySummaryCsvDocument,
        {
          month: tdsMonth,
          year: tdsYear,
        }
      );
      const blob = new Blob([res.indiaPfEsiMonthlySummaryCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-pf-esi-summary-${tdsYear}-${String(tdsMonth).padStart(2, '0')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setPfEsiExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setPfEsiExporting(false);
    }
  };

  const downloadIndiaTdsCsv = async () => {
    try {
      setTdsExporting(true);
      setTdsExportError(null);
      const res = await client.request<{ indiaTdsMonthlySummaryCsv: string }>(
        IndiaTdsMonthlySummaryCsvDocument,
        {
          month: tdsMonth,
          year: tdsYear,
        }
      );
      const blob = new Blob([res.indiaTdsMonthlySummaryCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-tds-summary-${tdsYear}-${String(tdsMonth).padStart(2, '0')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setTdsExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setTdsExporting(false);
    }
  };

  const downloadPayrollBankTransferCsv = async () => {
    try {
      setBankExporting(true);
      setBankExportError(null);
      const res = await client.request<{ payrollBankTransferCsv: string }>(
        PayrollBankTransferCsvDocument,
        {
          month: tdsMonth,
          year: tdsYear,
        }
      );
      const blob = new Blob([res.payrollBankTransferCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-bank-transfer-${tdsYear}-${String(tdsMonth).padStart(2, '0')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setBankExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setBankExporting(false);
    }
  };

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

      <Card title="PENDING payroll arrears (back-pay)">
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          One-off accruals (salary catch-up) are paid in the next <strong>Run pay</strong> as a
          separate <span className="font-mono">ARREAR</span> line. The tenant must have an active
          EARNING component with code <span className="font-mono">ARREAR</span>. India statutory
          (EPF/ESI/PT/TDS) is computed on <strong>base + arrear</strong> in the run.
        </p>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading arrears…</p>
        ) : (data?.payrollArrears?.length ?? 0) > 0 ? (
          <ul className="mb-4 divide-y divide-gray-200 dark:divide-gray-600">
            {(data?.payrollArrears ?? []).map((a) => (
              <li key={a.id} className="py-2 text-sm">
                <span className="font-mono text-xs text-gray-500">{a.employeeId}</span> —{' '}
                <span className="font-medium">₹{a.amount}</span> — {a.status}
                {a.reason ? <span className="text-gray-500"> — {a.reason}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">No PENDING arrear accruals.</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="min-w-[14rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Employee id (UUID)</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={arrearEmployeeId}
              onChange={(ev) => setArrearEmployeeId(ev.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </label>
          <label className="w-32 flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Amount (₹)</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={arrearAmount}
              onChange={(ev) => setArrearAmount(ev.target.value)}
              placeholder="5000.00"
            />
          </label>
          <label className="min-w-[12rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Reason (optional)</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={arrearReason}
              onChange={(ev) => setArrearReason(ev.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={arrearBusy}
            onClick={() => void createArrear()}
          >
            {arrearBusy ? 'Saving…' : 'Add PENDING arrear'}
          </Button>
        </div>
        {arrearError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{arrearError}</p>}
        {arrearOk && !arrearError && (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">{arrearOk}</p>
        )}
      </Card>

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
        <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New cycle</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Opens a <span className="font-mono">DRAFT</span> row for one calendar month. You cannot
            add a second cycle for the same month and year.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[12rem] flex-col gap-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Name</span>
              <input
                type="text"
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={newCycleName}
                onChange={(ev) => setNewCycleName(ev.target.value)}
                placeholder="e.g. April 2026 payroll"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Month</span>
              <select
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={newCycleMonth}
                onChange={(ev) => setNewCycleMonth(Number(ev.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('en-IN', { month: 'long' })}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Year</span>
              <input
                type="number"
                min={2000}
                max={2200}
                className="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={newCycleYear}
                onChange={(ev) => setNewCycleYear(Number(ev.target.value) || newCycleYear)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Payment date (optional)</span>
              <input
                type="date"
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={newCyclePayDate}
                onChange={(ev) => setNewCyclePayDate(ev.target.value)}
              />
            </label>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={createBusy}
              onClick={() => void createCycle()}
            >
              {createBusy ? 'Creating…' : 'Create draft cycle'}
            </Button>
          </div>
          {createError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>
          )}
          {createOk && !createError && (
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">{createOk}</p>
          )}
        </div>
        {runError && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{runError}</p>
        )}
        {runOk && !runError && (
          <p className="mb-3 text-sm text-green-700 dark:text-green-400">{runOk}</p>
        )}
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          <strong>Run pay</strong> creates missing payslips from the latest{' '}
          <span className="font-mono">employment_history.salary</span> (BASIC), optional{' '}
          <span className="font-mono">PENDING</span> <strong>arrear</strong> (ARREAR line), then India
          statutory <strong>stub</strong> (12% EPF on capped wage, ESI if gross ≤ 21k, fixed PT &gt; 10k,
          TDS from <span className="font-mono">tax_computation.tdsPerMonth</span> for the India FY of
          the pay month), then <span className="font-mono">PROCESSED</span>. HR / statutory-export role.
        </p>
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
              {
                key: 'actions',
                label: 'Run',
                render: (row: PayrollCycleRow) =>
                  row.status.toUpperCase() === 'DRAFT' ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={runBusy === row.id}
                      onClick={() => void runPayroll(row.id)}
                    >
                      {runBusy === row.id ? 'Running…' : 'Run pay (v1)'}
                    </Button>
                  ) : (
                    '—'
                  ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No payroll cycles found.</p>
        )}
      </Card>

      <Card title="India — monthly TDS summary (CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Stub export for statutory prep: one row per payslip in the selected payroll cycle, using
          stored <span className="font-medium">tdsAmount</span> and primary PAN when present.
          Requires <span className="font-mono text-xs">payroll:statutory_export</span> or an HR /
          tenant admin role.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Month</span>
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={tdsMonth}
              onChange={(ev) => setTdsMonth(Number(ev.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString('en-IN', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Year</span>
            <input
              type="number"
              min={2000}
              max={2200}
              className="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={tdsYear}
              onChange={(ev) => setTdsYear(Number(ev.target.value) || tdsYear)}
            />
          </label>
          <button
            type="button"
            onClick={() => void downloadIndiaTdsCsv()}
            disabled={tdsExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {tdsExporting ? 'Downloading…' : 'Download CSV'}
          </button>
        </div>
        {tdsExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{tdsExportError}</p>
        )}
      </Card>

      <Card title="India — PF / ESI summary (CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Second statutory stub (M12): employee + UAN / ESIC identifiers and PF/ESI amounts from each
          payslip in the selected cycle. Same permission gate as the TDS export. Not an ECR or
          challan file.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <button
            type="button"
            onClick={() => void downloadIndiaPfEsiCsv()}
            disabled={pfEsiExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {pfEsiExporting ? 'Downloading…' : 'Download PF/ESI CSV'}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Uses month/year above with the TDS section.
          </span>
        </div>
        {pfEsiExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{pfEsiExportError}</p>
        )}
      </Card>

      <Card title="Payroll — bank transfer list (CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          One row per payslip in the selected cycle: <span className="font-medium">net salary</span>{' '}
          as the amount and the employee’s <span className="font-medium">primary bank account</span>{' '}
          when one exists. Rows without a primary account include{' '}
          <span className="font-mono text-xs">MISSING_BANK</span> in{' '}
          <span className="font-mono text-xs">bank_status</span>. Generic CSV for ops — not a
          specific bank’s upload template. Same permission gate as the statutory exports; uses
          month/year in the TDS section above.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <button
            type="button"
            onClick={() => void downloadPayrollBankTransferCsv()}
            disabled={bankExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {bankExporting ? 'Downloading…' : 'Download bank transfer CSV'}
          </button>
        </div>
        {bankExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{bankExportError}</p>
        )}
      </Card>
    </div>
  );
};

export default PayrollPage;
