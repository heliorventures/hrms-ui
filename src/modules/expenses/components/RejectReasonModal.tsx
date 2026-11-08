import { FormEvent, useState } from 'react';

import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

export interface RejectReasonModalProps {
  isOpen: boolean;
  title: string;
  /** When true, user must enter non-empty reason (e.g. leave rejection). */
  reasonRequired?: boolean;
  onClose: () => void;
  onConfirm: (reason: string | null) => Promise<void>;
}

const RejectReasonModal = ({
  isOpen,
  title: heading,
  reasonRequired = false,
  onClose,
  onConfirm,
}: RejectReasonModalProps) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useFeedbackState<string | null>(null, 'error');

  const handleClose = () => {
    setReason('');
    setErr(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const r = reason.trim();
    if (reasonRequired && !r) {
      setErr('A reason is required.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await onConfirm(r.length > 0 ? r : null);
      handleClose();
    } catch (ex) {
      setErr(graphQlUserMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={heading}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {err && (
          <FeedbackToast variant={'error'} messageKey={err}>
            {err}
          </FeedbackToast>
        )}
        <Input
          label={reasonRequired ? 'Reason' : 'Reason (optional)'}
          value={reason}
          onChange={(ev) => setReason(ev.target.value)}
          fullWidth
          required={reasonRequired}
          placeholder="Explain why this is rejected"
        />
        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Submitting...' : 'Reject'}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectReasonModal;
