import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AssetAllocationsPageDocument,
  AssetCategoriesPageDocument,
  AssetInventoryPageDocument,
  AssetsEmployeeOptionsDocument,
  AssignAssetToEmployeeDocument,
  RetireAssetCategoryDocument,
  RetireAssetDocument,
  ReturnEmployeeAssetDocument,
  UpsertAssetCategoryDocument,
  UpsertAssetDocument,
  type AssetAllocationsPageQuery,
  type AssetCategoriesPageQuery,
  type AssetInventoryPageQuery,
  type AssetsEmployeeOptionsQuery,
  type AssignAssetInput,
  type ReturnAssetInput,
  type UpsertAssetCategoryInput,
  type UpsertAssetInput,
} from '../../../api/graphql/graphql';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type {
  AssetAssignmentRow,
  AssetCategoryRow,
  AssetRow,
  InventoryFilter,
  PageFilter,
} from './assetTypes';
import { emptyPageInfo } from './assetTypes';

const PAGE_SIZE = 15;
const initialPageFilter: PageFilter = { page: 1, perPage: PAGE_SIZE, search: '' };
const initialInventoryFilter: InventoryFilter = {
  ...initialPageFilter,
  categoryId: '',
  status: '',
};

interface UseAssetsWorkspaceOptions {
  canManageAssets: boolean;
  canReadInventory: boolean;
}

export function useAssetsWorkspace({
  canManageAssets,
  canReadInventory,
}: UseAssetsWorkspaceOptions) {
  const client = useGraphClient('client');
  const [categories, setCategories] = useState<AssetCategoryRow[]>([]);
  const [inventory, setInventory] = useState<AssetRow[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<AssetAssignmentRow[]>([]);
  const [history, setHistory] = useState<AssetAssignmentRow[]>([]);
  const [employees, setEmployees] = useState<AssetsEmployeeOptionsQuery['employees']>([]);
  const [locations, setLocations] = useState<AssetsEmployeeOptionsQuery['assetLocationOptions']>(
    []
  );
  const [assignmentAssets, setAssignmentAssets] = useState<AssetRow[]>([]);
  const [assignmentAssetsLoading, setAssignmentAssetsLoading] = useState(false);
  const [assignmentAssetsError, setAssignmentAssetsError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<PageFilter>(initialPageFilter);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>(initialInventoryFilter);
  const [allocationFilter, setAllocationFilter] = useState<PageFilter>(initialPageFilter);
  const [historyFilter, setHistoryFilter] = useState<PageFilter>(initialPageFilter);

  const [categoryPageInfo, setCategoryPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [inventoryPageInfo, setInventoryPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [allocationPageInfo, setAllocationPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [historyPageInfo, setHistoryPageInfo] = useState(emptyPageInfo(PAGE_SIZE));

  const [loading, setLoading] = useState({
    categories: canReadInventory,
    inventory: canReadInventory,
    allocations: true,
    history: true,
    options: canManageAssets,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);

  const setSectionLoading = useCallback((key: keyof typeof loading, value: boolean) => {
    setLoading((current) => ({ ...current, [key]: value }));
  }, []);
  const setSectionError = useCallback((key: string, value: string | null) => {
    setErrors((current) => ({ ...current, [key]: value }));
  }, []);

  const loadCategories = useCallback(async () => {
    const result = await client.request<AssetCategoriesPageQuery>(AssetCategoriesPageDocument, {
      page: { page: categoryFilter.page, perPage: categoryFilter.perPage },
      search: categoryFilter.search.trim() || null,
      activeOnly: false,
    });
    return result.assetCategoriesPage;
  }, [categoryFilter, client]);

  const loadInventory = useCallback(async () => {
    const result = await client.request<AssetInventoryPageQuery>(AssetInventoryPageDocument, {
      page: { page: inventoryFilter.page, perPage: inventoryFilter.perPage },
      search: inventoryFilter.search.trim() || null,
      categoryId: inventoryFilter.categoryId || null,
      status: inventoryFilter.status || null,
    });
    return result.assetInventoryPage;
  }, [client, inventoryFilter]);

  const loadAllocations = useCallback(async () => {
    const result = await client.request<AssetAllocationsPageQuery>(AssetAllocationsPageDocument, {
      page: { page: allocationFilter.page, perPage: allocationFilter.perPage },
      search: allocationFilter.search.trim() || null,
      employeeId: null,
      status: 'ACTIVE',
    });
    return result.assetAllocationsPage;
  }, [allocationFilter, client]);

  const loadHistory = useCallback(async () => {
    const result = await client.request<AssetAllocationsPageQuery>(AssetAllocationsPageDocument, {
      page: { page: historyFilter.page, perPage: historyFilter.perPage },
      search: historyFilter.search.trim() || null,
      employeeId: null,
      status: 'RETURNED',
    });
    return result.assetAllocationsPage;
  }, [client, historyFilter]);

  useEffect(() => {
    if (!canReadInventory) return;
    let cancelled = false;
    setSectionLoading('categories', true);
    setSectionError('categories', null);
    void loadCategories()
      .then((result) => {
        if (!cancelled) {
          setCategories(result.rows);
          setCategoryPageInfo(result.pageInfo);
        }
      })
      .catch((error) => !cancelled && setSectionError('categories', graphQlUserMessage(error)))
      .finally(() => !cancelled && setSectionLoading('categories', false));
    return () => {
      cancelled = true;
    };
  }, [canReadInventory, loadCategories, setSectionError, setSectionLoading]);

  useEffect(() => {
    if (!canReadInventory) return;
    let cancelled = false;
    setSectionLoading('inventory', true);
    setSectionError('inventory', null);
    void loadInventory()
      .then((result) => {
        if (!cancelled) {
          setInventory(result.rows);
          setInventoryPageInfo(result.pageInfo);
        }
      })
      .catch((error) => !cancelled && setSectionError('inventory', graphQlUserMessage(error)))
      .finally(() => !cancelled && setSectionLoading('inventory', false));
    return () => {
      cancelled = true;
    };
  }, [canReadInventory, loadInventory, setSectionError, setSectionLoading]);

  useEffect(() => {
    let cancelled = false;
    setSectionLoading('allocations', true);
    setSectionError('allocations', null);
    void loadAllocations()
      .then((result) => {
        if (!cancelled) {
          setActiveAssignments(result.rows);
          setAllocationPageInfo(result.pageInfo);
        }
      })
      .catch((error) => !cancelled && setSectionError('allocations', graphQlUserMessage(error)))
      .finally(() => !cancelled && setSectionLoading('allocations', false));
    return () => {
      cancelled = true;
    };
  }, [loadAllocations, setSectionError, setSectionLoading]);

  useEffect(() => {
    let cancelled = false;
    setSectionLoading('history', true);
    setSectionError('history', null);
    void loadHistory()
      .then((result) => {
        if (!cancelled) {
          setHistory(result.rows);
          setHistoryPageInfo(result.pageInfo);
        }
      })
      .catch((error) => !cancelled && setSectionError('history', graphQlUserMessage(error)))
      .finally(() => !cancelled && setSectionLoading('history', false));
    return () => {
      cancelled = true;
    };
  }, [loadHistory, setSectionError, setSectionLoading]);

  useEffect(() => {
    if (!canManageAssets) return;
    let cancelled = false;
    setSectionLoading('options', true);
    setSectionError('options', null);
    void client
      .request<AssetsEmployeeOptionsQuery>(AssetsEmployeeOptionsDocument, {
        employeeLimit: 300,
        locationLimit: 200,
      })
      .then((result: AssetsEmployeeOptionsQuery) => {
        if (!cancelled) {
          setEmployees(
            result.employees.filter((employee: AssetsEmployeeOptionsQuery['employees'][number]) =>
              ['ACTIVE', 'PROBATION'].includes(employee.status.trim().toUpperCase())
            )
          );
          setLocations(result.assetLocationOptions);
        }
      })
      .catch(
        (error: unknown) => !cancelled && setSectionError('options', graphQlUserMessage(error))
      )
      .finally(() => !cancelled && setSectionLoading('options', false));
    return () => {
      cancelled = true;
    };
  }, [canManageAssets, client, setSectionError, setSectionLoading]);

  const refreshCategories = useCallback(async () => {
    const result = await loadCategories();
    setCategories(result.rows);
    setCategoryPageInfo(result.pageInfo);
  }, [loadCategories]);
  const refreshInventory = useCallback(async () => {
    const result = await loadInventory();
    setInventory(result.rows);
    setInventoryPageInfo(result.pageInfo);
  }, [loadInventory]);
  const refreshAllocations = useCallback(async () => {
    const result = await loadAllocations();
    setActiveAssignments(result.rows);
    setAllocationPageInfo(result.pageInfo);
  }, [loadAllocations]);
  const refreshHistory = useCallback(async () => {
    const result = await loadHistory();
    setHistory(result.rows);
    setHistoryPageInfo(result.pageInfo);
  }, [loadHistory]);

  const searchAvailableAssets = useCallback(
    async (search = '') => {
      setAssignmentAssetsLoading(true);
      setAssignmentAssetsError(null);
      try {
        const result = await client.request<AssetInventoryPageQuery>(AssetInventoryPageDocument, {
          page: { page: 1, perPage: 50 },
          search: search.trim() || null,
          categoryId: null,
          status: 'AVAILABLE',
        });
        setAssignmentAssets(result.assetInventoryPage.rows);
      } catch (error) {
        setAssignmentAssetsError(graphQlUserMessage(error));
      } finally {
        setAssignmentAssetsLoading(false);
      }
    },
    [client]
  );

  const runAction = useCallback(
    async (
      key: string,
      successMessage: string,
      action: () => Promise<unknown>,
      refresh: () => Promise<unknown>
    ) => {
      setBusyAction(key);
      setActionError(null);
      setActionOk(null);
      try {
        await action();
        setActionOk(successMessage);
        try {
          await refresh();
        } catch (refreshError) {
          setActionError(
            `The change was saved, but the latest data could not be reloaded. Refresh the page before repeating the action. ${graphQlUserMessage(refreshError)}`
          );
        }
        return true;
      } catch (error) {
        setActionError(graphQlUserMessage(error));
        return false;
      } finally {
        setBusyAction(null);
      }
    },
    []
  );

  const saveCategory = useCallback(
    (input: UpsertAssetCategoryInput) =>
      runAction(
        'category',
        input.id ? 'Asset category updated.' : 'Asset category created.',
        () => client.request(UpsertAssetCategoryDocument, { input }),
        refreshCategories
      ),
    [client, refreshCategories, runAction]
  );
  const retireCategory = useCallback(
    (assetCategoryId: string) =>
      runAction(
        'retire-category',
        'Asset category retired.',
        () => client.request(RetireAssetCategoryDocument, { assetCategoryId }),
        refreshCategories
      ),
    [client, refreshCategories, runAction]
  );
  const saveAsset = useCallback(
    (input: UpsertAssetInput) =>
      runAction(
        'asset',
        input.id ? 'Asset updated.' : 'Asset created.',
        () => client.request(UpsertAssetDocument, { input }),
        refreshInventory
      ),
    [client, refreshInventory, runAction]
  );
  const retireAsset = useCallback(
    (assetId: string) =>
      runAction(
        'retire-asset',
        'Asset retired.',
        () => client.request(RetireAssetDocument, { assetId }),
        refreshInventory
      ),
    [client, refreshInventory, runAction]
  );
  const assignAsset = useCallback(
    (input: AssignAssetInput) =>
      runAction(
        'assign',
        'Asset assigned successfully.',
        () => client.request(AssignAssetToEmployeeDocument, { input }),
        () => Promise.all([refreshInventory(), refreshAllocations(), refreshHistory()])
      ),
    [client, refreshAllocations, refreshHistory, refreshInventory, runAction]
  );
  const returnAsset = useCallback(
    (input: ReturnAssetInput) =>
      runAction(
        'return',
        'Asset returned successfully.',
        () => client.request(ReturnEmployeeAssetDocument, { input }),
        () => Promise.all([refreshInventory(), refreshAllocations(), refreshHistory()])
      ),
    [client, refreshAllocations, refreshHistory, refreshInventory, runAction]
  );

  const availableAssets = useMemo(
    () => assignmentAssets.filter((asset) => asset.status === 'AVAILABLE' && !asset.retiredAt),
    [assignmentAssets]
  );
  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories]
  );

  return {
    categories,
    activeCategories,
    inventory,
    availableAssets,
    assignmentAssetsLoading,
    assignmentAssetsError,
    activeAssignments,
    history,
    employees,
    locations,
    categoryFilter,
    inventoryFilter,
    allocationFilter,
    historyFilter,
    categoryPageInfo,
    inventoryPageInfo,
    allocationPageInfo,
    historyPageInfo,
    loading,
    errors,
    busyAction,
    actionError,
    actionOk,
    setCategoryFilter,
    setInventoryFilter,
    setAllocationFilter,
    setHistoryFilter,
    saveCategory,
    retireCategory,
    saveAsset,
    retireAsset,
    assignAsset,
    returnAsset,
    searchAvailableAssets,
    clearActionMessages: () => {
      setActionError(null);
      setActionOk(null);
    },
  };
}

export type AssetsWorkspaceModel = ReturnType<typeof useAssetsWorkspace>;
