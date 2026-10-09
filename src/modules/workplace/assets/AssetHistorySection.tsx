import Card from '../../../components/common/Card';
import FeedbackToast from '../../../components/common/FeedbackToast';
import Table from '../../../components/common/Table';

import AssetPager from './AssetPager';
import AssetSectionToolbar from './AssetSectionToolbar';
import type { AssetAssignmentRow, AssetPageInfo, PageFilter } from './assetTypes';

interface AssetHistorySectionProps {
  rows: AssetAssignmentRow[];
  filter: PageFilter;
  pageInfo: AssetPageInfo;
  loading: boolean;
  error?: string | null;
  canReadInventory: boolean;
  onFilterChange: (filter: PageFilter) => void;
}

export default function AssetHistorySection(props: AssetHistorySectionProps) {
  const columns = [
    { key: 'assetName', label: 'Asset' },
    ...(props.canReadInventory
      ? [
          {
            key: 'employee',
            label: 'Employee',
            render: (row: AssetAssignmentRow) =>
              `${row.employeeName || 'Unknown employee'}${row.employeeCode ? ` (${row.employeeCode})` : ''}`,
          },
        ]
      : []),
    { key: 'allocatedOn', label: 'Allocated on' },
    {
      key: 'returnedOn',
      label: 'Returned on',
      render: (row: AssetAssignmentRow) => row.returnedOn || '—',
    },
    {
      key: 'conditionAtReturn',
      label: 'Return condition',
      render: (row: AssetAssignmentRow) => row.conditionAtReturn || '—',
    },
    {
      key: 'returnRemarks',
      label: 'Remarks',
      render: (row: AssetAssignmentRow) => row.returnRemarks || '—',
    },
  ];
  return (
    <Card>
      <AssetSectionToolbar
        search={props.filter.search}
        placeholder="Asset, tag, serial, or employee"
        loading={props.loading}
        onSearch={(search) => props.onFilterChange({ ...props.filter, page: 1, search })}
      />
      {props.error ? (
        <FeedbackToast variant={'error'} messageKey={props.error}>
          {props.error}
        </FeedbackToast>
      ) : null}
      <Table
        data={props.rows}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={props.loading && props.rows.length === 0}
        emptyMessage="No returned asset history found."
      />
      <AssetPager
        pageInfo={props.pageInfo}
        loading={props.loading}
        onPageChange={(page) => props.onFilterChange({ ...props.filter, page })}
      />
    </Card>
  );
}
