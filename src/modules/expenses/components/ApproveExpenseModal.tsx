import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import type { ApproveExpenseTarget } from '../types';

interface ApproveExpenseModalProps {
  busy: boolean;
  error: string | null;
  target: ApproveExpenseTarget | null;
  onCancel: () => void;
  onChange: (target: ApproveExpenseTarget) => void;
  onConfirm: () => void;
}

const ApproveExpenseModal = ({
  busy,
  error,
  target,
  onCancel,
  onChange,
  onConfirm,
}: ApproveExpenseModalProps) => {
  return (
    <Modal
      isOpen={target !== null}
      onClose={onCancel}
      title="Approve Expense Claim"
    >
      {target ? (
        <div className="space-y-4">
          {error ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Claimed <strong>{formatCurrency(target.claimAmount, target.currency)}</strong>. Adjust
            the reimbursable amount only when partially approving.
          </p>
          <Input
            label="Approve Amount"
            value={target.draftApprove}
            onChange={(event) => onChange({ ...target, draftApprove: event.target.value })}
            fullWidth
            inputMode="decimal"
            required
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? 'Submitting...' : 'Submit Approval'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ApproveExpenseModal;
