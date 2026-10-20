import { useState } from 'react';

import {
  CreateOrganizationRoleDocument,
  EmployeeScope,
  ReplaceOrganizationRoleDocument,
  type RoleCapability,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import { OrganizationDataError } from './organizationDataError';
import {
  asRecord,
  optionalString,
  requiredString,
  sourceVersion,
  type OrganizationRecord,
} from './organizationDocuments';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';

const SCOPES = [
  { value: EmployeeScope.SelfOnly, label: 'Self only' },
  { value: EmployeeScope.Team, label: 'Assigned team' },
  { value: EmployeeScope.Department, label: 'Assigned department' },
  { value: EmployeeScope.All, label: 'Entire selected company' },
];
const metadataCapability = (code: string) =>
  code === 'organization:manage' || code === 'organization:delegate';
const fromSourceScope = (value: string): EmployeeScope => {
  switch (value) {
    case 'SELF':
    case 'SELF_ONLY':
      return EmployeeScope.SelfOnly;
    case 'TEAM':
      return EmployeeScope.Team;
    case 'DEPARTMENT':
      return EmployeeScope.Department;
    case 'ALL':
      return EmployeeScope.All;
    default:
      throw new OrganizationDataError('Unsupported role scope. Refresh organization data.');
  }
};
const existingCapabilities = (role?: OrganizationRecord): RoleCapability[] => {
  if (!role) return [];
  if (!Array.isArray(role.capabilities))
    throw new OrganizationDataError('Role capabilities are unavailable.');
  return role.capabilities.map((value) => {
    const capability = asRecord(value);
    return {
      code: requiredString(capability, 'capability_code'),
      employeeScope: fromSourceScope(requiredString(capability, 'employee_scope')),
    };
  });
};

interface Props {
  scope: OrganizationScope;
  version: number;
  catalog: string[];
  role?: OrganizationRecord;
  onClose: () => void;
}
const OrganizationRoleEditor = ({ scope, version, catalog, role, onClose }: Props) => {
  const [name, setName] = useState(role ? requiredString(role, 'name') : '');
  const [capabilities, setCapabilities] = useState<RoleCapability[]>(() =>
    existingCapabilities(role)
  );
  const action = useOrganizationAction(() => {
    onClose();
    scope.refreshAccess();
  });
  const toggle = (code: string, enabled: boolean) =>
    setCapabilities((previous) =>
      enabled
        ? [
            ...previous,
            {
              code,
              employeeScope: metadataCapability(code) ? EmployeeScope.All : EmployeeScope.SelfOnly,
            },
          ]
        : previous.filter((item) => item.code !== code)
    );
  const setScope = (code: string, employeeScope: string) =>
    setCapabilities((previous) =>
      previous.map((item) =>
        item.code === code ? { ...item, employeeScope: fromSourceScope(employeeScope) } : item
      )
    );
  const save = () =>
    action.run(async () => {
      const common = {
        organizationId: scope.organization.id,
        expectedVersion: version,
        capabilities,
      };
      if (role)
        return scope.client.request(ReplaceOrganizationRoleDocument, {
          ...common,
          roleId: requiredString(role, 'id'),
          expectedRoleVersion: sourceVersion(role),
        });
      return scope.client.request(CreateOrganizationRoleDocument, { ...common, name });
    });
  return (
    <Card
      title={
        role ? `Edit role: ${optionalString(role, 'name') ?? ''}` : 'Create an organization role'
      }
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Input
          label="Role name"
          required
          value={name}
          readOnly={Boolean(role)}
          maxLength={160}
          onChange={(event) => setName(event.target.value)}
        />
        <p className="text-sm text-content-secondary">
          Organization metadata rights do not include payroll. Select every business capability and
          employee scope explicitly.
        </p>
        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium">Capabilities and scope</legend>
          {catalog.map((code) => {
            const selected = capabilities.find((item) => item.code === code);
            return (
              <div
                key={code}
                className="flex flex-wrap items-center gap-3 rounded border border-line p-2"
              >
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(selected)}
                    onChange={(event) => toggle(code, event.target.checked)}
                  />
                  {code}
                </label>
                {selected ? (
                  <Select
                    label={`Employee scope for ${code}`}
                    value={selected.employeeScope}
                    disabled={metadataCapability(code)}
                    options={
                      metadataCapability(code)
                        ? [{ value: EmployeeScope.All, label: 'Organization metadata' }]
                        : SCOPES
                    }
                    onChange={(event) => setScope(code, event.target.value)}
                  />
                ) : null}
              </div>
            );
          })}
        </fieldset>
        {action.error ? <p role="alert">{action.error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" busy={action.busy} disabled={capabilities.length === 0}>
            Save role
          </Button>
          <Button variant="quiet" disabled={action.busy} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default OrganizationRoleEditor;
