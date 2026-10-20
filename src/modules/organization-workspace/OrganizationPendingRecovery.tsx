import { useEffect, useRef, useState, type ReactNode } from 'react';

import { OrganizationPendingCommandsDocument } from '../../api/organization/graphql';

import { loadPendingCommands, type RecoveredCompanyCommands } from './organizationPendingCommands';
import OrganizationQueryState from './OrganizationQueryState';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

interface RecoveryPage {
  recovered: RecoveredCompanyCommands[];
  reconcile: (currentIds: string[]) => boolean;
}

const OrganizationPendingRecovery = ({
  scope,
  children,
}: {
  scope: OrganizationScope;
  children: ReactNode;
}) => {
  const { restorePending, beginPendingRecovery } = scope.commands;
  const { refreshAccess } = scope;
  const organizationId = scope.organization.id;
  const [restored, setRestored] = useState<RecoveryPage | null>(null);
  const handled = useRef<RecoveryPage | null>(null);
  const pending = useOrganizationQuery(`${organizationScopeKey(scope)}|pending`, async () => {
    const reconcile = beginPendingRecovery(scope.organization.id);
    const recovered = await loadPendingCommands(
      scope.companies,
      async (after) =>
        (
          await scope.client.request(OrganizationPendingCommandsDocument, {
            organizationId: scope.organization.id,
            membershipId: null,
            after,
            first: 100,
          })
        ).organizationPendingCommands
    );
    return { recovered, reconcile };
  });
  useEffect(() => {
    if (!pending.data || pending.data === handled.current) return;
    handled.current = pending.data;
    const removed = pending.data.reconcile(
      pending.data.recovered.flatMap((company) => company.references.map((item) => item.commandId))
    );
    for (const company of pending.data.recovered)
      restorePending(organizationId, company.companyName, company.references);
    if (removed) refreshAccess();
    else setRestored(pending.data);
  }, [pending.data, restorePending, organizationId, refreshAccess]);
  return (
    <OrganizationQueryState
      {...pending}
      loading={pending.loading || (pending.data !== null && restored !== pending.data)}
      onRetry={pending.refresh}
    >
      {children}
    </OrganizationQueryState>
  );
};

export default OrganizationPendingRecovery;
