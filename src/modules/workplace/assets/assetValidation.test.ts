import { describe, expect, it } from 'vitest';
import { localDateInputValue } from './assetTypes';
import {
  validateAsset,
  validateAssetAssignment,
  validateAssetCategory,
  validateAssetReturn,
} from './assetValidation';

describe('asset validation', () => {
  it('preserves a local calendar date when creating a date input default', () => {
    expect(localDateInputValue(new Date(2026, 0, 2))).toBe('2026-01-02');
  });

  it('requires category identity fields', () => {
    expect(validateAssetCategory({ name: ' ', code: '' })).toEqual({
      name: 'Category name is required.',
      code: 'Category code is required.',
    });
  });

  it('rejects a negative purchase value', () => {
    expect(
      validateAsset({
        assetCategoryId: 'category',
        name: 'Laptop',
        serialNumber: '',
        assetTag: '',
        purchaseValue: '-1',
        purchaseDate: '',
        locationId: '',
      }).purchaseValue
    ).toBeDefined();
  });

  it('rejects an expected return before allocation', () => {
    expect(
      validateAssetAssignment({
        assetId: 'asset',
        employeeId: 'employee',
        allocatedOn: '2026-08-18',
        expectedReturnOn: '2026-08-17',
        conditionAtAllocation: '',
      }).expectedReturnOn
    ).toBeDefined();
  });

  it('rejects a return before allocation', () => {
    expect(
      validateAssetReturn(
        { returnedOn: '2026-08-17', conditionAtReturn: '', remarks: '' },
        '2026-08-18'
      ).returnedOn
    ).toBeDefined();
  });
});
