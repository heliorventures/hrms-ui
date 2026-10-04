import { useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { sumMoney } from '../taxFormValues';
import type { PayrollDraft } from '../taxProjectionTypes';

interface Props {
  draft: PayrollDraft;
  busy: boolean;
  onFinalize: (employees: string[]) => void;
  onRecalculate: () => void;
  names?: Partial<Record<string, string>>;
}
const PayrollDraftReview = ({ draft, busy, onFinalize, onRecalculate, names = {} }: Props) => {
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const required = draft.employees
    .filter((row) => row.prepared?.requires_tax_acknowledgement)
    .map((row) => row.employee_id);
  const ready = draft.can_finalize && required.every((id) => acknowledged.includes(id));
  return (
    <Card title={`Payroll review · revision ${draft.revision}`}>
      <div data-tour-anchor="payroll.draft-review" className="space-y-3">
        <p>
          Recalculate as often as needed while the cycle is draft. Finalize &amp; Lock creates the
          reviewed payslips and prevents further changes.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {[
                  'Employee',
                  'Outcome',
                  'Total earnings',
                  'Deductions',
                  'Net salary',
                  'Advance already paid',
                  'Remaining payable',
                ].map((label) => (
                  <th key={label} className="p-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.employees.map((row) => (
                <tr key={row.employee_id} className="border-t">
                  <td className="p-2">
                    {names[row.employee_id] ??
                      row.employee_label ??
                      'Employee — recalculate to refresh'}
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
                      sumMoney([
                        row.prepared.calculation.gross,
                        row.prepared.calculation.incentive,
                      ]),
                    row.prepared?.calculation.total_deductions,
                    row.prepared?.calculation.net_earned,
                    row.prepared?.calculation.advance_already_paid,
                    row.prepared?.calculation.remaining_payable,
                  ].map((amount, index) => (
                    <td
                      key={['gross', 'deductions', 'net', 'advance', 'remaining'][index]}
                      className="p-2"
                    >
                      {amount ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {required.map((id) => (
          <label key={id} className="flex gap-2">
            <input
              type="checkbox"
              checked={acknowledged.includes(id)}
              onChange={(e) =>
                setAcknowledged((prior) =>
                  e.target.checked ? [...prior, id] : prior.filter((value) => value !== id)
                )
              }
            />
            I reviewed provisional tax for{' '}
            {names[id] ??
              draft.employees.find((row) => row.employee_id === id)?.employee_label ??
              'this employee'}
            ; earlier deduction history is incomplete.
          </label>
        ))}
        {!draft.can_finalize && (
          <p role="status">
            Resolve all review items and recalculate. A cycle needs at least one eligible employee.
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" disabled={busy} onClick={onRecalculate}>
            Recalculate
          </Button>
          <Button disabled={busy || !ready} onClick={() => onFinalize(required)}>
            Finalize &amp; Lock
          </Button>
        </div>
      </div>
    </Card>
  );
};
export default PayrollDraftReview;
