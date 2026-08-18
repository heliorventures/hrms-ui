import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

interface AssetRetireDialogProps {
  kind: 'asset' | 'category';
  name: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

export default function AssetRetireDialog({
  kind,
  name,
  saving,
  onClose,
  onConfirm,
}: AssetRetireDialogProps) {
  const label = kind === 'asset' ? 'asset' : 'asset category';
  return (
    <Modal isOpen isDismissible={!saving} onClose={onClose} title={`Retire ${label}`} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Retire <strong>{name}</strong>? Retired records remain in history and cannot be edited or
          assigned.
        </p>
        {kind === 'category' ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            A category can be retired only after every asset in it has been retired or moved.
          </p>
        ) : null}
        <div className="flex gap-3">
          <Button
            variant="danger"
            disabled={saving}
            onClick={() => void onConfirm().then((success) => success && onClose())}
          >
            {saving ? 'Retiring...' : 'Retire'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
