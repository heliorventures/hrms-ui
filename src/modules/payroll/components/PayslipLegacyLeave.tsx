import { formatPayslipMoney } from '../payslipTableData';

import type { PayslipDocModel } from './PayslipDocument';

const PayslipLegacyLeave = ({ slip }: { slip: PayslipDocModel }) => {
  const leave = slip.unpaidLeave;
  if (!leave) return null;
  return (
    <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="font-semibold">Unpaid leave: {leave.unpaidDays} days</p>
      <p>
        {leave.basicComponentCode} {formatPayslipMoney(leave.basicAmount)} ÷ {leave.dayDivisor} ×{' '}
        {leave.unpaidDays} = {formatPayslipMoney(leave.amount)}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        {leave.treatment === 'BEFORE_STATUTORY'
          ? 'Already included as a reduction in basic earnings before statutory calculation.'
          : 'Included below as a separate deduction after statutory calculation.'}
      </p>
    </div>
  );
};

export default PayslipLegacyLeave;
