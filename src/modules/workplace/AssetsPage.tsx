import { useState } from 'react';
import { PERMISSIONS } from '../../auth/permissions';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import AssetAllocationsSection from './assets/AssetAllocationsSection';
import AssetAssignmentModal from './assets/AssetAssignmentModal';
import AssetCategoryModal from './assets/AssetCategoryModal';
import AssetCategorySection from './assets/AssetCategorySection';
import AssetHistorySection from './assets/AssetHistorySection';
import AssetInventorySection from './assets/AssetInventorySection';
import AssetModal from './assets/AssetModal';
import AssetRetireDialog from './assets/AssetRetireDialog';
import AssetReturnModal from './assets/AssetReturnModal';
import { optionalString } from './assets/assetValidation';
import type {
  AssetAssignmentFormValues,
  AssetAssignmentRow,
  AssetCategoryFormValues,
  AssetCategoryRow,
  AssetFormValues,
  AssetReturnFormValues,
  AssetRow,
} from './assets/assetTypes';
import { useAssetsWorkspace } from './assets/useAssetsWorkspace';

type RetireTarget = { kind: 'asset'; row: AssetRow } | { kind: 'category'; row: AssetCategoryRow };

const AssetsPage = () => {
  const { can } = useAuth();
  const canManageAssets = can(PERMISSIONS.assetsManage);
  const canReadInventory = canManageAssets || can(PERMISSIONS.assetsRead);
  const model = useAssetsWorkspace({ canManageAssets, canReadInventory });
  const [categoryEditor, setCategoryEditor] = useState<AssetCategoryRow | null>();
  const [assetEditor, setAssetEditor] = useState<AssetRow | null>();
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [returnAssignment, setReturnAssignment] = useState<AssetAssignmentRow>();
  const [retireTarget, setRetireTarget] = useState<RetireTarget>();

  const openAction = (action: () => void) => {
    model.clearActionMessages();
    action();
  };
  const saveCategory = (values: AssetCategoryFormValues) =>
    model.saveCategory({
      id: categoryEditor?.id ?? null,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
    });
  const saveAsset = (values: AssetFormValues) =>
    model.saveAsset({
      id: assetEditor?.id ?? null,
      assetCategoryId: values.assetCategoryId,
      name: values.name.trim(),
      assetTag: optionalString(values.assetTag),
      serialNumber: optionalString(values.serialNumber),
      purchaseValue: optionalString(values.purchaseValue),
      purchaseDate: optionalString(values.purchaseDate),
      locationId: optionalString(values.locationId),
    });
  const assignAsset = (values: AssetAssignmentFormValues) =>
    model.assignAsset({
      assetId: values.assetId,
      employeeId: values.employeeId,
      allocatedOn: values.allocatedOn,
      expectedReturnOn: optionalString(values.expectedReturnOn),
      conditionAtAllocation: optionalString(values.conditionAtAllocation),
    });
  const returnAsset = (values: AssetReturnFormValues) => {
    if (!returnAssignment) return Promise.resolve(false);
    return model.returnAsset({
      assetAllocationId: returnAssignment.id,
      returnedOn: values.returnedOn,
      conditionAtReturn: optionalString(values.conditionAtReturn),
      remarks: optionalString(values.remarks),
    });
  };
  const confirmRetire = () => {
    if (!retireTarget) return Promise.resolve(false);
    return retireTarget.kind === 'asset'
      ? model.retireAsset(retireTarget.row.id)
      : model.retireCategory(retireTarget.row.id);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Management</h1>

      {model.actionError ? (
        <Card>
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {model.actionError}
          </p>
        </Card>
      ) : null}
      {model.actionOk ? (
        <Card>
          <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">
            {model.actionOk}
          </p>
        </Card>
      ) : null}
      {model.errors.locations ? (
        <Card>
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            Location options could not be loaded: {model.errors.locations}
          </p>
        </Card>
      ) : null}

      {canReadInventory ? (
        <>
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
            onCreate={() => openAction(() => setAssetEditor(null))}
            onEdit={(row) => openAction(() => setAssetEditor(row))}
            onRetire={(row) => openAction(() => setRetireTarget({ kind: 'asset', row }))}
          />
          <AssetCategorySection
            rows={model.categories}
            filter={model.categoryFilter}
            pageInfo={model.categoryPageInfo}
            loading={model.loading.categories}
            error={model.errors.categories}
            canManage={canManageAssets}
            onFilterChange={model.setCategoryFilter}
            onCreate={() => openAction(() => setCategoryEditor(null))}
            onEdit={(row) => openAction(() => setCategoryEditor(row))}
            onRetire={(row) => openAction(() => setRetireTarget({ kind: 'category', row }))}
          />
        </>
      ) : null}

      <AssetAllocationsSection
        rows={model.activeAssignments}
        filter={model.allocationFilter}
        pageInfo={model.allocationPageInfo}
        loading={model.loading.allocations}
        error={model.errors.allocations}
        canManage={canManageAssets}
        canReadInventory={canReadInventory}
        onFilterChange={model.setAllocationFilter}
        onAssign={() => openAction(() => setAssignmentOpen(true))}
        onReturn={(row) => openAction(() => setReturnAssignment(row))}
      />
      <AssetHistorySection
        rows={model.history}
        filter={model.historyFilter}
        pageInfo={model.historyPageInfo}
        loading={model.loading.history}
        error={model.errors.history}
        canReadInventory={canReadInventory}
        onFilterChange={model.setHistoryFilter}
      />

      {categoryEditor !== undefined ? (
        <AssetCategoryModal
          key={categoryEditor?.id ?? 'new-category'}
          editing={categoryEditor ?? undefined}
          saving={model.busyAction === 'category'}
          onClose={() => setCategoryEditor(undefined)}
          onSave={saveCategory}
        />
      ) : null}
      {assetEditor !== undefined ? (
        <AssetModal
          key={assetEditor?.id ?? 'new-asset'}
          editing={assetEditor ?? undefined}
          categories={model.categoryOptions}
          categoryFilter={model.categoryOptionFilter}
          categoryPageInfo={model.categoryOptionPageInfo}
          categoryLoading={model.loading.categoryOptions}
          categoryError={model.errors.categoryOptions}
          locations={model.locations}
          saving={model.busyAction === 'asset'}
          onClose={() => setAssetEditor(undefined)}
          onCategoryFilterChange={model.setCategoryOptionFilter}
          onSave={saveAsset}
        />
      ) : null}
      {assignmentOpen ? (
        <AssetAssignmentModal
          assets={model.availableAssets}
          employees={model.employees}
          employeeFilter={model.employeeOptionFilter}
          employeePageInfo={model.employeeOptionPageInfo}
          loadingAssets={model.assignmentAssetsLoading}
          loadingEmployees={model.loading.employeeOptions}
          assetError={model.assignmentAssetsError}
          employeeError={model.errors.employeeOptions}
          saving={model.busyAction === 'assign'}
          onSearchAssets={model.searchAvailableAssets}
          onEmployeeFilterChange={model.setEmployeeOptionFilter}
          onClose={() => setAssignmentOpen(false)}
          onSave={assignAsset}
        />
      ) : null}
      {returnAssignment ? (
        <AssetReturnModal
          key={returnAssignment.id}
          assignment={returnAssignment}
          saving={model.busyAction === 'return'}
          onClose={() => setReturnAssignment(undefined)}
          onSave={returnAsset}
        />
      ) : null}
      {retireTarget ? (
        <AssetRetireDialog
          key={`${retireTarget.kind}-${retireTarget.row.id}`}
          kind={retireTarget.kind}
          name={retireTarget.row.name}
          saving={model.busyAction === `retire-${retireTarget.kind}`}
          onClose={() => setRetireTarget(undefined)}
          onConfirm={confirmRetire}
        />
      ) : null}
    </div>
  );
};

export default AssetsPage;
