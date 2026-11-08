import type { PayslipStatement } from '../payslipPresentation';

import { PayslipLoans } from './PayslipLoans';

export const PayslipSettlement = ({
  statement,
  format,
}: {
  statement: PayslipStatement;
  format: (value: string) => string;
}) => (
  <>
    {statement.loans && statement.loans.lines.length > 0 && (
      <PayslipLoans snapshot={statement.loans} format={format} />
    )}
    <div className="mt-4 space-y-2 rounded border border-slate-200 p-3 text-sm">
      <p className="font-semibold">Salary settlement</p>
      <div className="flex justify-between">
        <span>Net earnings</span>
        <span>{format(statement.net_earned)}</span>
      </div>
      <div className="flex justify-between">
        <span>Salary already paid as advance</span>
        <span>{format(statement.advance_already_paid)}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Remaining payable</span>
        <span>{format(statement.remaining_payable)}</span>
      </div>
      <p className="text-xs text-slate-600">
        An advance settles salary already earned. It does not reduce gross salary or increase
        deductions.
      </p>
    </div>
  </>
);

export const PayslipPeriodLeave = ({
  statement,
  format,
}: {
  statement: PayslipStatement;
  format: (value: string) => string;
}) => (
  <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
    <p className="font-semibold">Leave without pay: {statement.lwp_days} days</p>
    <p>
      Gross basis {format(statement.lwp_basis_amount)} / {statement.lwp_divisor} days. LWP
      adjustment: {format(statement.lwp_amount)}.
    </p>
    <p className="mt-1 text-xs text-slate-600">
      Included in this period&apos;s earned gross using the configured salary formula. It is not
      deducted again.
    </p>
  </div>
);
