import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import AssetPager from './AssetPager';
import AssetOptionPicker from './AssetOptionPicker';
import AssetSectionToolbar from './AssetSectionToolbar';
import AssetStatusBadge from './AssetStatusBadge';
import type {
  AssetCategoryRow,
  AssetPageInfo,
  AssetRow,
  InventoryFilter,
  PageFilter,
} from './assetTypes';

interface AssetInventorySectionProps {
  rows: AssetRow[];
  categories: AssetCategoryRow[];
  categoryFilter: PageFilter;
  categoryPageInfo: AssetPageInfo;
  categoryLoading: boolean;
  categoryError?: string | null;
  filter: InventoryFilter;
  pageInfo: AssetPageInfo;
  loading: boolean;
  error?: string | null;
  canManage: boolean;
  onFilterChange: (filter: InventoryFilter) => void;
  onCategoryFilterChange: (filter: PageFilter) => void;
  onCreate: () => void;
  onEdit: (row: AssetRow) => void;
  onRetire: (row: AssetRow) => void;
}

export default function AssetInventorySection(props: AssetInventorySectionProps) {
  const columns = [
    {
      key: 'name',
      label: 'Asset',
      render: (row: AssetRow) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-slate-500">{row.categoryName || 'Uncategorized'}</p>
        </div>
      ),
    },
    { key: 'assetTag', label: 'Tag', render: (row: AssetRow) => row.assetTag || '—' },
    {
      key: 'serialNumber',
      label: 'Serial no.',
      render: (row: AssetRow) => row.serialNumber || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: AssetRow) => <AssetStatusBadge status={row.status} />,
    },
    {
      key: 'purchaseValue',
      label: 'Purchase value',
      render: (row: AssetRow) => row.purchaseValue || '—',
    },
    ...(props.canManage
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row: AssetRow) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={row.status !== 'AVAILABLE'}
                  onClick={() => props.onEdit(row)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={row.status !== 'AVAILABLE'}
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
    <Card title="Asset Inventory">
      <AssetSectionToolbar
        search={props.filter.search}
        placeholder="Name, tag, or serial number"
        loading={props.loading}
        actionLabel={props.canManage ? 'New Asset' : undefined}
        onAction={props.onCreate}
        onSearch={(search) => props.onFilterChange({ ...props.filter, page: 1, search })}
      >
        <div className="flex flex-wrap gap-2">
          <AssetOptionPicker
            label="Category"
            value={props.filter.categoryId}
            options={props.categories.map((row) => ({ value: row.id, label: row.name }))}
            filter={props.categoryFilter}
            pageInfo={props.categoryPageInfo}
            loading={props.categoryLoading}
            error={props.categoryError}
            emptyLabel="All categories"
            onChange={(categoryId) =>
              props.onFilterChange({ ...props.filter, page: 1, categoryId })
            }
            onFilterChange={props.onCategoryFilterChange}
          />
          <Select
            aria-label="Filter inventory by status"
            value={props.filter.status}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'ASSIGNED', label: 'Assigned' },
              { value: 'RETIRED', label: 'Retired' },
            ]}
            onChange={(event) =>
              props.onFilterChange({ ...props.filter, page: 1, status: event.target.value })
            }
          />
        </div>
      </AssetSectionToolbar>
      {props.error ? (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{props.error}</p>
      ) : null}
      <Table
        data={props.rows}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={props.loading && props.rows.length === 0}
        emptyMessage="No assets match the selected filters."
      />
      <AssetPager
        pageInfo={props.pageInfo}
        loading={props.loading}
        onPageChange={(page) => props.onFilterChange({ ...props.filter, page })}
      />
    </Card>
  );
}
