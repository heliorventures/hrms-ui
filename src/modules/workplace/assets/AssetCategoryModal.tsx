import { type FormEvent, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { hasErrors, validateAssetCategory } from './assetValidation';
import type { AssetCategoryFormValues, AssetCategoryRow, FieldErrors } from './assetTypes';

interface AssetCategoryModalProps {
  editing?: AssetCategoryRow;
  saving: boolean;
  onClose: () => void;
  onSave: (values: AssetCategoryFormValues) => Promise<boolean>;
}

export default function AssetCategoryModal({
  editing,
  saving,
  onClose,
  onSave,
}: AssetCategoryModalProps) {
  const [values, setValues] = useState<AssetCategoryFormValues>({
    name: editing?.name ?? '',
    code: editing?.code ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors<AssetCategoryFormValues>>({});
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAssetCategory(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (await onSave(values)) onClose();
  };
  return (
    <Modal isOpen onClose={onClose} title={editing ? 'Edit Asset Category' : 'New Asset Category'}>
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        <Input
          label="Name"
          value={values.name}
          error={errors.name}
          required
          fullWidth
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        <Input
          label="Code"
          value={values.code}
          error={errors.code}
          required
          fullWidth
          maxLength={30}
          onChange={(event) =>
            setValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))
          }
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Category'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
