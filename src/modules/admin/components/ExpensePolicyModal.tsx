import type { FormEvent } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import UuidEntitySearchSelect, {
  type UuidEntityOption,
} from '../../../components/common/UuidEntitySearchSelect';
import type { ExpensePolicyForm } from '../expenseCategoryTypes';
import { EXPENSE_POLICY_SCOPE_OPTIONS, selectFieldClass } from '../expenseCategoryUtils';

interface ExpensePolicyModalProps {
  open: boolean;
  form: ExpensePolicyForm;
  error: string | null;
  saving: boolean;
  directoryLoading: boolean;
  directoryError: string | null;
  departmentOptions: UuidEntityOption[];
  designationOptions: UuidEntityOption[];
  roleOptions: UuidEntityOption[];
  hasDepartments: boolean;
  hasDesignations: boolean;
  hasRoles: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onChange: (form: ExpensePolicyForm) => void;
}

const ExpensePolicyModal = ({
  open,
  form,
  error,
  saving,
  directoryLoading,
  directoryError,
  departmentOptions,
  designationOptions,
  roleOptions,
  hasDepartments,
  hasDesignations,
  hasRoles,
  onClose,
  onSubmit,
  onChange,
}: ExpensePolicyModalProps) => (
  <Modal
    isOpen={open}
    onClose={onClose}
    title={form.editPolicyId ? 'Edit expense policy' : 'New expense policy'}
  >
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Applicable to
        </label>
        <select
          value={form.applicableTo}
          onChange={(event) => onChange({ ...form, applicableTo: event.target.value })}
          className={selectFieldClass}
        >
          {EXPENSE_POLICY_SCOPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {directoryLoading ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading Organization Directory...</p>
      ) : null}
      {directoryError ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">{directoryError}</p>
      ) : null}
      <ExpensePolicyScopeFields
        form={form}
        directoryLoading={directoryLoading}
        directoryError={directoryError}
        departmentOptions={departmentOptions}
        designationOptions={designationOptions}
        roleOptions={roleOptions}
        hasDepartments={hasDepartments}
        hasDesignations={hasDesignations}
        hasRoles={hasRoles}
        onChange={onChange}
      />
      <Input
        label="Limit Per Day (Optional Decimal)"
        value={form.limitPerDay}
        onChange={(event) => onChange({ ...form, limitPerDay: event.target.value })}
        fullWidth
        inputMode="decimal"
      />
      <Input
        label="Limit Per Month (Optional Decimal)"
        value={form.limitPerMonth}
        onChange={(event) => onChange({ ...form, limitPerMonth: event.target.value })}
        fullWidth
        inputMode="decimal"
      />
      <Input
        label="Policy Max Amount Per Claim (Optional)"
        value={form.maxAmountPerClaim}
        onChange={(event) => onChange({ ...form, maxAmountPerClaim: event.target.value })}
        fullWidth
        inputMode="decimal"
      />
      <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={form.receiptRequired}
          onChange={(event) => onChange({ ...form, receiptRequired: event.target.checked })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        Receipt required on submit
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={form.approvalRequired}
          onChange={(event) => onChange({ ...form, approvalRequired: event.target.checked })}
          className="rounded border-gray-300 dark:border-gray-600"
        />
        Approval required (workflows / approvers)
      </label>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Policy'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  </Modal>
);

interface ExpensePolicyScopeFieldsProps {
  form: ExpensePolicyForm;
  directoryLoading: boolean;
  directoryError: string | null;
  departmentOptions: UuidEntityOption[];
  designationOptions: UuidEntityOption[];
  roleOptions: UuidEntityOption[];
  hasDepartments: boolean;
  hasDesignations: boolean;
  hasRoles: boolean;
  onChange: (form: ExpensePolicyForm) => void;
}

const ExpensePolicyScopeFields = ({
  form,
  directoryLoading,
  directoryError,
  departmentOptions,
  designationOptions,
  roleOptions,
  hasDepartments,
  hasDesignations,
  hasRoles,
  onChange,
}: ExpensePolicyScopeFieldsProps) => {
  if (form.applicableTo === 'DEPARTMENT') {
    if (directoryError && !hasDepartments) {
      return (
        <Input
          label="Department ID (Paste UUID)"
          value={form.departmentId}
          onChange={(event) => onChange({ ...form, departmentId: event.target.value })}
          fullWidth
          required
        />
      );
    }
    return (
      <UuidEntitySearchSelect
        label="Department"
        placeholder="Search by name or code..."
        emptyLabel="Choose A Department..."
        options={departmentOptions}
        valueId={form.departmentId}
        disabled={directoryLoading}
        required
        onChangeId={(departmentId) => onChange({ ...form, departmentId })}
      />
    );
  }

  if (form.applicableTo === 'DESIGNATION') {
    if (directoryError && !hasDesignations) {
      return (
        <Input
          label="Designation ID (Paste UUID)"
          value={form.designationId}
          onChange={(event) => onChange({ ...form, designationId: event.target.value })}
          fullWidth
          required
        />
      );
    }
    return (
      <UuidEntitySearchSelect
        label="Designation"
        placeholder="Search by title..."
        emptyLabel="Choose A Designation..."
        options={designationOptions}
        valueId={form.designationId}
        disabled={directoryLoading}
        required
        onChangeId={(designationId) => onChange({ ...form, designationId })}
      />
    );
  }

  if (form.applicableTo === 'ROLE') {
    if (directoryError && !hasRoles) {
      return (
        <Input
          label="Role ID (Paste UUID)"
          value={form.roleId}
          onChange={(event) => onChange({ ...form, roleId: event.target.value })}
          fullWidth
          required
        />
      );
    }
    return (
      <UuidEntitySearchSelect
        label="Tenant Role"
        placeholder="Search by role name..."
        emptyLabel="Choose A Role..."
        options={roleOptions}
        valueId={form.roleId}
        disabled={directoryLoading}
        required
        onChangeId={(roleId) => onChange({ ...form, roleId })}
      />
    );
  }

  return null;
};

export default ExpensePolicyModal;
