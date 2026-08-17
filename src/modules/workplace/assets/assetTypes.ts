import type {
  AssetAllocationsPageQuery,
  AssetCategoriesPageQuery,
  AssetInventoryPageQuery,
  AssetsEmployeeOptionsQuery,
} from '../../../api/graphql/graphql';

export type AssetCategoryRow = AssetCategoriesPageQuery['assetCategoriesPage']['rows'][number];
export type AssetRow = AssetInventoryPageQuery['assetInventoryPage']['rows'][number];
export type AssetAssignmentRow = AssetAllocationsPageQuery['assetAllocationsPage']['rows'][number];
export type AssetPageInfo = AssetInventoryPageQuery['assetInventoryPage']['pageInfo'];
export type EmployeeOption = AssetsEmployeeOptionsQuery['employees'][number];
export type LocationOption = AssetsEmployeeOptionsQuery['assetLocationOptions'][number];

export interface AssetCategoryFormValues {
  name: string;
  code: string;
}

export interface AssetFormValues {
  assetCategoryId: string;
  name: string;
  serialNumber: string;
  assetTag: string;
  purchaseValue: string;
  purchaseDate: string;
  locationId: string;
}

export interface AssetAssignmentFormValues {
  assetId: string;
  employeeId: string;
  allocatedOn: string;
  expectedReturnOn: string;
  conditionAtAllocation: string;
}

export interface AssetReturnFormValues {
  returnedOn: string;
  conditionAtReturn: string;
  remarks: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface PageFilter {
  page: number;
  perPage: number;
  search: string;
}

export interface InventoryFilter extends PageFilter {
  categoryId: string;
  status: string;
}

export const emptyPageInfo = (perPage: number): AssetPageInfo => ({
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  perPage,
  hasNextPage: false,
  hasPrevPage: false,
});

export const today = () => new Date().toISOString().slice(0, 10);
