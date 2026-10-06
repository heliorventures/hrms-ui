import { useCallback, useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';

import type { HrReportKind } from './reportDocuments';
import type { ClaimTravelFilterState } from './useClaimTravelReportFilters';
import { useReportFilterOptions } from './useReportFilterOptions';

interface Option {
  id: string;
  name: string;
}
interface Options {
  departments: Option[];
  locations: Option[];
  expenseCategories: Option[];
}
interface Props {
  kind: HrReportKind;
  filters: ClaimTravelFilterState;
  onClear: () => void;
}
const optionsDocument = `query ClaimTravelReportOptions($kind: HrReportKind!, $search: String) {
  claimTravelReportOptions(kind: $kind, search: $search, limit: 200) {
    departments { id name } locations { id name } expenseCategories { id name }
  }
}`;
const statuses = (values: string[]) => [
  { value: '', label: 'All' },
  ...values.map((value) => ({ value, label: value.replaceAll('_', ' ').toLowerCase() })),
];

const ClaimTravelReportFilters = ({ kind, filters, onClear }: Props) => {
  const client = useGraphClient('client');
  const [search, setSearch] = useState('');
  const load = useCallback(
    () =>
      client.request<{ claimTravelReportOptions: Options }>(optionsDocument, {
        kind,
        search: search.trim() || null,
      }),
    [client, kind, search]
  );
  const query = useRetainedQuery(load);
  const options = query.data?.claimTravelReportOptions;
  const namedOptions = useReportFilterOptions(options);
  const loading = query.phase === 'initial-loading' || query.phase === 'refreshing';
  const expense = kind === 'EXPENSE_CLAIMS';
  const { draft, updateDraft } = filters;
  return (
    <div
      className="space-y-3 rounded-xl border border-line bg-surface p-3"
      data-tour-anchor="admin.reports.claim-travel-filters"
    >
      <Input
        label="Find department, location or category"
        type="search"
        value={search}
        maxLength={200}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search available filter options"
      />
      {loading ? (
        <p role="status" className="text-xs">
          Loading filter options…
        </p>
      ) : null}
      {query.error ? (
        <p role="alert" className="text-sm text-status-danger">
          {query.error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Department"
          value={draft.departmentId ?? ''}
          disabled={!options || loading}
          options={namedOptions('departments', draft.departmentId)}
          onChange={(event) => updateDraft({ departmentId: event.target.value })}
        />
        <Select
          label="Location"
          value={draft.locationId ?? ''}
          disabled={!options || loading}
          options={namedOptions('locations', draft.locationId)}
          onChange={(event) => updateDraft({ locationId: event.target.value })}
        />
        {expense ? (
          <Select
            label="Expense category"
            value={draft.expenseCategoryId ?? ''}
            disabled={!options || loading}
            options={namedOptions('expenseCategories', draft.expenseCategoryId)}
            onChange={(event) => updateDraft({ expenseCategoryId: event.target.value })}
          />
        ) : null}
        <Select
          label="Approval status"
          value={draft.approvalStatus ?? ''}
          options={statuses(
            expense
              ? ['PENDING', 'APPROVED', 'PARTIAL_APPROVED', 'REJECTED']
              : ['PENDING', 'APPROVED', 'REJECTED']
          )}
          onChange={(event) => updateDraft({ approvalStatus: event.target.value })}
        />
        {expense ? (
          <Select
            label="Payment status"
            value={draft.paymentStatus ?? ''}
            options={statuses(['NONE', 'PENDING_PAYMENT', 'PAID'])}
            onChange={(event) => updateDraft({ paymentStatus: event.target.value })}
          />
        ) : (
          <Input
            label="Origin or destination"
            value={draft.routeSearch ?? ''}
            maxLength={200}
            onChange={(event) => updateDraft({ routeSearch: event.target.value })}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={filters.apply}>
          Apply report filters
        </Button>
        <Button
          size="sm"
          variant="quiet"
          onClick={() => {
            filters.clear();
            setSearch('');
            onClear();
          }}
        >
          Clear filters
        </Button>
      </div>
      <p className="text-xs text-content-secondary">
        Department and location use current employee assignments.{' '}
        {expense
          ? 'Expense dates are inclusive.'
          : 'Trips overlapping either date boundary are included.'}{' '}
        CSV uses the applied filters and supports up to 10,000 records.
      </p>
    </div>
  );
};

export default ClaimTravelReportFilters;
