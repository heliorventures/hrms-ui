import { FormEvent, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { RejectLeaveRequestDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

interface LeaveRejectModalProps {
  isOpen: boolean;
  leaveRequestId: string | null;
  onClose: () => void;
  onRejected: () => void;
}

const LeaveRejectModal = ({
  isOpen,
  leaveRequestId,
  onClose,
  onRejected,
}: LeaveRejectModalProps) => {
  const client = useGraphClient('client');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleClose = () => {
    setReason('');
    setErr(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!leaveRequestId) return;
    const r = reason.trim();
    if (!r) {
      setErr('A rejection reason is required.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await client.request(RejectLeaveRequestDocument, {
        leaveRequestId,
        reason: r,
      });
      onRejected();
      handleClose();
    } catch (ex) {
      setErr(graphQlUserMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject leave request">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
        <Input
          label="Reason for rejection"
          value={reason}
          onChange={(ev) => setReason(ev.target.value)}
          fullWidth
          required
          placeholder="Explain why this request is rejected"
        />
        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Rejecting…' : 'Reject request'}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveRejectModal;
