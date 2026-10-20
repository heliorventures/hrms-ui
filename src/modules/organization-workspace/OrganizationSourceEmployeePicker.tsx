import {
  OrganizationDirectoryDocument,
  OrganizationOperation,
} from '../../api/organization/graphql';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';

import { requiredString, type OrganizationRecord } from './organizationDocuments';
import OrganizationPager from './OrganizationPager';
import OrganizationQueryState from './OrganizationQueryState';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationPage } from './useOrganizationPage';
import { useOrganizationSourceList } from './useOrganizationSourceList';

interface Props {
  scope: OrganizationScope;
  value: string;
  onChange: (record: OrganizationRecord | null) => void;
}

const DirectoryEmployeePicker = ({ scope, value, onChange }: Props) => {
  const { company } = scope;
  const query = useOrganizationPage(
    company ? `${organizationScopeKey(scope)}|source-employee-picker` : null,
    async (after) =>
      (
        await scope.client.request(OrganizationDirectoryDocument, {
          organizationId: scope.organization.id,
          membershipId: company?.membershipId ?? '',
          after,
          first: 50,
        })
      ).organizationDirectory
  );
  const changePage = (change: () => void) => {
    onChange(null);
    change();
  };
  return (
    <OrganizationQueryState {...query} onRetry={query.refresh}>
      <Select
        label="Source employee"
        value={value}
        onChange={(event) =>
          onChange(
            query.data?.items.find((record) => record.employee_id === event.target.value) ?? null
          )
        }
        options={[
          { value: '', label: 'Select an employee' },
          ...(query.data?.items ?? []).map((record) => ({
            value: requiredString(record, 'employee_id'),
            label: `${requiredString(record, 'display_name')} (${requiredString(record, 'employee_code')})`,
          })),
        ]}
      />
      <OrganizationPager
        {...query}
        busy={query.loading}
        hasNext={query.data?.hasNextPage ?? false}
        next={() => changePage(query.next)}
        previous={() => changePage(query.previous)}
      />
    </OrganizationQueryState>
  );
};

const FreshEmployeePicker = ({ scope, value, onChange }: Props) => {
  const query = useOrganizationSourceList(scope, OrganizationOperation.EmployeeList, 'employees');
  const changePage = (change: () => void) => {
    onChange(null);
    change();
  };
  return (
    <OrganizationQueryState {...query} onRetry={query.refresh}>
      <Select
        label="Source employee"
        value={value}
        onChange={(event) =>
          onChange(
            query.data?.rows.find((record) => record.employee_id === event.target.value) ?? null
          )
        }
        options={[
          { value: '', label: 'Select an employee' },
          ...(query.data?.rows ?? []).map((record) => ({
            value: requiredString(record, 'employee_id'),
            label: `${requiredString(record, 'display_name')} (${requiredString(record, 'employee_code')})`,
          })),
        ]}
      />
      <OrganizationPager
        canPrevious={query.hasPrevious}
        hasNext={query.data?.record.has_more === true}
        busy={query.loading}
        next={() => changePage(query.next)}
        previous={() => changePage(query.previous)}
      />
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => changePage(query.refresh)}
      >
        Refresh source employees
      </Button>
    </OrganizationQueryState>
  );
};

const OrganizationSourceEmployeePicker = (props: Props) =>
  props.scope.company?.capabilities.includes('employee:manage') ? (
    <FreshEmployeePicker {...props} />
  ) : (
    <DirectoryEmployeePicker {...props} />
  );

export default OrganizationSourceEmployeePicker;
