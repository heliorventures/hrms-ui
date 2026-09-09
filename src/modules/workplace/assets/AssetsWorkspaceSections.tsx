import { useState } from 'react';

import Tabs from '../../../components/common/Tabs';

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
        aria-labelledby="asset-inventory-tab"
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
        aria-labelledby="asset-categories-tab"
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
  const [selectedTab, setSelectedTab] = useState('inventory');
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
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : 'assignments';
  return (
    <>
      <Tabs tabs={tabs} value={activeTab} onValueChange={setSelectedTab} />

      <InventoryPanels {...props} activeTab={activeTab} />

      <div
        role="tabpanel"
        id="asset-assignments"
        aria-labelledby="asset-assignments-tab"
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
        aria-labelledby="asset-history-tab"
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
