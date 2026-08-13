import Button from '../../../../components/common/Button';
import Modal from '../../../../components/common/Modal';

interface ConfirmProfileActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  reason?: string;
  reasonRequired?: boolean;
  onReasonChange?: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmProfileActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  busy,
  reason = '',
  reasonRequired = false,
  onReasonChange,
  onClose,
  onConfirm,
}: ConfirmProfileActionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !busy && onClose()} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
        {reasonRequired ? (
          <div>
            <label htmlFor="profile-action-reason" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason shown to the employee
            </label>
            <textarea
              id="profile-action-reason"
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={(event) => onReasonChange?.(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" disabled={busy || (reasonRequired && !reason.trim())} onClick={onConfirm}>
            {busy ? 'Saving...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
