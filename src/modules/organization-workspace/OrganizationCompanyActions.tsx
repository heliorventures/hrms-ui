import {
  BeginOrganizationCompanyDetachDocument,
  ResumeOrganizationCompanyDocument,
  SuspendOrganizationCompanyDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import { createCommandIntent } from './organizationCommand';
import { membershipNeedsInstallation } from './organizationCompanyLifecycle';
import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { resourcePending } from './organizationResource';
import type { OrganizationScope } from './organizationTypes';

interface Props {
  scope: OrganizationScope;
  row: OrganizationRecord;
  organizationVersion: number;
  busy: boolean;
  run: (action: () => Promise<unknown>) => Promise<void>;
}
const MembershipTransitions = ({ scope, row, organizationVersion, busy, run }: Props) => {
  const sourceLogin = row.tenant_id === scope.sourceCompanyId;
  const variables = {
    organizationId: scope.organization.id,
    expectedVersion: organizationVersion,
    membershipId: requiredString(row, 'id'),
    expectedMembershipVersion: sourceVersion(row),
  };
  const suspend = () => {
    void run(() => scope.client.request(SuspendOrganizationCompanyDocument, variables));
  };
  const resume = () => {
    void run(() => scope.client.request(ResumeOrganizationCompanyDocument, variables));
  };
  const detach = () => {
    void run(() => scope.client.request(BeginOrganizationCompanyDetachDocument, variables));
  };
  if (sourceLogin)
    return (
      <p className="text-sm text-content-secondary">
        Your login company must remain active. Use another authorized company to change its
        membership.
      </p>
    );
  return (
    <div className="space-y-2">
      {row.status === 'ACTIVE' ? (
        <ConfirmOrganizationAction
          label="Suspend company"
          description="Request suspension, then install it in the source company. Workflows pause after source confirmation; manager assignments and reporting ownership are preserved."
          busy={busy}
          onConfirm={suspend}
        />
      ) : null}
      {row.status === 'SUSPENDED' ? (
        <ConfirmOrganizationAction
          label="Resume company"
          description="Resume this membership, install its new state in the source company, then reinstall and confirm its company grants."
          busy={busy}
          onConfirm={resume}
        />
      ) : null}
      {['ACTIVE', 'SUSPENDED'].includes(String(row.status)) ? (
        <ConfirmOrganizationAction
          label="Begin company detachment"
          description="Reassign or end incoming reports and install those changes first. Detachment retires source assignments and releases reporting ownership only after source confirmation. Retain another organization management anchor."
          busy={busy}
          onConfirm={detach}
        />
      ) : null}
      {row.status === 'DETACHING' ? (
        <p className="text-sm">
          Detachment is pending. Install the membership state, check source confirmation, then
          refresh access to see the final state.
        </p>
      ) : null}
    </div>
  );
};

const OrganizationCompanyActions = (props: Props) => {
  const { scope, row, busy } = props;
  const membershipId = requiredString(row, 'id');
  const company = scope.companies.find((item) => item.membershipId === membershipId);
  const pending = resourcePending(scope, membershipId, membershipId);
  const locked = busy || pending;
  const install = () => {
    if (company)
      void scope.commands.submit(
        scope.organization.id,
        company.name,
        createCommandIntent(
          membershipId,
          'install_membership',
          membershipId,
          sourceVersion(row),
          {}
        )
      );
  };
  return (
    <div className="space-y-2">
      {company &&
      membershipNeedsInstallation(company) &&
      company.capabilities.includes('organization:manage') ? (
        <Button variant="outline" size="sm" disabled={locked} onClick={install}>
          Install membership state in source company
        </Button>
      ) : null}
      {pending ? (
        <p className="text-sm">
          Membership change awaits source confirmation. Use the original reference in Source company
          confirmations.
        </p>
      ) : null}
      <MembershipTransitions {...props} busy={locked} />
    </div>
  );
};

export default OrganizationCompanyActions;
