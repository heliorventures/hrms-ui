import { sumMoney } from '../taxFormValues';
import type { PayrollDraft } from '../taxProjectionTypes';

import { PayrollLoanReview } from './PayrollLoanReview';

const PayrollDraftRow = ({
  row,
  name,
}: {
  row: PayrollDraft['employees'][number];
  name?: string;
}) => (
  <tr className="border-t">
    <td className="p-2">
      {name ?? row.employee_label ?? 'Employee — recalculate to refresh'}
      {row.prepared?.loan_recovery && row.prepared.loan_recovery.quote.lines.length > 0 && (
        <PayrollLoanReview reviewed={row.prepared.loan_recovery} />
      )}
      {!!row.prepared?.arrears?.length && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer">Review included arrears</summary>
          <ul className="mt-1 space-y-1">
            {row.prepared.arrears.map((arrear) => (
              <li key={arrear.id}>
                ARREAR ₹{arrear.amount} — {arrear.reason || 'No reason recorded'}
              </li>
            ))}
          </ul>
        </details>
      )}
    </td>
    <td className="p-2">
      {row.outcome}
      <p>{row.reason}</p>
    </td>
    {[
      row.prepared &&
        sumMoney([row.prepared.calculation.gross, row.prepared.calculation.incentive]),
      row.prepared?.calculation.total_deductions,
      row.prepared?.calculation.net_earned,
      row.prepared?.calculation.advance_already_paid,
      row.prepared?.calculation.remaining_payable,
    ].map((amount, index) => (
      <td key={['gross', 'deductions', 'net', 'advance', 'remaining'][index]} className="p-2">
        {amount ?? (index === 0 && row.outcome === 'REVIEW' ? 'Calculation blocked' : '—')}
      </td>
    ))}
  </tr>
);
export default PayrollDraftRow;
