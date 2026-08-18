import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AssetAllocationsPageDocument,
  AssetCategoriesPageDocument,
  AssetEmployeeOptionsPageDocument,
  AssetInventoryPageDocument,
  AssetLocationOptionsDocument,
  AssignAssetToEmployeeDocument,
  RetireAssetCategoryDocument,
  RetireAssetDocument,
  ReturnEmployeeAssetDocument,
  UpsertAssetCategoryDocument,
  UpsertAssetDocument,
  type AssetAllocationsPageQuery,
  type AssetCategoriesPageQuery,
  type AssetEmployeeOptionsPageQuery,
  type AssetInventoryPageQuery,
  type AssetLocationOptionsQuery,
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
  EmployeeOption,
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
  const [categoryOptions, setCategoryOptions] = useState<AssetCategoryRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [locations, setLocations] = useState<AssetLocationOptionsQuery['assetLocationOptions']>([]);
  const [assignmentAssets, setAssignmentAssets] = useState<AssetRow[]>([]);
  const [assignmentAssetsLoading, setAssignmentAssetsLoading] = useState(false);
  const [assignmentAssetsError, setAssignmentAssetsError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<PageFilter>(initialPageFilter);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>(initialInventoryFilter);
  const [allocationFilter, setAllocationFilter] = useState<PageFilter>(initialPageFilter);
  const [historyFilter, setHistoryFilter] = useState<PageFilter>(initialPageFilter);
  const [categoryOptionFilter, setCategoryOptionFilter] = useState<PageFilter>(initialPageFilter);
  const [employeeOptionFilter, setEmployeeOptionFilter] = useState<PageFilter>(initialPageFilter);

  const [categoryPageInfo, setCategoryPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [inventoryPageInfo, setInventoryPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [allocationPageInfo, setAllocationPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [historyPageInfo, setHistoryPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [categoryOptionPageInfo, setCategoryOptionPageInfo] = useState(emptyPageInfo(PAGE_SIZE));
  const [employeeOptionPageInfo, setEmployeeOptionPageInfo] = useState(emptyPageInfo(PAGE_SIZE));

  const [loading, setLoading] = useState({
    categories: canReadInventory,
    inventory: canReadInventory,
    allocations: true,
    history: true,
    categoryOptions: canReadInventory,
    employeeOptions: canManageAssets,
    locations: canManageAssets,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);
  const inFlightActions = useRef(new Set<string>());

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

  const loadCategoryOptions = useCallback(async () => {
    const result = await client.request<AssetCategoriesPageQuery>(AssetCategoriesPageDocument, {
      page: { page: categoryOptionFilter.page, perPage: categoryOptionFilter.perPage },
      search: categoryOptionFilter.search.trim() || null,
      activeOnly: true,
    });
    return result.assetCategoriesPage;
  }, [categoryOptionFilter, client]);

  const loadEmployeeOptions = useCallback(async () => {
    const result = await client.request<AssetEmployeeOptionsPageQuery>(
      AssetEmployeeOptionsPageDocument,
      {
        page: { page: employeeOptionFilter.page, perPage: employeeOptionFilter.perPage },
        search: employeeOptionFilter.search.trim() || null,
      }
    );
    return result.assetEmployeeOptionsPage;
  }, [client, employeeOptionFilter]);

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
    if (!canReadInventory) return;
    let cancelled = false;
    setSectionLoading('categoryOptions', true);
    setSectionError('categoryOptions', null);
    void loadCategoryOptions()
      .then((result) => {
        if (!cancelled) {
          setCategoryOptions(result.rows);
          setCategoryOptionPageInfo(result.pageInfo);
        }
      })
      .catch(
        (error) => !cancelled && setSectionError('categoryOptions', graphQlUserMessage(error))
      )
      .finally(() => !cancelled && setSectionLoading('categoryOptions', false));
    return () => {
      cancelled = true;
    };
  }, [canReadInventory, loadCategoryOptions, setSectionError, setSectionLoading]);

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
    setSectionLoading('employeeOptions', true);
    setSectionError('employeeOptions', null);
    void loadEmployeeOptions()
      .then((result) => {
        if (!cancelled) {
          setEmployees(result.rows);
          setEmployeeOptionPageInfo(result.pageInfo);
        }
      })
      .catch(
        (error) => !cancelled && setSectionError('employeeOptions', graphQlUserMessage(error))
      )
      .finally(() => !cancelled && setSectionLoading('employeeOptions', false));
    return () => {
      cancelled = true;
    };
  }, [canManageAssets, loadEmployeeOptions, setSectionError, setSectionLoading]);

  useEffect(() => {
    if (!canManageAssets) return;
    let cancelled = false;
    setSectionLoading('locations', true);
    setSectionError('locations', null);
    void client
      .request<AssetLocationOptionsQuery>(AssetLocationOptionsDocument, { locationLimit: 200 })
      .then((result) => !cancelled && setLocations(result.assetLocationOptions))
      .catch((error) => !cancelled && setSectionError('locations', graphQlUserMessage(error)))
      .finally(() => !cancelled && setSectionLoading('locations', false));
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
  const refreshCategoryOptions = useCallback(async () => {
    const result = await loadCategoryOptions();
    setCategoryOptions(result.rows);
    setCategoryOptionPageInfo(result.pageInfo);
  }, [loadCategoryOptions]);
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
      if (inFlightActions.current.has(key)) return false;
      inFlightActions.current.add(key);
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
        inFlightActions.current.delete(key);
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
        () => Promise.all([refreshCategories(), refreshCategoryOptions()])
      ),
    [client, refreshCategories, refreshCategoryOptions, runAction]
  );
  const retireCategory = useCallback(
    (assetCategoryId: string) =>
      runAction(
        'retire-category',
        'Asset category retired.',
        () => client.request(RetireAssetCategoryDocument, { assetCategoryId }),
        () => Promise.all([refreshCategories(), refreshCategoryOptions()])
      ),
    [client, refreshCategories, refreshCategoryOptions, runAction]
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
  return {
    categories,
    categoryOptions,
    inventory,
    availableAssets,
    assignmentAssetsLoading,
    assignmentAssetsError,
    activeAssignments,
    history,
    employees,
    locations,
    categoryFilter,
    categoryOptionFilter,
    employeeOptionFilter,
    inventoryFilter,
    allocationFilter,
    historyFilter,
    categoryPageInfo,
    categoryOptionPageInfo,
    employeeOptionPageInfo,
    inventoryPageInfo,
    allocationPageInfo,
    historyPageInfo,
    loading,
    errors,
    busyAction,
    actionError,
    actionOk,
    setCategoryFilter,
    setCategoryOptionFilter,
    setEmployeeOptionFilter,
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
