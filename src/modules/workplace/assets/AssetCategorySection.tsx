import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import AssetPager from './AssetPager';
import AssetSectionToolbar from './AssetSectionToolbar';
import AssetStatusBadge from './AssetStatusBadge';
import type { AssetCategoryRow, AssetPageInfo, PageFilter } from './assetTypes';

interface AssetCategorySectionProps {
  rows: AssetCategoryRow[];
  filter: PageFilter;
  pageInfo: AssetPageInfo;
  loading: boolean;
  error?: string | null;
  canManage: boolean;
  onFilterChange: (filter: PageFilter) => void;
  onCreate: () => void;
  onEdit: (row: AssetCategoryRow) => void;
  onRetire: (row: AssetCategoryRow) => void;
}

export default function AssetCategorySection(props: AssetCategorySectionProps) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code', render: (row: AssetCategoryRow) => row.code || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row: AssetCategoryRow) => (
        <AssetStatusBadge status={row.isActive ? 'ACTIVE' : 'RETIRED'} />
      ),
    },
    ...(props.canManage
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row: AssetCategoryRow) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!row.isActive}
                  onClick={() => props.onEdit(row)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={!row.isActive}
                  onClick={() => props.onRetire(row)}
                >
                  Retire
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];
  return (
    <Card title="Asset Categories">
      <AssetSectionToolbar
        search={props.filter.search}
        placeholder="Name or code"
        loading={props.loading}
        actionLabel={props.canManage ? 'New Category' : undefined}
        onAction={props.onCreate}
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
        emptyMessage="No asset categories found."
      />
      <AssetPager
        pageInfo={props.pageInfo}
        loading={props.loading}
        onPageChange={(page) => props.onFilterChange({ ...props.filter, page })}
      />
    </Card>
  );
}
