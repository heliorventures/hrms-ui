import { useCallback, useRef } from 'react';
import Button from '../../../components/common/Button';
import { downloadPayslipPdf } from '../utils/payslipPdf';

export type PayslipLine = {
  id: string;
  salaryComponentId: string;
  amount: string;
  componentType?: string | null;
};

export type PayslipDocModel = {
  id: string;
  grossSalary: string;
  totalDeductions: string;
  netSalary: string;
  status: string;
  generatedAt: string;
  lines: PayslipLine[];
  pfEmployee?: string | null;
  pfEmployer?: string | null;
  esiEmployee?: string | null;
  esiEmployer?: string | null;
  tdsAmount?: string | null;
  professionalTax?: string | null;
  uanNumber?: string | null;
  esicNumber?: string | null;
};

type PayslipDocumentProps = {
  tenantName: string;
  /** From `payroll_compliance_setting.payslipHeaderTitle` when configured. */
  companyHeaderName?: string | null;
  employeeName: string;
  employeeCode: string;
  periodLabel: string;
  labelForLine: (line: PayslipLine) => string;
  slip: PayslipDocModel;
};

const fmt = (n: string) => {
  const v = Number(n);
  if (Number.isNaN(v)) return n;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(v);
};

/**
 * Print-friendly salary slip (browser “Print → Save as PDF”).
 */
const PayslipDocument = ({
  tenantName,
  companyHeaderName,
  employeeName,
  employeeCode,
  periodLabel,
  labelForLine,
  slip,
}: PayslipDocumentProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const headerTitle = companyHeaderName?.trim() || tenantName;

  const onPrint = useCallback(() => {
    document.documentElement.classList.add('print-payslip');
    const cleanup = () => document.documentElement.classList.remove('print-payslip');
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  }, []);

  const onDownloadPdf = useCallback(() => {
    downloadPayslipPdf(
      {
        companyLine: headerTitle,
        periodLabel,
        employeeName,
        employeeCode,
      },
      slip,
      (line) =>
        labelForLine({
          id: line.id ?? line.salaryComponentId,
          salaryComponentId: line.salaryComponentId,
          amount: line.amount,
          componentType: line.componentType,
        })
    );
  }, [employeeCode, employeeName, headerTitle, labelForLine, periodLabel, slip]);

  return (
    <div>
      <div className="no-print mb-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="secondary" onClick={onDownloadPdf}>
          Download PDF
        </Button>
        <Button type="button" variant="primary" onClick={onPrint}>
          Print / Save as PDF
        </Button>
        <p className="text-right text-xs text-slate-500">
          In the print dialog, choose &quot;Save as PDF&quot; to download.
        </p>
      </div>

      <div
        ref={sheetRef}
        id="payslip-print-sheet"
        className="mx-auto w-full max-w-[210mm] border border-slate-200/90 bg-white p-8 text-slate-900 shadow-card print:border-0 print:shadow-none sm:p-10 dark:border-slate-600 dark:bg-white dark:text-slate-900"
      >
        <div className="border-b-2 border-indigo-600 pb-3">
          <p className="text-lg font-bold tracking-tight text-indigo-800">{headerTitle}</p>
          <p className="text-sm font-medium text-slate-600">Payslip — {periodLabel}</p>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Employee</span>
            <br />
            <span className="font-semibold text-slate-900">{employeeName}</span>
          </p>
          <p className="sm:text-right">
            <span className="text-slate-500">Code</span>
            <br />
            <span className="font-mono font-medium">{employeeCode || '—'}</span>
          </p>
          <p>
            <span className="text-slate-500">Status</span> · {slip.status}
          </p>
          <p className="sm:text-right">
            <span className="text-slate-500">Generated</span>
            <br />
            {new Date(slip.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium' })}
          </p>
        </div>

        {(slip.uanNumber || slip.esicNumber) && (
          <div className="mt-2 flex flex-wrap gap-3 border-t border-slate-100 pt-2 text-xs text-slate-600">
            {slip.uanNumber ? <span>UAN: {slip.uanNumber}</span> : null}
            {slip.esicNumber ? <span>ESIC: {slip.esicNumber}</span> : null}
          </div>
        )}

        <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">
          Pay components
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <th className="py-2 pl-0 pr-2">Description</th>
              <th className="w-32 py-2 text-right">Type</th>
              <th className="w-28 py-2 pr-0 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {slip.lines.map((l) => (
              <tr key={l.id} className="border-b border-slate-100">
                <td className="py-2 pr-2 text-slate-800">{labelForLine(l)}</td>
                <td className="py-2 text-right text-xs text-slate-500">{l.componentType || '—'}</td>
                <td className="py-2 text-right font-mono text-slate-900">{fmt(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
          {slip.pfEmployee ? (
            <div className="flex justify-between">
              <span className="text-slate-600">PF (employee)</span>
              <span className="font-mono">{fmt(slip.pfEmployee)}</span>
            </div>
          ) : null}
          {slip.pfEmployer ? (
            <div className="flex justify-between text-xs text-slate-500">
              <span>PF (employer)</span>
              <span className="font-mono">{fmt(slip.pfEmployer)}</span>
            </div>
          ) : null}
          {slip.esiEmployee ? (
            <div className="flex justify-between">
              <span className="text-slate-600">ESI (employee)</span>
              <span className="font-mono">{fmt(slip.esiEmployee)}</span>
            </div>
          ) : null}
          {slip.professionalTax ? (
            <div className="flex justify-between">
              <span className="text-slate-600">Professional tax</span>
              <span className="font-mono">{fmt(slip.professionalTax)}</span>
            </div>
          ) : null}
          {slip.tdsAmount ? (
            <div className="flex justify-between">
              <span className="text-slate-600">TDS</span>
              <span className="font-mono">{fmt(slip.tdsAmount)}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-2 border-t-2 border-slate-200 pt-4 text-sm">
          <div className="flex justify-between font-medium">
            <span>Gross</span>
            <span className="font-mono">{fmt(slip.grossSalary)}</span>
          </div>
          <div className="flex justify-between font-medium text-red-800">
            <span>Total deductions</span>
            <span className="font-mono">− {fmt(slip.totalDeductions)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t-2 border-indigo-200 pt-3 text-lg">
          <span className="font-bold text-slate-800">Net pay</span>
          <span className="font-mono font-bold text-indigo-800">{fmt(slip.netSalary)}</span>
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-400">
          System generated. For discrepancies, contact HR.
        </p>
      </div>
    </div>
  );
};

export default PayslipDocument;
