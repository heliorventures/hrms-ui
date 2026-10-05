import { useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import type { PayrollDraft } from '../taxProjectionTypes';

import PayrollDraftRow from './PayrollDraftRow';
import PayrollHelp from './PayrollHelp';

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="status" className="text-sm font-semibold">
            <span>{draft.employees.filter((row) => row.outcome === 'READY').length} ready</span>
            {' · '}
            <span>
              {draft.employees.filter((row) => row.outcome === 'REVIEW').length} needs review
            </span>
            {' · '}
            <span>
              {draft.employees.filter((row) => row.outcome === 'EXCLUDED').length} excluded
            </span>
          </p>
          <PayrollHelp label="About payroll review">
            Recalculate as often as needed while draft. Finalize &amp; Lock creates the reviewed
            payslips and prevents further changes.
          </PayrollHelp>
        </div>
        {draft.employees.some((row) => row.outcome === 'REVIEW') && (
          <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
            Calculations needing review show the missing setting below. Resolve it in Payroll Setup
            or Tax Administration, then recalculate.
          </p>
        )}
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
                <PayrollDraftRow key={row.employee_id} row={row} name={names[row.employee_id]} />
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
