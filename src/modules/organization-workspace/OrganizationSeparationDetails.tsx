import { OrganizationOperation } from '../../api/organization/graphql';
import Card from '../../components/common/Card';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import { createCommandIntent, type BusinessOperation } from './organizationCommand';
import { sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { readHrResource, records, text } from './organizationHrModel';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import { latestSourceVersion, resourcePending } from './organizationResource';
import { separationSubjectRow } from './organizationSeparationModel';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

const OrganizationSeparationDetails = ({
  scope,
  selected,
}: {
  scope: OrganizationScope;
  selected: OrganizationRecord;
}) => {
  const { company } = scope;
  const id = text(selected, 'separation_id');
  const version = company
    ? latestSourceVersion(scope, company.membershipId, id, sourceVersion(selected))
    : sourceVersion(selected);
  const query = useOrganizationQuery(
    `${organizationScopeKey(scope)}|separation-detail|${id}|${version}`,
    () => readHrResource(scope, OrganizationOperation.SeparationDetail, id, version)
  );
  const send = async (
    operation: BusinessOperation,
    resourceId: string,
    resourceVersion: number,
    payload: OrganizationRecord
  ) => {
    if (!company) return;
    await scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(company.membershipId, operation, resourceId, resourceVersion, payload)
    );
    query.refresh();
  };
  const busy = company ? resourcePending(scope, company.membershipId, id) : true;
  const detail = query.data;
  return (
    <Card title="Source employee exit and clearance">
      <OrganizationQueryState {...query} onRetry={query.refresh}>
        {detail ? (
          <div className="space-y-3">
            <OrganizationRecordTable
              label="Selected employee exit"
              idKey="separation_id"
              rows={[separationSubjectRow(detail.record)]}
              requireSourceVersion={false}
              fields={[
                { key: 'employee_subject', label: 'Employee' },
                { key: 'separation_type', label: 'Exit type' },
                { key: 'last_working_date', label: 'Last working date' },
                { key: 'status', label: 'Source status' },
                { key: 'reason', label: 'Reason' },
              ]}
            />
            <p className="text-sm">
              Exit approval and final settlement require their separate Finance authority.
            </p>
            {detail.record.status === 'PENDING' ? (
              <div className="flex flex-wrap gap-2">
                <ConfirmOrganizationAction
                  label="Reject pending exit"
                  description="Reject this pending employee exit at the source company."
                  busy={busy}
                  onConfirm={() => {
                    void send('separation_reject', id, detail.version, {});
                  }}
                />
                <ConfirmOrganizationAction
                  label="Cancel pending approval operation"
                  description="Ask the source to cancel its pending approval operation before it commits. Committed exits cannot be undone."
                  busy={busy}
                  onConfirm={() => {
                    void send('separation_cancel_approval', id, detail.version, {});
                  }}
                />
              </div>
            ) : null}
            <OrganizationRecordTable
              label="Source exit clearance tasks"
              idKey="clearance_id"
              rows={records(detail.record.clearance)}
              fields={[
                { key: 'department', label: 'Department' },
                { key: 'task_name', label: 'Clearance task' },
                { key: 'is_cleared', label: 'Cleared' },
                { key: 'cleared_at', label: 'Cleared at' },
              ]}
              renderAction={(record) => (
                <ConfirmOrganizationAction
                  label={record.is_cleared === true ? 'Reopen clearance' : 'Confirm clearance'}
                  description="Update this source company clearance task with your organization identity."
                  busy={
                    company
                      ? resourcePending(scope, company.membershipId, text(record, 'clearance_id'))
                      : true
                  }
                  onConfirm={() => {
                    void send(
                      'clearance_update',
                      text(record, 'clearance_id'),
                      sourceVersion(record),
                      { is_cleared: record.is_cleared !== true }
                    );
                  }}
                />
              )}
            />
          </div>
        ) : null}
      </OrganizationQueryState>
    </Card>
  );
};

export default OrganizationSeparationDetails;
