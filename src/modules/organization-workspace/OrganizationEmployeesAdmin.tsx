import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { createCommandIntent } from './organizationCommand';
import { asRecord, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import OrganizationEmployeeLoginForm from './OrganizationEmployeeLoginForm';
import { optionRecords, readHrResource, text } from './organizationHrModel';
import OrganizationQueryState from './OrganizationQueryState';
import { latestSourceVersion, resourcePending } from './organizationResource';
import OrganizationSourceEmployeePicker from './OrganizationSourceEmployeePicker';
import OrganizationSourceForm, { type SourceField } from './OrganizationSourceForm';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

const options = (values: unknown) =>
  Array.isArray(values)
    ? values
        .filter((value): value is string => typeof value === 'string')
        .map((value) => ({ value, label: value.replace(/_/g, ' ') }))
    : [];

function employeeFields(
  record: OrganizationRecord,
  refs: OrganizationRecord,
  create: boolean
): SourceField[] {
  return [
    ...(create
      ? [
          { key: 'employee_code', label: 'Employee code', required: true },
          { key: 'date_of_joining', label: 'Joining date', type: 'date' as const, required: true },
        ]
      : []),
    { key: 'first_name', label: 'First name', required: true, value: text(record, 'first_name') },
    { key: 'last_name', label: 'Last name', required: true, value: text(record, 'last_name') },
    {
      key: 'department_id',
      label: 'Department',
      value: text(record, 'department_id'),
      options: [
        { value: '', label: 'No change / unspecified' },
        ...optionRecords(refs.departments, 'id', 'name'),
      ],
    },
    {
      key: 'designation_id',
      label: 'Designation',
      value: text(record, 'designation_id'),
      options: [
        { value: '', label: 'No change / unspecified' },
        ...optionRecords(refs.designations, 'id', 'name'),
      ],
    },
    {
      key: 'employment_type',
      label: 'Employment type',
      value: text(record, 'employment_type'),
      options: [{ value: '', label: 'No change / unspecified' }, ...options(refs.employment_types)],
    },
  ];
}

const EmployeeEditor = ({
  scope,
  record,
  version,
  refs,
  onSaved,
}: {
  scope: OrganizationScope;
  record: OrganizationRecord;
  version: number;
  refs: OrganizationRecord;
  onSaved: () => void;
}) => {
  const { company } = scope;
  if (!company) return null;
  const id = text(record, 'employee_id');
  const creating = !id;
  const submit = async (values: Record<string, string>, employment = false) => {
    const payload = Object.fromEntries(
      Object.entries(values).filter(
        ([field, value]) =>
          value !== '' &&
          (!['department_id', 'designation_id', 'employment_type'].includes(field) ||
            value !== text(record, field))
      )
    );
    let operation: 'employee_employment' | 'employee_create' | 'employee_update' = creating
      ? 'employee_create'
      : 'employee_update';
    if (employment) operation = 'employee_employment';
    await scope.commands.submit(
      scope.organization.id,
      company.name,
      createCommandIntent(
        company.membershipId,
        operation,
        id || crypto.randomUUID(),
        version,
        payload
      )
    );
    onSaved();
  };
  const busy = id ? resourcePending(scope, company.membershipId, id) : false;
  return (
    <div className="space-y-4">
      <OrganizationSourceForm
        fields={employeeFields(record, refs, creating)}
        label={creating ? 'Create employee in source company' : 'Save source employee'}
        busy={busy}
        onSubmit={submit}
      />
      {!creating ? (
        <OrganizationSourceForm
          fields={[
            {
              key: 'status',
              label: 'Employment status',
              value: text(record, 'status'),
              required: true,
              options: options(refs.statuses),
            },
          ]}
          label="Change source employment status"
          busy={busy}
          onSubmit={(values) => submit(values, true)}
        />
      ) : null}
      {id && record.has_login === false && company.capabilities.includes('role:manage') ? (
        <OrganizationEmployeeLoginForm
          scope={scope}
          employeeId={id}
          version={version}
          onSaved={onSaved}
        />
      ) : null}
      {record.has_login === true ? (
        <p className="text-sm">This employee already has a linked source login.</p>
      ) : null}
    </div>
  );
};

const OrganizationEmployeesAdmin = ({ scope }: { scope: OrganizationScope }) => {
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const { company } = scope;
  const id = selected ? text(selected, 'employee_id') : '';
  const version =
    selected && company
      ? latestSourceVersion(scope, company.membershipId, id, sourceVersion(selected))
      : 1;
  const references = useOrganizationQuery(
    company ? `${organizationScopeKey(scope)}|employee-references` : null,
    () =>
      readHrResource(
        scope,
        OrganizationOperation.EmployeeReferences,
        company?.membershipId ?? '',
        company?.version ?? 1
      )
  );
  const detail = useOrganizationQuery(
    id ? `${organizationScopeKey(scope)}|employee-detail|${id}|${version}` : null,
    () => readHrResource(scope, OrganizationOperation.EmployeeDetail, id, version)
  );
  const editor = creating ? { record: {}, version: 1 } : detail.data;
  return (
    <Card title="Source employee administration">
      <div className="space-y-4">
        <OrganizationSourceEmployeePicker
          scope={scope}
          value={id}
          onChange={(record) => {
            setSelected(record);
            setCreating(false);
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            setSelected(null);
            setCreating(true);
          }}
        >
          New source employee
        </Button>
        <OrganizationQueryState {...references} onRetry={references.refresh}>
          <OrganizationQueryState {...detail} onRetry={detail.refresh}>
            {references.data && editor ? (
              <EmployeeEditor
                key={`${id}|${editor.version}|${creating}`}
                scope={scope}
                record={editor.record}
                version={editor.version}
                refs={
                  editor.record.source_references
                    ? asRecord(editor.record.source_references)
                    : references.data.record
                }
                onSaved={() => {
                  setCreating(false);
                  detail.refresh();
                }}
              />
            ) : null}
          </OrganizationQueryState>
        </OrganizationQueryState>
      </div>
    </Card>
  );
};

export default OrganizationEmployeesAdmin;
