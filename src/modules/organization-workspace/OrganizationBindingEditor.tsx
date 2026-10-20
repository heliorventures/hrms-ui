import { useState } from 'react';

import { GrantOrganizationRoleDocument } from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';

import { requiredString, type OrganizationRecord } from './organizationDocuments';
import OrganizationEmploymentPicker from './OrganizationEmploymentPicker';
import type { OrganizationScope } from './organizationTypes';
import { useOrganizationAction } from './useOrganizationAction';

interface Props {
  scope: OrganizationScope;
  roles: OrganizationRecord[];
  version: number;
}
const OrganizationBindingEditor = ({ scope, roles, version }: Props) => {
  const [subject, setSubject] = useState<OrganizationRecord | null>(null);
  const [roleId, setRoleId] = useState('');
  const [memberships, setMemberships] = useState<string[]>([]);
  const action = useOrganizationAction(scope.refreshAccess);
  const changeCompany = (id: string, enabled: boolean) =>
    setMemberships((previous) =>
      enabled ? [...previous, id] : previous.filter((item) => item !== id)
    );
  const grant = () => {
    if (subject)
      void action.run(() =>
        scope.client.request(GrantOrganizationRoleDocument, {
          organizationId: scope.organization.id,
          expectedVersion: version,
          principalId: requiredString(subject, 'principal_id'),
          roleId,
          companyMembershipIds: memberships,
        })
      );
  };
  return (
    <Card title="Grant an existing role">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          grant();
        }}
      >
        <OrganizationEmploymentPicker
          scope={scope}
          label="Recipient organization identity"
          value={subject ? requiredString(subject, 'id') : ''}
          onChange={setSubject}
        />
        {subject ? (
          <p className="break-all text-xs text-content-secondary">
            Organization principal: {requiredString(subject, 'principal_id')}. This is a verified
            identity reference, separate from a company login user.
          </p>
        ) : null}
        <Select
          label="Organization role"
          required
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
          options={[
            { value: '', label: 'Choose an existing role' },
            ...roles
              .filter((role) => role.status === 'ACTIVE')
              .map((role) => ({
                value: requiredString(role, 'id'),
                label: requiredString(role, 'name'),
              })),
          ]}
        />
        <fieldset className="space-y-2">
          <legend className="font-medium">Explicit business company scope</legend>
          <p className="text-sm text-content-secondary">
            Select companies for business capabilities. Leave empty only for roles containing
            organization metadata capabilities exclusively.
          </p>
          {scope.companies
            .filter((company) => company.status === 'ACTIVE')
            .map((company) => (
              <label key={company.membershipId} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={memberships.includes(company.membershipId)}
                  onChange={(event) => changeCompany(company.membershipId, event.target.checked)}
                />
                {company.name}
              </label>
            ))}
        </fieldset>
        {action.error ? <p role="alert">{action.error}</p> : null}
        <Button type="submit" disabled={!subject || !roleId} busy={action.busy}>
          Grant role
        </Button>
      </form>
    </Card>
  );
};

export default OrganizationBindingEditor;
