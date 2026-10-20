import { useState } from 'react';

import Button from '../../components/common/Button';

interface Props {
  label: string;
  description: string;
  busy: boolean;
  onConfirm: () => void;
}
const ConfirmOrganizationAction = ({ label, description, busy, onConfirm }: Props) => {
  const [confirm, setConfirm] = useState(false);
  if (!confirm)
    return (
      <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirm(true)}>
        {label}
      </Button>
    );
  return (
    <div className="space-y-2">
      <p className="text-sm">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="danger" size="sm" busy={busy} onClick={onConfirm}>
          Confirm {label.toLowerCase()}
        </Button>
        <Button variant="quiet" size="sm" disabled={busy} onClick={() => setConfirm(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ConfirmOrganizationAction;
