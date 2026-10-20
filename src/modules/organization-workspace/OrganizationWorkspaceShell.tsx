import { useEffect, useState } from 'react';

import { OrganizationCompaniesDocument } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';

import OrganizationAdministration from './OrganizationAdministration';
import { companyBusinessReady } from './organizationCompanyLifecycle';
import OrganizationHrAdministration from './OrganizationHrAdministration';
import OrganizationManagerRecords from './OrganizationManagerRecords';
import OrganizationPayroll from './OrganizationPayroll';
import OrganizationPendingRecovery from './OrganizationPendingRecovery';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationReporting from './OrganizationReporting';
import { organizationTasks, type OrganizationTask } from './organizationTasks';
import type {
  OrganizationClientScope,
  OrganizationCommands,
  OrganizationScope,
  OrganizationWorkspace,
} from './organizationTypes';
import { organizationScopeKey } from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';
import { useOrganizationQuery } from './useOrganizationQuery';

const WorkspaceTaskContent = ({
  scope,
  task,
}: {
  scope: OrganizationScope;
  task: OrganizationTask;
}) => {
  if (task === 'administration') return <OrganizationAdministration scope={scope} />;
  if (task === 'hr') return <OrganizationHrAdministration scope={scope} />;
  if (task === 'payroll') return <OrganizationPayroll scope={scope} />;
  if (task === 'progress' || task === 'history')
    return <OrganizationReporting scope={scope} mode={task} />;
  if (scope.company && !companyBusinessReady(scope.company))
    return (
      <Card>
        <p>
          This company awaits active source membership confirmation. Organization administrators can
          install its membership state in Company membership.
        </p>
      </Card>
    );
  return <OrganizationManagerRecords scope={scope} mode={task} />;
};

interface Props {
  access: OrganizationClientScope;
  organization: OrganizationWorkspace;
  commands: OrganizationCommands;
  refreshAccess: () => void;
}
const OrganizationWorkspaceShell = ({ access, organization, commands, refreshAccess }: Props) => {
  const [targetId, setTargetId] = useState('');
  const [selectedTask, setSelectedTask] = useState<OrganizationTask | null>(null);
  const companies = useOrganizationQuery(
    `${access.ownerKey}|${organization.id}|${organization.version}|companies`,
    async () =>
      (
        await access.client.request(OrganizationCompaniesDocument, {
          organizationId: organization.id,
        })
      ).organizationCompanies
  );
  const available = companies.data ?? [];
  const { retainCompanies } = commands;
  useEffect(() => {
    if (companies.data) retainCompanies(organization.id, companies.data);
  }, [companies.data, organization.id, retainCompanies]);
  const company =
    available.find((item) => item.membershipId === targetId && item.status === 'ACTIVE') ?? null;
  const tasks = organizationTasks(organization, available.filter(companyBusinessReady));
  const firstTask = tasks.length > 0 ? tasks[0].value : null;
  const task = tasks.find((item) => item.value === selectedTask)?.value ?? firstTask;
  const scope: OrganizationScope = {
    ...access,
    organization,
    companies: available,
    company,
    commands,
    refreshAccess,
  };
  return (
    <OrganizationQueryState {...companies} onRetry={companies.refresh}>
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-0 max-w-md">
            <Select
              fullWidth
              className="min-w-0"
              label="Business target company"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              options={[
                { value: '', label: 'All authorized companies / select a target for actions' },
                ...available
                  .filter((item) => item.status === 'ACTIVE')
                  .map((item) => ({
                    value: item.membershipId,
                    label: `${item.name}${companyBusinessReady(item) ? '' : ' (source setup pending)'}`,
                  })),
              ]}
            />
          </div>
          {company ? <SourceCompanyLabel name={company.name} tenantId={company.tenantId} /> : null}
        </div>
        <p className="mt-2 text-sm text-content-secondary">
          Actions are sent to the selected source company. Organization administration requires
          separate business grants for payroll and employee workflows.
        </p>
        <nav aria-label="Organization tasks" className="mt-3 flex flex-wrap gap-2">
          {tasks.map((item) => (
            <Button
              key={item.value}
              variant={task === item.value ? 'primary' : 'outline'}
              aria-current={task === item.value ? 'page' : undefined}
              onClick={() => setSelectedTask(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </Card>
      <OrganizationPendingRecovery scope={scope}>
        {task ? (
          <WorkspaceTaskContent
            key={`${organizationScopeKey(scope)}|${task}`}
            scope={scope}
            task={task}
          />
        ) : (
          <Card>
            <p>No organization tasks are granted to this identity.</p>
          </Card>
        )}
      </OrganizationPendingRecovery>
    </OrganizationQueryState>
  );
};

export default OrganizationWorkspaceShell;
