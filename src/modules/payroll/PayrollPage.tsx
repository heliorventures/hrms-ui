import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  PayrollBoardDocument,
  IndiaTdsMonthlySummaryCsvDocument,
  IndiaPfEsiMonthlySummaryCsvDocument,
  IndiaForm24qSalaryPaymentMonthlyStubCsvDocument,
  IndiaEpfMonthlyEcrPrepStubCsvDocument,
  RunPayrollForCycleDocument,
  CreatePayrollCycleDocument,
  PayrollBankTransferCsvDocument,
  PayrollIndiaBulkNeftCreditCsvDocument,
  IndiaFyPayrollEmployeeTotalsCsvDocument,
  IndiaFyQuarterPayrollEmployeeTotalsCsvDocument,
  IndiaForm16PartBFyPrepStubCsvDocument,
  CreatePayrollArrearDocument,
  PayrollArrearsListDocument,
  PayrollComplianceSettingDocument,
  UpsertPayrollComplianceSettingDocument,
  type PayrollComplianceSettingQuery,
} from '../../api/graphql/graphql';
import { indiaFyStartYearFromDate } from './utils/indiaFy';

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
  const { isElevated } = useAuth();
  const isPayrollAdmin = isElevated;
  const [data, setData] = useState<PayrollBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tdsMonth, setTdsMonth] = useState(() => new Date().getMonth() + 1);
  const [tdsYear, setTdsYear] = useState(() => new Date().getFullYear());
  const [tdsExporting, setTdsExporting] = useState(false);
  const [tdsExportError, setTdsExportError] = useState<string | null>(null);
  const [pfEsiExporting, setPfEsiExporting] = useState(false);
  const [pfEsiExportError, setPfEsiExportError] = useState<string | null>(null);
  const [form24qExporting, setForm24qExporting] = useState(false);
  const [form24qExportError, setForm24qExportError] = useState<string | null>(null);
  const [epfEcrExporting, setEpfEcrExporting] = useState(false);
  const [epfEcrExportError, setEpfEcrExportError] = useState<string | null>(null);
  const [bankExporting, setBankExporting] = useState(false);
  const [bankExportError, setBankExportError] = useState<string | null>(null);
  const [neftExporting, setNeftExporting] = useState(false);
  const [neftExportError, setNeftExportError] = useState<string | null>(null);
  const [fyStartYear, setFyStartYear] = useState(() => indiaFyStartYearFromDate());
  const [fyQuarter, setFyQuarter] = useState(1);
  const [fyExporting, setFyExporting] = useState(false);
  const [fyExportError, setFyExportError] = useState<string | null>(null);
  const [fyQuarterExporting, setFyQuarterExporting] = useState(false);
  const [fyQuarterExportError, setFyQuarterExportError] = useState<string | null>(null);
  const [form16Exporting, setForm16Exporting] = useState(false);
  const [form16ExportError, setForm16ExportError] = useState<string | null>(null);
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
  const [employerTanInput, setEmployerTanInput] = useState('');
  const [employerLegalNameInput, setEmployerLegalNameInput] = useState('');
  const [baseComponentInput, setBaseComponentInput] = useState('BASIC');
  const [arrearComponentInput, setArrearComponentInput] = useState('ARREAR');
  const [payslipHeaderInput, setPayslipHeaderInput] = useState('');
  const [payslipLogoIdInput, setPayslipLogoIdInput] = useState('');
  const [complianceSaveBusy, setComplianceSaveBusy] = useState(false);
  const [complianceSaveError, setComplianceSaveError] = useState<string | null>(null);
  const [complianceSaveOk, setComplianceSaveOk] = useState<string | null>(null);

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
      try {
        const cs =
          await client.request<PayrollComplianceSettingQuery>(PayrollComplianceSettingDocument);
        const row = cs.payrollComplianceSetting;
        setEmployerTanInput(row?.employerTan?.trim() ?? '');
        setEmployerLegalNameInput(row?.employerLegalName?.trim() ?? '');
        setBaseComponentInput(row?.baseSalaryComponentCode?.trim() || 'BASIC');
        setArrearComponentInput(row?.arrearSalaryComponentCode?.trim() || 'ARREAR');
        setPayslipHeaderInput(row?.payslipHeaderTitle?.trim() ?? '');
        setPayslipLogoIdInput(row?.payslipLogoFileStorageId?.trim() ?? '');
      } catch {
        setEmployerTanInput('');
        setEmployerLegalNameInput('');
        setBaseComponentInput('BASIC');
        setArrearComponentInput('ARREAR');
        setPayslipHeaderInput('');
        setPayslipLogoIdInput('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const savePayrollCompliance = useCallback(async () => {
    setComplianceSaveBusy(true);
    setComplianceSaveError(null);
    setComplianceSaveOk(null);
    try {
      await client.request(UpsertPayrollComplianceSettingDocument, {
        input: {
          employerTan: employerTanInput.trim() || null,
          employerLegalName: employerLegalNameInput.trim() || null,
          baseSalaryComponentCode: baseComponentInput.trim() || null,
          arrearSalaryComponentCode: arrearComponentInput.trim() || null,
          payslipHeaderTitle: payslipHeaderInput.trim() || null,
          payslipLogoFileStorageId: payslipLogoIdInput.trim() || null,
        },
      });
      setComplianceSaveOk(
        'Payroll compliance settings saved (CSV placeholders, component codes, payslip header/logo).'
      );
      await loadData();
    } catch (e) {
      setComplianceSaveError(
        e instanceof Error ? e.message : 'Could not save — check payroll statutory permissions'
      );
    } finally {
      setComplianceSaveBusy(false);
    }
  }, [
    arrearComponentInput,
    baseComponentInput,
    client,
    employerLegalNameInput,
    employerTanInput,
    loadData,
    payslipHeaderInput,
    payslipLogoIdInput,
  ]);

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
        setRunOk(
          'Pay run completed — cycle is PROCESSED (v1: employment salary + arrears mapped to tenant component codes).'
        );
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

  const downloadIndiaForm24qStubCsv = async () => {
    try {
      setForm24qExporting(true);
      setForm24qExportError(null);
      const res = await client.request<{
        indiaForm24qSalaryPaymentMonthlyStubCsv: string;
      }>(IndiaForm24qSalaryPaymentMonthlyStubCsvDocument, {
        month: tdsMonth,
        year: tdsYear,
      });
      const blob = new Blob([res.indiaForm24qSalaryPaymentMonthlyStubCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-form24q-salary-month-stub-${tdsYear}-${String(tdsMonth).padStart(2, '0')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setForm24qExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setForm24qExporting(false);
    }
  };

  const downloadIndiaEpfEcrPrepStubCsv = async () => {
    try {
      setEpfEcrExporting(true);
      setEpfEcrExportError(null);
      const res = await client.request<{ indiaEpfMonthlyEcrPrepStubCsv: string }>(
        IndiaEpfMonthlyEcrPrepStubCsvDocument,
        {
          month: tdsMonth,
          year: tdsYear,
        }
      );
      const blob = new Blob([res.indiaEpfMonthlyEcrPrepStubCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-epf-ecr-prep-stub-${tdsYear}-${String(tdsMonth).padStart(2, '0')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setEpfEcrExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setEpfEcrExporting(false);
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

  const downloadPayrollIndiaBulkNeftCreditCsv = async () => {
    try {
      setNeftExporting(true);
      setNeftExportError(null);
      const res = await client.request<{ payrollIndiaBulkNeftCreditCsv: string }>(
        PayrollIndiaBulkNeftCreditCsvDocument,
        {
          month: tdsMonth,
          year: tdsYear,
        }
      );
      const blob = new Blob([res.payrollIndiaBulkNeftCreditCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-india-bulk-neft-credit-${tdsYear}-${String(tdsMonth).padStart(2, '0')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setNeftExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setNeftExporting(false);
    }
  };

  const downloadIndiaFyPayrollEmployeeTotalsCsv = async () => {
    try {
      setFyExporting(true);
      setFyExportError(null);
      const res = await client.request<{ indiaFyPayrollEmployeeTotalsCsv: string }>(
        IndiaFyPayrollEmployeeTotalsCsvDocument,
        {
          fyStartYear,
        }
      );
      const blob = new Blob([res.indiaFyPayrollEmployeeTotalsCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-fy-employee-payroll-totals-FY${fyStartYear}-${fyStartYear + 1}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setFyExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setFyExporting(false);
    }
  };

  const downloadIndiaFyQuarterPayrollEmployeeTotalsCsv = async () => {
    try {
      setFyQuarterExporting(true);
      setFyQuarterExportError(null);
      const res = await client.request<{
        indiaFyQuarterPayrollEmployeeTotalsCsv: string;
      }>(IndiaFyQuarterPayrollEmployeeTotalsCsvDocument, {
        fyStartYear,
        quarter: fyQuarter,
      });
      const blob = new Blob([res.indiaFyQuarterPayrollEmployeeTotalsCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-fy${fyStartYear}-Q${fyQuarter}-employee-payroll-totals.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setFyQuarterExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setFyQuarterExporting(false);
    }
  };

  const downloadIndiaForm16PartBFyPrepStubCsv = async () => {
    try {
      setForm16Exporting(true);
      setForm16ExportError(null);
      const res = await client.request<{ indiaForm16PartBFyPrepStubCsv: string }>(
        IndiaForm16PartBFyPrepStubCsvDocument,
        {
          fyStartYear,
        }
      );
      const blob = new Blob([res.indiaForm16PartBFyPrepStubCsv], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-form16-partb-fy-prep-stub-FY${fyStartYear}-${fyStartYear + 1}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setForm16ExportError(
        e instanceof Error ? e.message : 'Export failed — check payroll permissions and login'
      );
    } finally {
      setForm16Exporting(false);
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

      {isPayrollAdmin && (
        <Card className="border-amber-200/90 bg-amber-50/80 dark:border-amber-800/80 dark:bg-amber-950/30">
          <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">
            India <strong>TDS · PF · ESI · 24Q · Form&nbsp;16 · NEFT</strong> CSVs below are
            reconciliation <strong>stubs</strong> for internal checks — they are <strong>not</strong>{' '}
            TRACES uploads, ECR/binary files, bank-spec NACH, or statutory filed returns. Use
            certified payroll/accounting tooling for compliance submissions.
          </p>
        </Card>
      )}

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {isPayrollAdmin && (
        <>
      <Card title="Employer branding & statutory (India)">
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          Employer TAN / name drive Form 24Q / Form 16 CSV columns (empty → env fallback on the payroll
          process). <strong className="font-medium">Pay run</strong> posts one line against the{' '}
          <span className="font-mono">baseSalaryComponentCode</span> earning component (employment
          salary); arrear payouts use <span className="font-mono">arrearSalaryComponentCode</span>.
          Payslip PDF supports raster logos (<strong>PNG</strong>/<strong>JPEG</strong>{' '}
          directly; <strong>WebP</strong>/<strong>SVG</strong> are rasterized in-browser for PDF).
          Requires payroll statutory export role.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="min-w-[12rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Employer TAN</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={employerTanInput}
              onChange={(ev) => setEmployerTanInput(ev.target.value)}
              placeholder="e.g. BDEL12345R"
              autoComplete="off"
            />
          </label>
          <label className="min-w-[16rem] flex flex-1 flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Employer legal name</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={employerLegalNameInput}
              onChange={(ev) => setEmployerLegalNameInput(ev.target.value)}
              placeholder="Registered name as per TAN"
              autoComplete="organization"
            />
          </label>
          <label className="min-w-[8rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Base earning code</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={baseComponentInput}
              onChange={(ev) => setBaseComponentInput(ev.target.value)}
              placeholder="BASIC"
            />
          </label>
          <label className="min-w-[8rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Arrear earning code</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={arrearComponentInput}
              onChange={(ev) => setArrearComponentInput(ev.target.value)}
              placeholder="ARREAR"
            />
          </label>
          <label className="min-w-[14rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Payslip header (display name)</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={payslipHeaderInput}
              onChange={(ev) => setPayslipHeaderInput(ev.target.value)}
              placeholder="Company name as on payslip"
            />
          </label>
          <label className="min-w-[16rem] flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Logo file UUID (optional)</span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={payslipLogoIdInput}
              onChange={(ev) => setPayslipLogoIdInput(ev.target.value)}
              placeholder="file_storage.id after HR upload"
            />
          </label>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={complianceSaveBusy || loading}
            onClick={() => void savePayrollCompliance()}
          >
            {complianceSaveBusy ? 'Saving…' : 'Save'}
          </Button>
        </div>
        {complianceSaveError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{complianceSaveError}</p>
        )}
        {complianceSaveOk && !complianceSaveError && (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">{complianceSaveOk}</p>
        )}
      </Card>

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

      <Card title="India — Form 24Q salary payment month (stub CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Reconciliation-oriented rows per payslip: India FY of the pay month, PAN, gross as a notional
          Section&nbsp;<strong>192</strong> salary base, and <strong>TDS</strong> withheld ({''}
          from&nbsp;payslip). Trailing columns can list employer TAN/name when{' '}
          <span className="font-mono text-xs">KABIPAY_PAYROLL_EMPLOYER_TAN</span> /{' '}
          <span className="font-mono text-xs">KABIPAY_PAYROLL_EMPLOYER_LEGAL_NAME</span> are set on the payroll
          service. Not TRACES <strong>Form&nbsp;24Q</strong> upload or Annex&nbsp;II layout — use for internal
          checks only. Same permission gate; month/year matches the TDS section above.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <button
            type="button"
            onClick={() => void downloadIndiaForm24qStubCsv()}
            disabled={form24qExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {form24qExporting ? 'Downloading…' : 'Download Form 24Q month stub CSV'}
          </button>
        </div>
        {form24qExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{form24qExportError}</p>
        )}
      </Card>

      <Card title="India — EPFO ECR contribution prep (stub CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          UAN, member name, PAY month/year, EPF wage (<span className="font-mono text-xs">min(gross, ₹15k)</span>),{' '}
          employee and employer PF from the payslip — for reconciling before remittance. Not the official
          Unified EPF <strong>ECR</strong> file format. Same gate; month/year matches the TDS section.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <button
            type="button"
            onClick={() => void downloadIndiaEpfEcrPrepStubCsv()}
            disabled={epfEcrExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {epfEcrExporting ? 'Downloading…' : 'Download EPF ECR prep stub CSV'}
          </button>
        </div>
        {epfEcrExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{epfEcrExportError}</p>
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

      <Card title="India — bulk NEFT credit prep (CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Same cycle and net pay as the bank transfer list, with columns aimed at common multi-row NEFT
          salary uploads (IFSC, account, narration, optional value date from the cycle’s payment date).
          Not an NPCI NACH mandate file or a bank binary template. Same permission gate; uses month/year
          in the TDS section above.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <button
            type="button"
            onClick={() => void downloadPayrollIndiaBulkNeftCreditCsv()}
            disabled={neftExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {neftExporting ? 'Downloading…' : 'Download bulk NEFT prep CSV'}
          </button>
        </div>
        {neftExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{neftExportError}</p>
        )}
      </Card>

      <Card title="India FY — employee payroll totals (CSV)">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Aggregates payslips in payroll cycles whose India financial year matches the selected start year
          (April through the following March). Sums gross, deductions, net, TDS, PF/ESI employee, and PT.
          Optional <strong>FY quarter</strong> narrows to Q1 Apr–Jun … Q4 Jan–Mar (next calendar year).
          Form&nbsp;16 Part&nbsp;B variant uses spreadsheet-friendly column labels; employer TAN/name come from
          env <span className="font-mono text-xs">KABIPAY_PAYROLL_EMPLOYER_TAN</span> /{' '}
          <span className="font-mono text-xs">KABIPAY_PAYROLL_EMPLOYER_LEGAL_NAME</span> when set on the payroll
          service — prep only, not a certificate.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">India FY start year</span>
            <input
              type="number"
              min={2000}
              max={2199}
              className="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={fyStartYear}
              onChange={(ev) => setFyStartYear(Number(ev.target.value) || fyStartYear)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">FY quarter</span>
            <select
              className="min-w-[12rem] rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={fyQuarter}
              onChange={(ev) => setFyQuarter(Number(ev.target.value) || 1)}
            >
              <option value={1}>Q1 Apr–Jun</option>
              <option value={2}>Q2 Jul–Sep</option>
              <option value={3}>Q3 Oct–Dec</option>
              <option value={4}>Q4 Jan–Mar</option>
            </select>
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            e.g. 2025 for FY 2025–26 (Apr 2025–Mar 2026).
          </span>
          <button
            type="button"
            onClick={() => void downloadIndiaFyPayrollEmployeeTotalsCsv()}
            disabled={fyExporting}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
          >
            {fyExporting ? 'Downloading…' : 'Download FY totals CSV'}
          </button>
          <button
            type="button"
            onClick={() => void downloadIndiaFyQuarterPayrollEmployeeTotalsCsv()}
            disabled={fyQuarterExporting}
            className="rounded-md border border-primary-600 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-gray-800"
          >
            {fyQuarterExporting ? 'Downloading…' : 'Download FY quarter totals CSV'}
          </button>
          <button
            type="button"
            onClick={() => void downloadIndiaForm16PartBFyPrepStubCsv()}
            disabled={form16Exporting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            {form16Exporting ? 'Downloading…' : 'Form 16 Part B prep (FY stub) CSV'}
          </button>
        </div>
        {fyExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{fyExportError}</p>
        )}
        {fyQuarterExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{fyQuarterExportError}</p>
        )}
        {form16ExportError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{form16ExportError}</p>
        )}
      </Card>
        </>
      )}
    </div>
  );
};

export default PayrollPage;
