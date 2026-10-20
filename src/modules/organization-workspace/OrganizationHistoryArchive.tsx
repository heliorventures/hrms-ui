import { useState } from 'react';

import {
  ExportOrganizationHistoryArchiveDocument,
  OrganizationHistoryArchiveDocument,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';

import { readHistoryArchive, type HistoryArchive } from './organizationArchiveModel';
import OrganizationArchiveRecords from './OrganizationArchiveRecords';
import { companyBusinessReady } from './organizationCompanyLifecycle';
import { historyDateBounds, type OrganizationDateRange } from './organizationReportingModel';
import type { OrganizationCompany, OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';

const ArchiveActions = ({
  scope,
  company,
  range,
}: {
  scope: OrganizationScope;
  company: OrganizationCompany;
  range: OrganizationDateRange;
}) => {
  const [archiveId, setArchiveId] = useState(() => crypto.randomUUID());
  const [retrieveId, setRetrieveId] = useState('');
  const [archive, setArchive] = useState<HistoryArchive | null>(null);
  const action = useOrganizationAction(() => undefined);
  const exportArchive = () => {
    void action.run(async () => {
      setArchive(null);
      const bounds = historyDateBounds(range);
      const response = await scope.client.request(ExportOrganizationHistoryArchiveDocument, {
        organizationId: scope.organization.id,
        membershipId: company.membershipId,
        archiveId,
        from: bounds.from,
        through: bounds.to,
      });
      setArchive(
        readHistoryArchive(
          response.exportOrganizationHistoryArchive,
          scope.organization.id,
          company,
          archiveId
        )
      );
    });
  };
  const retrieve = () => {
    void action.run(async () => {
      setArchive(null);
      const id = retrieveId.toLowerCase();
      const response = await scope.client.request(OrganizationHistoryArchiveDocument, {
        organizationId: scope.organization.id,
        membershipId: company.membershipId,
        archiveId: id,
      });
      setArchive(
        readHistoryArchive(response.organizationHistoryArchive, scope.organization.id, company, id)
      );
    });
  };
  return (
    <div className="space-y-3">
      <p className="text-sm">
        Create a bounded archive for {company.name}, {range.from} through {range.to} (UTC). Each
        request checks your current history read and export grants.
      </p>
      <p className="text-sm">
        The source must confirm complete history coverage through this period. Select an earlier
        closed period if coverage is incomplete.
      </p>
      <p className="text-xs">Export reference: {archiveId}</p>
      <div className="flex flex-wrap gap-2">
        <Button busy={action.busy} onClick={exportArchive}>
          Create history archive
        </Button>
        <Button
          variant="outline"
          disabled={action.busy}
          onClick={() => {
            setArchive(null);
            setArchiveId(crypto.randomUUID());
          }}
        >
          Start another archive
        </Button>
      </div>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          retrieve();
        }}
      >
        <Input
          label="Existing archive reference"
          value={retrieveId}
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
          required
          onChange={(event) => setRetrieveId(event.target.value)}
        />
        <Button variant="outline" type="submit" busy={action.busy}>
          Retrieve authorized archive
        </Button>
      </form>
      {action.error ? (
        <p role="alert">
          {action.error} Keep the export reference when retrying an uncertain request.
        </p>
      ) : null}
      {archive ? <OrganizationArchiveRecords archive={archive} /> : null}
    </div>
  );
};

const OrganizationHistoryArchive = ({
  scope,
  range,
}: {
  scope: OrganizationScope;
  range: OrganizationDateRange;
}) => {
  const { company } = scope;
  if (!company)
    return (
      <Card>
        <p>Select one source company to create or retrieve a business history archive.</p>
      </Card>
    );
  if (
    !companyBusinessReady(company) ||
    !['history:read', 'history:export'].every((capability) =>
      company.capabilities.includes(capability)
    )
  )
    return null;
  return (
    <Card title="Business history archive">
      <ArchiveActions
        key={`${company.membershipId}|${JSON.stringify(range)}`}
        scope={scope}
        company={company}
        range={range}
      />
    </Card>
  );
};

export default OrganizationHistoryArchive;
