import type {
  AssetAllocationsPageQuery,
  AssetCategoriesPageQuery,
  AssetEmployeeOptionsPageQuery,
  AssetInventoryPageQuery,
  AssetLocationOptionsQuery,
} from '../../../api/graphql/graphql';

export type AssetCategoryRow = AssetCategoriesPageQuery['assetCategoriesPage']['rows'][number];
export type AssetRow = AssetInventoryPageQuery['assetInventoryPage']['rows'][number];
export type AssetAssignmentRow = AssetAllocationsPageQuery['assetAllocationsPage']['rows'][number];
export type AssetPageInfo = AssetInventoryPageQuery['assetInventoryPage']['pageInfo'];
export type EmployeeOption = AssetEmployeeOptionsPageQuery['assetEmployeeOptionsPage']['rows'][number];
export type LocationOption = AssetLocationOptionsQuery['assetLocationOptions'][number];

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

export const localDateInputValue = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const today = () => localDateInputValue();
