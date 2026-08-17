import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import AssetPager from './AssetPager';
import AssetSectionToolbar from './AssetSectionToolbar';
import AssetStatusBadge from './AssetStatusBadge';
import type { AssetAssignmentRow, AssetPageInfo, PageFilter } from './assetTypes';

interface AssetAllocationsSectionProps {
  rows: AssetAssignmentRow[];
  filter: PageFilter;
  pageInfo: AssetPageInfo;
  loading: boolean;
  error?: string | null;
  canManage: boolean;
  canReadInventory: boolean;
  onFilterChange: (filter: PageFilter) => void;
  onAssign: () => void;
  onReturn: (row: AssetAssignmentRow) => void;
}

export default function AssetAllocationsSection(props: AssetAllocationsSectionProps) {
  const columns = [
    {
      key: 'assetName',
      label: 'Asset',
      render: (row: AssetAssignmentRow) => (
        <div>
          <p className="font-medium">{row.assetName}</p>
          <p className="text-xs text-slate-500">
            {[row.assetTag && `Tag ${row.assetTag}`, row.serialNumber && `S/N ${row.serialNumber}`]
              .filter(Boolean)
              .join(' · ') || 'No tag or serial number'}
          </p>
        </div>
      ),
    },
    ...(props.canReadInventory
      ? [
          {
            key: 'employee',
            label: 'Employee',
            render: (row: AssetAssignmentRow) => (
              <div>
                <p>{row.employeeName || 'Unknown employee'}</p>
                <p className="text-xs text-slate-500">{row.employeeCode || row.employeeId}</p>
              </div>
            ),
          },
        ]
      : []),
    { key: 'allocatedOn', label: 'Allocated on' },
    {
      key: 'expectedReturnOn',
      label: 'Expected return',
      render: (row: AssetAssignmentRow) => row.expectedReturnOn || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: AssetAssignmentRow) => <AssetStatusBadge status={row.status} />,
    },
    ...(props.canManage
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row: AssetAssignmentRow) => (
              <Button size="sm" variant="outline" onClick={() => props.onReturn(row)}>
                Record return
              </Button>
            ),
          },
        ]
      : []),
  ];
  return (
    <Card title={props.canReadInventory ? 'Active Assignments' : 'My Assigned Assets'}>
      <AssetSectionToolbar
        search={props.filter.search}
        placeholder="Asset, tag, serial, or employee"
        loading={props.loading}
        actionLabel={props.canManage ? 'Assign Asset' : undefined}
        onAction={props.onAssign}
        onSearch={(search) => props.onFilterChange({ ...props.filter, page: 1, search })}
      />
      {props.error ? (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{props.error}</p>
      ) : null}
      <Table
        data={props.rows}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={props.loading && props.rows.length === 0}
        emptyMessage="No active asset assignments found."
      />
      <AssetPager
        pageInfo={props.pageInfo}
        loading={props.loading}
        onPageChange={(page) => props.onFilterChange({ ...props.filter, page })}
      />
    </Card>
  );
}
