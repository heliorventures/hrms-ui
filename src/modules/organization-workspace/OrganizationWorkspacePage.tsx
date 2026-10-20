import { useEffect, useState } from 'react';

import { OrganizationWorkspacesDocument } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';

import { OrganizationAccessContext } from './organizationAccessContext';
import { organizationCommandTransport } from './organizationApi';
import OrganizationCommandJournal from './OrganizationCommandJournal';
import { organizationEnabled } from './organizationFeature';
import OrganizationIdentityCard from './OrganizationIdentityCard';
import OrganizationInvitationsCard from './OrganizationInvitationsCard';
import OrganizationQueryState from './OrganizationQueryState';
import type { OrganizationClientScope } from './organizationTypes';
import OrganizationWorkspaceShell from './OrganizationWorkspaceShell';
import SourceCompanyLabel from './SourceCompanyLabel';
import { useOrganizationClient } from './useOrganizationClient';
import { useOrganizationCommands } from './useOrganizationCommands';
import { useOrganizationQuery } from './useOrganizationQuery';
import { useOrganizationRevalidation } from './useOrganizationRevalidation';

const OrganizationSessionWorkspace = ({ access }: { access: OrganizationClientScope }) => {
  const [selected, setSelected] = useState('');
  const workspaces = useOrganizationQuery(
    `${access.ownerKey}|workspaces`,
    async () => (await access.client.request(OrganizationWorkspacesDocument)).organizationWorkspaces
  );
  const commands = useOrganizationCommands(
    access.ownerKey,
    organizationCommandTransport(access.client, workspaces.refresh)
  );
  const { retainOrganizations, reset } = commands;
  useEffect(() => {
    if (workspaces.data) retainOrganizations(workspaces.data.map((item) => item.id));
  }, [retainOrganizations, workspaces.data]);
  useEffect(() => {
    if (workspaces.denied) reset();
  }, [reset, workspaces.denied]);
  useOrganizationRevalidation(workspaces.refresh);
  const organization = workspaces.data?.find((item) => item.id === selected);
  return (
    <OrganizationAccessContext.Provider value={workspaces.refresh}>
      <div className="space-y-4">
        <PageHeader
          title="Organization workspace"
          description="Manage authorized companies while staying signed into your employment company."
          actions={
            <Button variant="outline" onClick={workspaces.refresh}>
              Refresh access
            </Button>
          }
        />
        <SourceCompanyLabel name={access.sourceCompanyName} tenantId={access.sourceCompanyId} />
        {workspaces.data ? <OrganizationCommandJournal {...commands} /> : null}
        <OrganizationQueryState
          loading={workspaces.loading}
          error={workspaces.error}
          onRetry={workspaces.refresh}
        >
          <Card>
            <Select
              label="Organization"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              options={[
                { value: '', label: 'Select an organization' },
                ...(workspaces.data ?? []).map((item) => ({ value: item.id, label: item.name })),
              ]}
            />
            {workspaces.data?.length === 0 ? (
              <p className="mt-2 text-sm">
                No active organization assignments are available for this identity.
              </p>
            ) : null}
          </Card>
          {organization ? (
            <OrganizationWorkspaceShell
              key={organization.id}
              access={access}
              organization={organization}
              commands={commands}
              refreshAccess={workspaces.refresh}
            />
          ) : null}
        </OrganizationQueryState>
        <OrganizationInvitationsCard access={access} refreshAccess={workspaces.refresh} />
        <OrganizationIdentityCard
          access={access}
          refreshAccess={() => {
            reset();
            workspaces.refresh();
          }}
        />
      </div>
    </OrganizationAccessContext.Provider>
  );
};

const OrganizationWorkspacePage = () => {
  const access = useOrganizationClient();
  if (!organizationEnabled())
    return (
      <Card>
        <p>This organization workspace is not enabled.</p>
      </Card>
    );
  if (!access.sourceReady)
    return (
      <Card>
        <p>Sign in to your employment company to open this workspace.</p>
      </Card>
    );
  return <OrganizationSessionWorkspace key={access.ownerKey} access={access} />;
};

export default OrganizationWorkspacePage;
