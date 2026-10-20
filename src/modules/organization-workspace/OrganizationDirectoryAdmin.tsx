import { useState } from 'react';

import {
  OrganizationDirectoryDocument,
  SyncOrganizationDirectoryDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { OrganizationDataError } from './organizationDataError';
import { documentItems, sourceVersion } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import {
  organizationScopeKey,
  type OrganizationCompany,
  type OrganizationScope,
} from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';
import { useOrganizationAction } from './useOrganizationAction';
import { useOrganizationPage } from './useOrganizationPage';

const Directory = ({
  scope,
  company,
}: {
  scope: OrganizationScope;
  company: OrganizationCompany;
}) => {
  const [sync, setSync] = useState<{ cursor: string | null; started: boolean; complete: boolean }>({
    cursor: null,
    started: false,
    complete: false,
  });
  const query = useOrganizationPage(`${organizationScopeKey(scope)}|directory`, async (after) => {
    return (
      await scope.client.request(OrganizationDirectoryDocument, {
        organizationId: scope.organization.id,
        membershipId: company.membershipId,
        after,
        first: 50,
      })
    ).organizationDirectory;
  });
  const action = useOrganizationAction(query.refresh);
  const synchronize = () => {
    void action.run(async () => {
      const response = (
        await scope.client.request(SyncOrganizationDirectoryDocument, {
          organizationId: scope.organization.id,
          membershipId: company.membershipId,
          after: sync.cursor,
          first: 100,
        })
      ).syncOrganizationDirectory;
      documentItems(response.schemaVersion, response.items);
      sourceVersion({ version: response.graphVersion });
      if (response.hasNextPage && !response.endCursor)
        throw new OrganizationDataError(
          'Source directory synchronization is incomplete. Start synchronization again.'
        );
      setSync({
        cursor: response.endCursor ?? null,
        started: true,
        complete: !response.hasNextPage,
      });
    });
  };
  return (
    <Card title="Verified source directory">
      <SourceCompanyLabel name={company.name} tenantId={company.tenantId} />
      <p className="my-3 text-sm text-content-secondary">
        Employment references and principal links come from this company&apos;s verified source. A
        directory entry alone grants no business access.
      </p>
      <OrganizationQueryState {...query} onRetry={query.refresh}>
        <OrganizationRecordTable
          label="Verified organization employment directory"
          rows={query.data?.items ?? []}
          fields={[
            { key: 'display_name', label: 'Employee' },
            { key: 'employee_code', label: 'Employee code' },
            { key: 'status', label: 'Employment status' },
            { key: 'principal_id', label: 'Linked organization principal' },
          ]}
        />
        <OrganizationPager
          {...query}
          busy={query.loading}
          hasNext={query.data?.hasNextPage ?? false}
        />
      </OrganizationQueryState>
      {scope.organization.canManage ? (
        <div className="mt-3 space-y-2">
          <Button variant="outline" busy={action.busy} onClick={synchronize}>
            {sync.started && !sync.complete
              ? 'Continue source directory synchronization'
              : 'Synchronize source directory'}
          </Button>
          {sync.complete ? (
            <p role="status">All source directory pages were synchronized.</p>
          ) : null}
          {sync.started && !sync.complete ? (
            <p role="status">More source pages remain. Continue synchronization to include them.</p>
          ) : null}
          {action.error ? <p role="alert">{action.error}</p> : null}
        </div>
      ) : null}
    </Card>
  );
};

const OrganizationDirectoryAdmin = ({ scope }: { scope: OrganizationScope }) => {
  if (!scope.company)
    return (
      <Card>
        <p>Select a business target company to browse or synchronize its verified directory.</p>
      </Card>
    );
  return <Directory key={scope.company.membershipId} scope={scope} company={scope.company} />;
};
export default OrganizationDirectoryAdmin;
