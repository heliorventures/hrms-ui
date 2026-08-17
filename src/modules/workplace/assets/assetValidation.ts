import type {
  AssetAssignmentFormValues,
  AssetCategoryFormValues,
  AssetFormValues,
  AssetReturnFormValues,
  FieldErrors,
} from './assetTypes';

const required = (value: string) => value.trim().length > 0;

export function validateAssetCategory(values: AssetCategoryFormValues) {
  const errors: FieldErrors<AssetCategoryFormValues> = {};
  if (!required(values.name)) errors.name = 'Category name is required.';
  if (!required(values.code)) errors.code = 'Category code is required.';
  if (values.code.trim().length > 30) errors.code = 'Category code cannot exceed 30 characters.';
  return errors;
}

export function validateAsset(values: AssetFormValues) {
  const errors: FieldErrors<AssetFormValues> = {};
  if (!values.assetCategoryId) errors.assetCategoryId = 'Category is required.';
  if (!required(values.name)) errors.name = 'Asset name is required.';
  if (values.purchaseValue.trim()) {
    const amount = Number(values.purchaseValue);
    if (!Number.isFinite(amount) || amount < 0) {
      errors.purchaseValue = 'Purchase value must be zero or a positive number.';
    }
  }
  return errors;
}

export function validateAssetAssignment(values: AssetAssignmentFormValues) {
  const errors: FieldErrors<AssetAssignmentFormValues> = {};
  if (!values.assetId) errors.assetId = 'Available asset is required.';
  if (!values.employeeId) errors.employeeId = 'Employee is required.';
  if (!values.allocatedOn) errors.allocatedOn = 'Allocation date is required.';
  if (
    values.allocatedOn &&
    values.expectedReturnOn &&
    values.expectedReturnOn < values.allocatedOn
  ) {
    errors.expectedReturnOn = 'Expected return date cannot be before allocation date.';
  }
  return errors;
}

export function validateAssetReturn(values: AssetReturnFormValues, allocatedOn: string) {
  const errors: FieldErrors<AssetReturnFormValues> = {};
  if (!values.returnedOn) errors.returnedOn = 'Return date is required.';
  if (values.returnedOn && values.returnedOn < allocatedOn) {
    errors.returnedOn = 'Return date cannot be before allocation date.';
  }
  return errors;
}

export const hasErrors = <T extends object>(errors: FieldErrors<T>) =>
  Object.keys(errors).length > 0;

export const optionalString = (value: string) => value.trim() || null;
