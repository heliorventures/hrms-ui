import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import { createCommandIntent } from './organizationCommand';
import { sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { readHrResource, text } from './organizationHrModel';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import { resourcePending } from './organizationResource';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';
import { useOrganizationSourceList } from './useOrganizationSourceList';

const PayrollJobDetails = ({
  scope,
  selected,
  onRefresh,
}: {
  scope: OrganizationScope;
  selected: OrganizationRecord;
  onRefresh: () => void;
}) => {
  const id = text(selected, 'job_id');
  const query = useOrganizationQuery(
    `${organizationScopeKey(scope)}|payroll-job|${id}|${sourceVersion(selected)}`,
    () => readHrResource(scope, OrganizationOperation.PayrollJobDetail, id, sourceVersion(selected))
  );
  const cancel = async () => {
    if (!scope.company || !query.data) return;
    await scope.commands.submit(
      scope.organization.id,
      scope.company.name,
      createCommandIntent(
        scope.company.membershipId,
        'payroll_job_cancel_before_execution',
        id,
        query.data.version,
        {}
      )
    );
    onRefresh();
  };
  return (
    <OrganizationQueryState {...query} onRetry={onRefresh}>
      {query.data ? (
        <div className="space-y-3">
          <OrganizationRecordTable
            label="Payroll job details"
            idKey="job_id"
            rows={[query.data.record]}
            fields={[
              { key: 'job_id', label: 'Job reference' },
              { key: 'state', label: 'Processing status' },
              { key: 'attempts', label: 'Attempts' },
              { key: 'created_at', label: 'Accepted at' },
              { key: 'started_at', label: 'Started at' },
              { key: 'finished_at', label: 'Finished at' },
              { key: 'failure_code', label: 'Failure reason' },
            ]}
          />
          {query.data.record.state === 'QUEUED' ? (
            <ConfirmOrganizationAction
              label="Cancel queued payroll job"
              description="The source cancels this payroll job only before execution begins. Refresh to confirm its final processing state."
              busy={scope.company ? resourcePending(scope, scope.company.membershipId, id) : true}
              onConfirm={() => {
                void cancel();
              }}
            />
          ) : null}
        </div>
      ) : null}
    </OrganizationQueryState>
  );
};

const OrganizationPayrollJobs = ({ scope }: { scope: OrganizationScope }) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const query = useOrganizationSourceList(scope, OrganizationOperation.PayrollJobList, 'jobs');
  const refresh = () => {
    setSelected(null);
    query.refresh();
  };
  return (
    <Card title="Source payroll processing jobs">
      <p className="mb-3 text-sm">
        Accepted confirms the source queued a job. Payroll completes only when the job succeeds and
        the source cycle reflects the result.
      </p>
      <Button variant="outline" className="mb-3" onClick={refresh}>
        Refresh payroll processing jobs
      </Button>
      <OrganizationQueryState {...query} onRetry={refresh}>
        <OrganizationRecordTable
          label="Source payroll jobs"
          idKey="job_id"
          rows={query.data?.rows ?? []}
          fields={[
            { key: 'cycle_id', label: 'Payroll cycle reference' },
            { key: 'operation', label: 'Operation' },
            { key: 'state', label: 'Processing status' },
            { key: 'failure_code', label: 'Failure reason' },
          ]}
          renderAction={(record) => (
            <Button variant="outline" size="sm" onClick={() => setSelected(record)}>
              Check processing details
            </Button>
          )}
        />
        <OrganizationPager
          canPrevious={query.hasPrevious}
          hasNext={query.data?.record.has_more === true}
          busy={query.loading}
          previous={() => {
            setSelected(null);
            query.previous();
          }}
          next={() => {
            setSelected(null);
            query.next();
          }}
        />
        {selected ? (
          <PayrollJobDetails
            key={`${text(selected, 'job_id')}|${sourceVersion(selected)}`}
            scope={scope}
            selected={selected}
            onRefresh={refresh}
          />
        ) : null}
      </OrganizationQueryState>
    </Card>
  );
};

export default OrganizationPayrollJobs;
