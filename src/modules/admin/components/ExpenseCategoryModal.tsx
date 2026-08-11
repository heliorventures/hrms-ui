import type { FormEvent } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import type { ExpenseCategoryForm } from '../expenseCategoryTypes';

interface ExpenseCategoryModalProps {
  open: boolean;
  editId: string | null;
  form: ExpenseCategoryForm;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onChange: (form: ExpenseCategoryForm) => void;
}

const ExpenseCategoryModal = ({
  open,
  editId,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
}: ExpenseCategoryModalProps) => (
  <Modal isOpen={open} onClose={onClose} title={editId ? 'Edit category' : 'New category'}>
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Display Name"
        value={form.name}
        onChange={(event) => onChange({ ...form, name: event.target.value })}
        fullWidth
        required
      />
      <Input
        label="Code"
        value={form.code}
        onChange={(event) => onChange({ ...form, code: event.target.value })}
        fullWidth
        required
        disabled={!!editId}
      />
      {editId ? (
        <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
          Codes are fixed once created. Create a new row if you need a different code.
        </p>
      ) : null}
      <Input
        label="Max Amount Per Claim (Optional)"
        value={form.maxAmountPerClaim}
        onChange={(event) => onChange({ ...form, maxAmountPerClaim: event.target.value })}
        fullWidth
        inputMode="decimal"
      />
      <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
        Leave blank for no ceiling. Amounts match your tenant currency, for example INR.
      </p>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  </Modal>
);

export default ExpenseCategoryModal;
