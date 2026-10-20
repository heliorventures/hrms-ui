import { useState } from 'react';

import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';

import { createCommandIntent } from './organizationCommand';
import { organizationDecisionPayload } from './organizationDecision';
import { optionalString, type OrganizationRecord } from './organizationDocuments';
import { resourcePending, type OrganizationResourceReference } from './organizationResource';
import type { OrganizationScope } from './organizationTypes';

interface Props {
  scope: OrganizationScope;
  reference: OrganizationResourceReference;
  record: OrganizationRecord;
  version: number;
}
const OrganizationDecisionForm = ({ scope, reference, record, version }: Props) => {
  const [reason, setReason] = useState('');
  const company = scope.companies.find((item) => item.membershipId === reference.membershipId);
  const capability = reference.kind === 'leave_request' ? 'leave:approve' : 'timesheet:approve';
  const allowed =
    scope.company?.membershipId === reference.membershipId &&
    company?.capabilities.includes(capability);
  const pending = resourcePending(scope, reference.membershipId, reference.resourceId);
  const step = optionalString(record, 'expected_workflow_step_id');
  const decide = (decision: 'approve' | 'reject') => {
    if (!allowed || !step) return;
    void scope.commands.submit(
      scope.organization.id,
      reference.companyName,
      createCommandIntent(
        reference.membershipId,
        reference.kind === 'leave_request' ? 'leave_decision' : 'timesheet_decision',
        reference.resourceId,
        version,
        organizationDecisionPayload(record, decision, reason)
      )
    );
  };
  if (!step) return <p className="text-sm">The source record has no current approval step.</p>;
  return (
    <div className="mt-4 space-y-3">
      {!allowed ? (
        <p>
          Select {reference.companyName} as the business target and obtain its approval capability
          to act.
        </p>
      ) : null}
      <Textarea
        label="Reason if rejecting"
        maxLength={2000}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        disabled={!allowed || pending}
        fullWidth
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={!allowed || pending} onClick={() => decide('approve')}>
          Approve in {reference.companyName}
        </Button>
        <Button
          variant="danger"
          disabled={!allowed || pending || !reason.trim()}
          onClick={() => decide('reject')}
        >
          Reject in {reference.companyName}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationDecisionForm;
