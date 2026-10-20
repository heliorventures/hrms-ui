import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { createCommandIntent } from './organizationCommand';
import type { OrganizationRecord } from './organizationDocuments';
import { text } from './organizationHrModel';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import OrganizationRecordTable from './OrganizationRecordTable';
import OrganizationSeparationDetails from './OrganizationSeparationDetails';
import { separationSubjectRow } from './organizationSeparationModel';
import OrganizationSourceEmployeePicker from './OrganizationSourceEmployeePicker';
import OrganizationSourceForm from './OrganizationSourceForm';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationSourceList } from './useOrganizationSourceList';

const OrganizationSeparationsAdmin = ({ scope }: { scope: OrganizationScope }) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [employee, setEmployee] = useState<OrganizationRecord | null>(null);
  const query = useOrganizationSourceList(
    scope,
    OrganizationOperation.SeparationList,
    'separations'
  );
  const create = async (values: Record<string, string>) => {
    if (!scope.company || !employee) return;
    await scope.commands.submit(
      scope.organization.id,
      scope.company.name,
      createCommandIntent(scope.company.membershipId, 'separation_create', crypto.randomUUID(), 1, {
        employee_id: text(employee, 'employee_id'),
        ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
      })
    );
    setCreating(false);
    query.refresh();
  };
  return (
    <div className="space-y-4">
      <Card title="Source employee exits">
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <OrganizationRecordTable
            label="Source employee exit requests"
            idKey="separation_id"
            rows={(query.data?.rows ?? []).map(separationSubjectRow)}
            fields={[
              { key: 'employee_subject', label: 'Employee' },
              { key: 'separation_type', label: 'Exit type' },
              { key: 'last_working_date', label: 'Last working date' },
              { key: 'status', label: 'Source status' },
            ]}
            renderAction={(record) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelected(record);
                  setCreating(false);
                }}
              >
                Review exit and clearance
              </Button>
            )}
          />
          <OrganizationPager
            canPrevious={query.hasPrevious}
            hasNext={query.data?.record.has_more === true}
            busy={query.loading}
            previous={query.previous}
            next={query.next}
          />
        </OrganizationQueryState>
        <Button
          variant="outline"
          onClick={() => {
            setSelected(null);
            setCreating(true);
          }}
        >
          Initiate employee exit
        </Button>
      </Card>
      {selected ? (
        <OrganizationSeparationDetails
          key={text(selected, 'separation_id')}
          scope={scope}
          selected={selected}
        />
      ) : null}
      {creating ? (
        <Card title="Initiate source employee exit">
          <div className="space-y-3">
            <OrganizationSourceEmployeePicker
              scope={scope}
              value={employee ? text(employee, 'employee_id') : ''}
              onChange={setEmployee}
            />
            {employee ? (
              <OrganizationSourceForm
                label="Submit source exit request"
                onSubmit={create}
                fields={[
                  {
                    key: 'separation_type',
                    label: 'Exit type',
                    required: true,
                    value: 'RESIGNATION',
                    options: [
                      { value: 'RESIGNATION', label: 'Resignation' },
                      { value: 'TERMINATION', label: 'Termination' },
                      { value: 'RETIREMENT', label: 'Retirement' },
                      { value: 'CONTRACT_END', label: 'Contract end' },
                    ],
                  },
                  { key: 'resignation_date', label: 'Resignation date', type: 'date' },
                  {
                    key: 'last_working_date',
                    label: 'Last working date',
                    type: 'date',
                    required: true,
                  },
                  { key: 'reason', label: 'Exit reason' },
                ]}
              />
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default OrganizationSeparationsAdmin;
