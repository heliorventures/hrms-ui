import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import OrganizationAuditActivity from './OrganizationAuditActivity';
import OrganizationCompaniesAdmin from './OrganizationCompaniesAdmin';
import OrganizationDirectoryAdmin from './OrganizationDirectoryAdmin';
import OrganizationRelationships from './OrganizationRelationships';
import OrganizationRolesAdmin from './OrganizationRolesAdmin';
import type { OrganizationScope } from './organizationTypes';

const AdministrationContent = ({ scope, task }: { scope: OrganizationScope; task: string }) => {
  if (task === 'roles') return <OrganizationRolesAdmin scope={scope} />;
  if (task === 'directory') return <OrganizationDirectoryAdmin scope={scope} />;
  if (!scope.organization.canManage) return null;
  if (task === 'companies') return <OrganizationCompaniesAdmin scope={scope} />;
  if (task === 'activity') return <OrganizationAuditActivity scope={scope} />;
  return <OrganizationRelationships scope={scope} />;
};

const OrganizationAdministration = ({ scope }: { scope: OrganizationScope }) => {
  const [task, setTask] = useState('roles');
  return (
    <div className="space-y-4">
      <Card>
        <nav aria-label="Organization administration" className="flex flex-wrap gap-2">
          {scope.organization.canManage ? (
            <Button
              variant={task === 'activity' ? 'primary' : 'outline'}
              onClick={() => setTask('activity')}
            >
              Configuration activity
            </Button>
          ) : null}
          {scope.organization.canManage ? (
            <Button
              variant={task === 'companies' ? 'primary' : 'outline'}
              onClick={() => setTask('companies')}
            >
              Company membership
            </Button>
          ) : null}
          <Button
            variant={task === 'roles' ? 'primary' : 'outline'}
            onClick={() => setTask('roles')}
          >
            Roles and grants
          </Button>
          <Button
            variant={task === 'directory' ? 'primary' : 'outline'}
            onClick={() => setTask('directory')}
          >
            Verified directory
          </Button>
          {scope.organization.canManage ? (
            <Button
              variant={task === 'relationships' ? 'primary' : 'outline'}
              onClick={() => setTask('relationships')}
            >
              Manager relationships
            </Button>
          ) : null}
        </nav>
      </Card>
      <AdministrationContent scope={scope} task={task} />
    </div>
  );
};

export default OrganizationAdministration;
