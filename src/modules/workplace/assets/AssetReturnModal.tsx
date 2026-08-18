import { type FormEvent, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { hasErrors, validateAssetReturn } from './assetValidation';
import type { AssetAssignmentRow, AssetReturnFormValues, FieldErrors } from './assetTypes';
import { today } from './assetTypes';

interface AssetReturnModalProps {
  assignment: AssetAssignmentRow;
  saving: boolean;
  onClose: () => void;
  onSave: (values: AssetReturnFormValues) => Promise<boolean>;
}

export default function AssetReturnModal({
  assignment,
  saving,
  onClose,
  onSave,
}: AssetReturnModalProps) {
  const [values, setValues] = useState<AssetReturnFormValues>({
    returnedOn: today(),
    conditionAtReturn: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<FieldErrors<AssetReturnFormValues>>({});
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAssetReturn(values, assignment.allocatedOn);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (await onSave(values)) onClose();
  };
  return (
    <Modal isOpen isDismissible={!saving} onClose={onClose} title={`Return ${assignment.assetName}`}>
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Assigned to {assignment.employeeName || assignment.employeeCode || 'Unknown employee'}{' '}
          on {assignment.allocatedOn}.
        </p>
        <Input
          label="Returned On"
          type="date"
          min={assignment.allocatedOn}
          value={values.returnedOn}
          error={errors.returnedOn}
          required
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, returnedOn: event.target.value }))
          }
        />
        <Input
          label="Condition at Return"
          value={values.conditionAtReturn}
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, conditionAtReturn: event.target.value }))
          }
        />
        <Input
          label="Remarks"
          value={values.remarks}
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, remarks: event.target.value }))
          }
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Recording...' : 'Record Return'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
