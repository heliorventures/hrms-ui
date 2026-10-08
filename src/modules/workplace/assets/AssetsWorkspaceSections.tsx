import { useContext } from 'react';

import Select from '../../../components/common/Select';
import { usePageTabs } from '../../../hooks/usePageTabs';
import { PageWorkspaceContext } from '../../../navigation/pageWorkspaceContext';

import AssetAllocationsSection from './AssetAllocationsSection';
import AssetCategorySection from './AssetCategorySection';
import AssetHistorySection from './AssetHistorySection';
import AssetInventorySection from './AssetInventorySection';
import type { AssetRow, AssetCategoryRow, AssetAssignmentRow } from './assetTypes';
import type { AssetsWorkspaceModel } from './useAssetsWorkspace';

interface WorkspaceSectionsProps {
  model: AssetsWorkspaceModel;
  canManageAssets: boolean;
  canReadInventory: boolean;
  onCreateAsset: () => void;
  onEditAsset: (row: AssetRow) => void;
  onRetireAsset: (row: AssetRow) => void;
  onCreateCategory: () => void;
  onEditCategory: (row: AssetCategoryRow) => void;
  onRetireCategory: (row: AssetCategoryRow) => void;
  onAssign: () => void;
  onReturn: (row: AssetAssignmentRow) => void;
}

const InventoryPanels = (props: WorkspaceSectionsProps & { activeTab: string }) => {
  const { model, canManageAssets, canReadInventory, activeTab } = props;
  if (!canReadInventory) return null;
  return (
    <>
      <div
        role="tabpanel"
        id="asset-inventory"
        aria-label="inventory"
        hidden={activeTab !== 'inventory'}
        tabIndex={0}
      >
        <AssetInventorySection
          rows={model.inventory}
          categories={model.categoryOptions}
          categoryFilter={model.categoryOptionFilter}
          categoryPageInfo={model.categoryOptionPageInfo}
          categoryLoading={model.loading.categoryOptions}
          categoryError={model.errors.categoryOptions}
          filter={model.inventoryFilter}
          pageInfo={model.inventoryPageInfo}
          loading={model.loading.inventory}
          error={model.errors.inventory}
          canManage={canManageAssets}
          onFilterChange={model.setInventoryFilter}
          onCategoryFilterChange={model.setCategoryOptionFilter}
          onCreate={props.onCreateAsset}
          onEdit={props.onEditAsset}
          onRetire={props.onRetireAsset}
        />
      </div>
      <div
        role="tabpanel"
        id="asset-categories"
        aria-label="categories"
        hidden={activeTab !== 'categories'}
        tabIndex={0}
      >
        <AssetCategorySection
          rows={model.categories}
          filter={model.categoryFilter}
          pageInfo={model.categoryPageInfo}
          loading={model.loading.categories}
          error={model.errors.categories}
          canManage={canManageAssets}
          onFilterChange={model.setCategoryFilter}
          onCreate={props.onCreateCategory}
          onEdit={props.onEditCategory}
          onRetire={props.onRetireCategory}
        />
      </div>
    </>
  );
};

const AssetsWorkspaceSections = (props: WorkspaceSectionsProps) => {
  const { model, canManageAssets, canReadInventory } = props;
  const workspace = useContext(PageWorkspaceContext);
  const tabs = [
    ...(canReadInventory
      ? [{ id: 'inventory', label: 'Inventory', panelId: 'asset-inventory' }]
      : []),
    {
      id: 'assignments',
      label: canReadInventory ? 'Assignments & Returns' : 'My Assets',
      panelId: 'asset-assignments',
    },
    { id: 'history', label: 'History', panelId: 'asset-history' },
    ...(canReadInventory
      ? [{ id: 'categories', label: 'Categories', panelId: 'asset-categories' }]
      : []),
  ];
  const { tab: activeTab, setTab: setSelectedTab } = usePageTabs(tabs);
  return (
    <>
      <div data-tour-anchor="assets.sections">
        {!workspace && (
          <Select
            aria-label="Asset section"
            value={activeTab}
            onChange={(event) => setSelectedTab(event.target.value)}
            options={tabs.map((tab) => ({ value: tab.id, label: tab.label }))}
          />
        )}
      </div>

      <InventoryPanels {...props} activeTab={activeTab} />

      <div
        role="tabpanel"
        id="asset-assignments"
        aria-label="assignments"
        hidden={activeTab !== 'assignments'}
        tabIndex={0}
      >
        <AssetAllocationsSection
          rows={model.activeAssignments}
          filter={model.allocationFilter}
          pageInfo={model.allocationPageInfo}
          loading={model.loading.allocations}
          error={model.errors.allocations}
          canManage={canManageAssets}
          canReadInventory={canReadInventory}
          onFilterChange={model.setAllocationFilter}
          onAssign={props.onAssign}
          onReturn={props.onReturn}
        />
      </div>
      <div
        role="tabpanel"
        id="asset-history"
        aria-label="history"
        hidden={activeTab !== 'history'}
        tabIndex={0}
      >
        <AssetHistorySection
          rows={model.history}
          filter={model.historyFilter}
          pageInfo={model.historyPageInfo}
          loading={model.loading.history}
          error={model.errors.history}
          canReadInventory={canReadInventory}
          onFilterChange={model.setHistoryFilter}
        />
      </div>
    </>
  );
};

export default AssetsWorkspaceSections;
