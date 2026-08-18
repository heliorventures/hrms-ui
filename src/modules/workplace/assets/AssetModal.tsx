import { type FormEvent, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';
import AssetOptionPicker from './AssetOptionPicker';
import { hasErrors, validateAsset } from './assetValidation';
import type {
  AssetCategoryRow,
  AssetPageInfo,
  AssetFormValues,
  AssetRow,
  FieldErrors,
  LocationOption,
  PageFilter,
} from './assetTypes';

interface AssetModalProps {
  editing?: AssetRow;
  categories: AssetCategoryRow[];
  categoryFilter: PageFilter;
  categoryPageInfo: AssetPageInfo;
  categoryLoading: boolean;
  categoryError?: string | null;
  locations: LocationOption[];
  saving: boolean;
  onClose: () => void;
  onCategoryFilterChange: (filter: PageFilter) => void;
  onSave: (values: AssetFormValues) => Promise<boolean>;
}

export default function AssetModal({
  editing,
  categories,
  categoryFilter,
  categoryPageInfo,
  categoryLoading,
  categoryError,
  locations,
  saving,
  onClose,
  onCategoryFilterChange,
  onSave,
}: AssetModalProps) {
  const [values, setValues] = useState<AssetFormValues>({
    assetCategoryId: editing?.assetCategoryId ?? '',
    name: editing?.name ?? '',
    serialNumber: editing?.serialNumber ?? '',
    assetTag: editing?.assetTag ?? '',
    purchaseValue: editing?.purchaseValue ?? '',
    purchaseDate: editing?.purchaseDate ?? '',
    locationId: editing?.locationId ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors<AssetFormValues>>({});
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAsset(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (await onSave(values)) onClose();
  };
  return (
    <Modal
      isOpen
      isDismissible={!saving}
      onClose={onClose}
      title={editing ? 'Edit Asset' : 'New Asset'}
      size="lg"
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <AssetOptionPicker
          label="Category"
          value={values.assetCategoryId}
          options={categories.map((row) => ({
            value: row.id,
            label: `${row.name} (${row.code || 'no code'})`,
          }))}
          filter={categoryFilter}
          pageInfo={categoryPageInfo}
          loading={categoryLoading}
          error={categoryError ?? errors.assetCategoryId}
          emptyLabel="Select category"
          selectedLabel={
            editing?.categoryName
              ? `${editing.categoryName}${editing.categoryCode ? ` (${editing.categoryCode})` : ''}`
              : undefined
          }
          required
          onChange={(assetCategoryId) =>
            setValues((current) => ({ ...current, assetCategoryId }))
          }
          onFilterChange={onCategoryFilterChange}
        />
        <Input
          label="Asset Name"
          value={values.name}
          error={errors.name}
          required
          fullWidth
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        <Input
          label="Asset Tag"
          value={values.assetTag}
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, assetTag: event.target.value }))
          }
        />
        <Input
          label="Serial Number"
          value={values.serialNumber}
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, serialNumber: event.target.value }))
          }
        />
        <Input
          label="Purchase Value"
          value={values.purchaseValue}
          error={errors.purchaseValue}
          inputMode="decimal"
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, purchaseValue: event.target.value }))
          }
        />
        <Input
          label="Purchase Date"
          type="date"
          value={values.purchaseDate}
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, purchaseDate: event.target.value }))
          }
        />
        <Select
          label="Location"
          value={values.locationId}
          fullWidth
          options={[
            { value: '', label: 'No location' },
            ...locations.map((location) => ({ value: location.id, label: location.name })),
          ]}
          onChange={(event) =>
            setValues((current) => ({ ...current, locationId: event.target.value }))
          }
        />
        <div className="flex items-end gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Asset'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
