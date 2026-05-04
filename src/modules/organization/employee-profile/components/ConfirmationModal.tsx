import Modal from '../../../../components/common/Modal';
import Button from '../../../../components/common/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  warning?: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  children?: React.ReactNode;
  onConfirm: () => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  warning,
  confirmLabel,
  variant = 'danger',
  children,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {warning ? (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {warning}
          </div>
        ) : null}
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
