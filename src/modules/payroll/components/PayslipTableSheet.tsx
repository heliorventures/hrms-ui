import { formatPayslipMoney } from '../payslipTableData';

import PayslipLegacyLeave from './PayslipLegacyLeave';
import { PayslipPeriodLeave, PayslipSettlement } from './PayslipSettlement';
import type { SheetProps } from './PayslipSheet';
import PayslipTableComponents from './PayslipTableComponents';

const PayslipTableSheet = ({
  headerTitle,
  payslipLogoReadUrl,
  periodLabel,
  slip,
  preview,
}: SheetProps) => {
  if (!slip.presentation) return null;
  const details = [
    ...slip.presentation.employeeDetails.map(({ label, value }) => [label, value]),
    ['Status', slip.status],
    ['Generated', new Date(slip.generatedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })],
  ].filter(([, value]) => Boolean(value));
  const { statement } = slip.presentation;
  return (
    <div
      id={preview ? undefined : 'payslip-print-sheet'}
      className="mx-auto w-full max-w-[210mm] border border-slate-300 bg-white p-4 text-slate-900 print:border-0 print:p-0 sm:p-8"
    >
      <div className="flex items-center gap-4 border border-slate-400 p-3">
        {payslipLogoReadUrl && (
          <img src={payslipLogoReadUrl} alt="" className="h-16 w-20 shrink-0 object-contain" />
        )}
        <div className="min-w-0 flex-1 text-center [overflow-wrap:anywhere]">
          <p className="text-lg font-bold">{headerTitle}</p>
          <p className="mt-2 text-sm font-semibold">Payslip for {periodLabel}</p>
        </div>
      </div>
      <dl className="grid grid-cols-1 border-l border-t border-slate-400 text-xs sm:grid-cols-2 sm:text-sm print:grid-cols-2">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] border-b border-r border-slate-400"
          >
            <dt className="border-r border-slate-400 p-2 font-semibold">{label}</dt>
            <dd className="p-2 [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      <PayslipTableComponents slip={slip} />
      <div className="mt-3 flex break-inside-avoid justify-between gap-3 border border-slate-400 p-3 font-bold">
        <span>Net pay</span>
        <span className="tabular-nums">{formatPayslipMoney(slip.netSalary)}</span>
      </div>
      <PayslipLegacyLeave slip={slip} />
      {statement && <PayslipPeriodLeave statement={statement} format={formatPayslipMoney} />}
      {statement && <PayslipSettlement statement={statement} format={formatPayslipMoney} />}
      <p className="mt-5 text-center text-[10px] text-slate-500">
        System generated. For discrepancies, contact HR.
      </p>
    </div>
  );
};

export default PayslipTableSheet;
