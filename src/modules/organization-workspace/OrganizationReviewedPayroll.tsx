import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import BusinessRecordDetails from './BusinessRecordDetails';
import { createCommandIntent } from './organizationCommand';
import { payrollFinalizePayload, type ReviewedPayrollDraft } from './organizationPayrollModel';
import { resourcePending } from './organizationResource';
import type { OrganizationCompany, OrganizationScope } from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';

interface Props {
  scope: OrganizationScope;
  company: OrganizationCompany;
  cycleId: string;
  version: number;
  draft: ReviewedPayrollDraft;
}
const OrganizationReviewedPayroll = ({ scope, company, cycleId, version, draft }: Props) => {
  const [reviewed, setReviewed] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(() => new Set());
  const pending = resourcePending(scope, company.membershipId, cycleId);
  const acknowledge = (id: string, enabled: boolean) =>
    setAcknowledged((previous) => {
      const next = new Set(previous);
      if (enabled) next.add(id);
      else next.delete(id);
      return next;
    });
  const complete = draft.employees.every(
    (employee) => !employee.requiresTaxAcknowledgement || acknowledged.has(employee.id)
  );
  const finalize = () => {
    if (reviewed && complete)
      void scope.commands.submit(
        scope.organization.id,
        company.name,
        createCommandIntent(
          company.membershipId,
          'payroll_finalize',
          cycleId,
          version,
          payrollFinalizePayload(draft, acknowledged)
        )
      );
  };
  return (
    <Card title="Review the source payroll draft before finalization">
      <SourceCompanyLabel name={company.name} tenantId={company.tenantId} />
      <div className="my-3">
        <BusinessRecordDetails record={draft.cycle} />
      </div>
      <p className="mb-3 text-sm">
        Reviewed draft revision {draft.revision}. Review reference:{' '}
        <span className="break-all font-mono text-xs">{draft.fingerprint}</span>
      </p>
      <ul className="space-y-3">
        {draft.employees.map((employee) => (
          <li key={employee.id} className="space-y-2 rounded border border-line p-3">
            <h3 className="font-medium">{employee.label}</h3>
            <p className="text-sm">
              {employee.outcome}
              {employee.reason ? ` — ${employee.reason}` : ''}
            </p>
            {employee.prepared ? (
              <details>
                <summary className="cursor-pointer text-sm font-medium">
                  Review calculated pay, tax, contributions and loan recovery
                </summary>
                <div className="mt-2">
                  <BusinessRecordDetails record={employee.prepared} />
                </div>
              </details>
            ) : null}
            {employee.requiresTaxAcknowledgement ? (
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={pending}
                  checked={acknowledged.has(employee.id)}
                  onChange={(event) => acknowledge(employee.id, event.target.checked)}
                />
                I acknowledge the provisional tax calculation for {employee.label} shown in this
                reviewed draft.
              </label>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="my-3 text-sm">
        {draft.canFinalize
          ? 'The source draft is eligible for finalization.'
          : (draft.blockReason ?? 'This source draft is blocked from finalization.')}
      </p>
      <label className="my-3 flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={reviewed}
          disabled={pending || !draft.canFinalize}
          onChange={(event) => setReviewed(event.target.checked)}
        />
        I reviewed this company, payroll cycle and immutable draft contents.
      </label>
      <Button
        variant="danger"
        disabled={!draft.canFinalize || !reviewed || !complete || pending}
        onClick={finalize}
      >
        Finalize reviewed payroll in {company.name}
      </Button>
    </Card>
  );
};

export default OrganizationReviewedPayroll;
