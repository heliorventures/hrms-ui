import type { PayslipDocModel, PayslipLine } from './PayslipDocument';
import { PayslipPeriodLeave, PayslipSettlement } from './PayslipSettlement';

interface SheetProps {
  headerTitle: string;
  payslipLogoReadUrl?: string | null;
  employeeName: string;
  employeeCode: string;
  periodLabel: string;
  slip: PayslipDocModel;
  labelForLine: (line: PayslipLine) => string;
}
const fmt = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      })
    : value;
};
const SheetHeader = ({
  headerTitle,
  payslipLogoReadUrl,
  employeeName,
  employeeCode,
  periodLabel,
  slip,
}: SheetProps) => (
  <>
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-indigo-600 pb-3">
      {payslipLogoReadUrl && (
        <img src={payslipLogoReadUrl} alt="" className="h-10 max-w-[140px] object-contain" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold tracking-tight text-indigo-800">{headerTitle}</p>
        <p className="text-sm font-medium text-slate-600">Payslip — {periodLabel}</p>
      </div>
    </div>
    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
      <p>
        <span className="text-slate-500">Employee</span>
        <br />
        <span className="font-semibold">{employeeName}</span>
      </p>
      <p className="sm:text-right">
        <span className="text-slate-500">Code</span>
        <br />
        <span className="font-mono">{employeeCode || '—'}</span>
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
        {slip.uanNumber && <span>UAN: {slip.uanNumber}</span>}
        {slip.esicNumber && <span>ESIC: {slip.esicNumber}</span>}
      </div>
    )}
  </>
);
const LegacyLeave = ({ slip }: { slip: PayslipDocModel }) => {
  const leave = slip.unpaidLeave;
  if (!leave) return null;
  return (
    <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="font-semibold">Unpaid leave: {leave.unpaidDays} days</p>
      <p>
        {leave.basicComponentCode} {fmt(leave.basicAmount)} ÷ {leave.dayDivisor} ×{' '}
        {leave.unpaidDays} = {fmt(leave.amount)}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        {leave.treatment === 'BEFORE_STATUTORY'
          ? 'Already included as a reduction in basic earnings before statutory calculation.'
          : 'Included below as a separate deduction after statutory calculation.'}
      </p>
    </div>
  );
};
const ComponentTable = ({ slip }: Pick<SheetProps, 'slip'>) => {
  const lines = slip.presentation?.lines ?? [];
  return (
    <>
      <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">
        Pay components
      </h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-2">Description</th>
            <th className="w-32 py-2 text-right">Type</th>
            <th className="w-28 py-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b border-slate-100">
              <td className="py-2 pr-2 text-slate-800">{line.name}</td>
              <td className="py-2 text-right text-xs text-slate-500">
                {line.componentType || '—'}
              </td>
              <td className="py-2 text-right font-mono">{fmt(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
const Totals = ({ slip }: { slip: PayslipDocModel }) => (
  <>
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
  </>
);
const PayslipSheet = (props: SheetProps) => {
  const { slip } = props;
  if (!slip.presentation) return null;
  const { statement } = slip.presentation;
  return (
    <div
      id="payslip-print-sheet"
      className="mx-auto w-full max-w-[210mm] border border-slate-200/90 bg-white p-8 text-slate-900 shadow-card print:border-0 print:shadow-none sm:p-10 dark:border-slate-600 dark:bg-white dark:text-slate-900"
    >
      <SheetHeader {...props} />
      <LegacyLeave slip={slip} />
      {statement && <PayslipPeriodLeave statement={statement} format={fmt} />}
      <ComponentTable slip={slip} />
      <Totals slip={slip} />
      {statement && <PayslipSettlement statement={statement} format={fmt} />}
      <p className="mt-6 text-center text-[10px] text-slate-400">
        System generated. For discrepancies, contact HR.
      </p>
    </div>
  );
};
export default PayslipSheet;
