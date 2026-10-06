import type { Dispatch, SetStateAction } from 'react';

import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

import type { CompanyLocation, LocationPage } from './companyLocationTypes';
interface Props {
  rows?: LocationPage;
  loading: boolean;
  busy: boolean;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  edit: (row: CompanyLocation) => void;
  retire: (row: CompanyLocation) => void;
}
const CompanyLocationsTable = ({ rows, loading, busy, page, setPage, edit, retire }: Props) => {
  return (
    <>
      {' '}
      <Table
        data={rows?.nodes ?? []}
        loading={loading}
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'name', label: 'Location', render: (row) => row.name },
          { key: 'city', label: 'City', render: (row) => row.city ?? '—' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (row.active ? 'Active' : 'Retired'),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) =>
              row.active ? (
                <div className="flex gap-2">
                  <Button variant="outline" disabled={busy} onClick={() => edit(row)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      retire(row);
                    }}
                  >
                    Retire
                  </Button>
                </div>
              ) : null,
          },
        ]}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="outline"
          disabled={!rows?.pageInfo.hasPrevPage || loading}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </Button>
        <span>
          {rows?.pageInfo.totalCount ?? 0} locations · page {page}
        </span>
        <Button
          variant="outline"
          disabled={!rows?.pageInfo.hasNextPage || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
};
export default CompanyLocationsTable;
