import { type FormEvent, useEffect, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';
import AssetOptionPicker from './AssetOptionPicker';
import { hasErrors, validateAssetAssignment } from './assetValidation';
import type {
  AssetAssignmentFormValues,
  AssetPageInfo,
  AssetRow,
  EmployeeOption,
  FieldErrors,
  PageFilter,
} from './assetTypes';
import { today } from './assetTypes';

interface AssetAssignmentModalProps {
  assets: AssetRow[];
  employees: EmployeeOption[];
  employeeFilter: PageFilter;
  employeePageInfo: AssetPageInfo;
  loadingAssets: boolean;
  loadingEmployees: boolean;
  assetError?: string | null;
  employeeError?: string | null;
  saving: boolean;
  onSearchAssets: (search?: string) => Promise<void>;
  onEmployeeFilterChange: (filter: PageFilter) => void;
  onClose: () => void;
  onSave: (values: AssetAssignmentFormValues) => Promise<boolean>;
}

export default function AssetAssignmentModal(props: AssetAssignmentModalProps) {
  const [values, setValues] = useState<AssetAssignmentFormValues>({
    assetId: '',
    employeeId: '',
    allocatedOn: today(),
    expectedReturnOn: '',
    conditionAtAllocation: '',
  });
  const [errors, setErrors] = useState<FieldErrors<AssetAssignmentFormValues>>({});
  const [assetSearch, setAssetSearch] = useState('');

  useEffect(() => {
    void props.onSearchAssets();
  }, [props.onSearchAssets]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAssetAssignment(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (await props.onSave(values)) props.onClose();
  };

  return (
    <Modal isOpen isDismissible={!props.saving} onClose={props.onClose} title="Assign Asset" size="lg">
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        <div className="flex items-end gap-2">
          <Input
            label="Find Available Asset"
            value={assetSearch}
            placeholder="Name, tag, or serial number"
            fullWidth
            onChange={(event) => setAssetSearch(event.target.value)}
          />
          <Button
            variant="outline"
            disabled={props.loadingAssets}
            onClick={() => void props.onSearchAssets(assetSearch)}
          >
            {props.loadingAssets ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {props.assetError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{props.assetError}</p>
        ) : null}
        <Select
          label="Available Asset"
          value={values.assetId}
          error={errors.assetId}
          required
          fullWidth
          options={[
            {
              value: '',
              label: props.loadingAssets ? 'Loading available assets...' : 'Select asset',
            },
            ...props.assets.map((asset) => ({
              value: asset.id,
              label: `${asset.name}${asset.assetTag ? ` · ${asset.assetTag}` : ''}${asset.serialNumber ? ` · ${asset.serialNumber}` : ''}`,
            })),
          ]}
          onChange={(event) =>
            setValues((current) => ({ ...current, assetId: event.target.value }))
          }
        />
        <AssetOptionPicker
          label="Employee"
          value={values.employeeId}
          options={props.employees.map((employee) => ({
            value: employee.employeeId,
            label: `${employee.employeeCode} · ${employee.fullName}`,
          }))}
          filter={props.employeeFilter}
          pageInfo={props.employeePageInfo}
          loading={props.loadingEmployees}
          error={props.employeeError ?? errors.employeeId}
          emptyLabel="Select employee"
          required
          onChange={(employeeId) => setValues((current) => ({ ...current, employeeId }))}
          onFilterChange={props.onEmployeeFilterChange}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Allocated On"
            type="date"
            value={values.allocatedOn}
            error={errors.allocatedOn}
            required
            fullWidth
            onChange={(event) =>
              setValues((current) => ({ ...current, allocatedOn: event.target.value }))
            }
          />
          <Input
            label="Expected Return On"
            type="date"
            value={values.expectedReturnOn}
            error={errors.expectedReturnOn}
            min={values.allocatedOn}
            fullWidth
            onChange={(event) =>
              setValues((current) => ({ ...current, expectedReturnOn: event.target.value }))
            }
          />
        </div>
        <Input
          label="Condition at Allocation"
          value={values.conditionAtAllocation}
          fullWidth
          onChange={(event) =>
            setValues((current) => ({ ...current, conditionAtAllocation: event.target.value }))
          }
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={props.saving || props.loadingAssets || props.loadingEmployees}>
            {props.saving ? 'Assigning...' : 'Assign Asset'}
          </Button>
          <Button variant="outline" onClick={props.onClose} disabled={props.saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
