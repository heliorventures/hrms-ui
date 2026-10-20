import { useState } from 'react';

import { OrganizationDirectoryDocument } from '../../api/organization/graphql';
import Select from '../../components/common/Select';

import { optionalString, requiredString, type OrganizationRecord } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationPage } from './useOrganizationPage';

interface Props {
  scope: OrganizationScope;
  label: string;
  value: string;
  onChange: (record: OrganizationRecord | null) => void;
}
const OrganizationEmploymentPicker = ({ scope, label, value, onChange }: Props) => {
  const [companyId, setCompanyId] = useState('');
  const query = useOrganizationPage(
    companyId ? `${organizationScopeKey(scope)}|employment-picker|${companyId}` : null,
    async (after) =>
      (
        await scope.client.request(OrganizationDirectoryDocument, {
          organizationId: scope.organization.id,
          membershipId: companyId,
          after,
          first: 50,
        })
      ).organizationDirectory
  );
  const options =
    query.data?.items
      .filter((item) => optionalString(item, 'principal_id') !== null)
      .map((item) => ({
        value: requiredString(item, 'id'),
        label: `${requiredString(item, 'display_name')} — ${scope.companies.find((company) => company.membershipId === companyId)?.name ?? ''}`,
      })) ?? [];
  return (
    <fieldset className="space-y-2 rounded-lg border border-line p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <Select
        label={`${label}: employment company`}
        value={companyId}
        onChange={(event) => {
          setCompanyId(event.target.value);
          onChange(null);
        }}
        options={[
          { value: '', label: 'Choose a company' },
          ...scope.companies
            .filter((item) => item.status === 'ACTIVE')
            .map((item) => ({ value: item.membershipId, label: item.name })),
        ]}
      />
      {companyId ? (
        <OrganizationQueryState {...query} onRetry={query.refresh}>
          <Select
            label={`${label}: verified employment`}
            value={value}
            onChange={(event) =>
              onChange(query.data?.items.find((item) => item.id === event.target.value) ?? null)
            }
            options={[{ value: '', label: 'Choose a verified employment' }, ...options]}
          />
          <OrganizationPager
            {...query}
            busy={query.loading}
            hasNext={query.data?.hasNextPage ?? false}
            next={() => {
              onChange(null);
              query.next();
            }}
            previous={() => {
              onChange(null);
              query.previous();
            }}
          />
          {options.length === 0 ? (
            <p className="text-sm">
              No linked identities on this page. Verify account identity and synchronize the source
              directory before granting access.
            </p>
          ) : null}
        </OrganizationQueryState>
      ) : null}
    </fieldset>
  );
};

export default OrganizationEmploymentPicker;
