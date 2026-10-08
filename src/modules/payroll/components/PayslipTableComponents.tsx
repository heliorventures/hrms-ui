/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The horizontal scroll region needs keyboard access. */
import type { DisplayLine } from '../payslipTableData';
import { formatPayslipMoney, groupPayslipLines, payslipLineAt } from '../payslipTableData';

import type { PayslipDocModel } from './PayslipDocument';

const cell = 'border border-slate-400 px-2 py-2 align-top [overflow-wrap:anywhere]';
const amountCell = `${cell} text-right tabular-nums`;
const LineCells = ({ line }: { line?: DisplayLine }) => (
  <>
    <td className={cell}>{line?.name ?? ''}</td>
    <td className={amountCell}>{line ? formatPayslipMoney(line.amount) : ''}</td>
  </>
);

const PayslipTableComponents = ({ slip }: { slip: PayslipDocModel }) => {
  const { earnings, deductions, other } = groupPayslipLines(slip.presentation?.lines ?? []);
  const rows = Array.from({ length: Math.max(earnings.length, deductions.length) }, (_, index) => ({
    earning: payslipLineAt(earnings, index),
    deduction: payslipLineAt(deductions, index),
  }));
  return (
    <div
      className="overflow-x-auto print:overflow-visible"
      role="region"
      aria-label="Payslip components"
      tabIndex={0}
    >
      <table className="mt-4 w-full min-w-[32rem] table-fixed border-collapse text-xs sm:text-sm print:min-w-0">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[30%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead className="bg-slate-100 text-left">
          <tr>
            <th scope="col" className={cell}>
              Earnings
            </th>
            <th scope="col" className={amountCell}>
              Amount (INR)
            </th>
            <th scope="col" className={cell}>
              Deductions
            </th>
            <th scope="col" className={amountCell}>
              Amount (INR)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ earning, deduction }) => (
            <tr key={earning?.id ?? deduction?.id} className="break-inside-avoid">
              <LineCells line={earning} />
              <LineCells line={deduction} />
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className={cell}>
                No components selected for display.
              </td>
            </tr>
          )}
          <tr className="break-inside-avoid font-semibold">
            <th scope="row" className={`${cell} text-left`}>
              Total earnings
            </th>
            <td className={amountCell}>{formatPayslipMoney(slip.grossSalary)}</td>
            <th scope="row" className={`${cell} text-left`}>
              Total deductions
            </th>
            <td className={amountCell}>{formatPayslipMoney(slip.totalDeductions)}</td>
          </tr>
        </tbody>
      </table>
      {other.length > 0 && (
        <table className="mt-3 w-full min-w-[32rem] table-fixed border-collapse text-xs sm:text-sm print:min-w-0">
          <caption className="mb-1 text-left font-semibold">Other displayed components</caption>
          <thead>
            <tr>
              <th scope="col" className={cell}>
                Description
              </th>
              <th scope="col" className={cell}>
                Type
              </th>
              <th scope="col" className={amountCell}>
                Amount (INR)
              </th>
            </tr>
          </thead>
          <tbody>
            {other.map((line) => (
              <tr key={line.id} className="break-inside-avoid">
                <td className={cell}>{line.name}</td>
                <td className={cell}>{line.componentType}</td>
                <td className={amountCell}>{formatPayslipMoney(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PayslipTableComponents;
