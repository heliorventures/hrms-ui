import { FormEvent, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useGraphClient } from '../../../hooks/useGraphClient';
import {
  RejectLeaveRequestDocument,
  type RejectLeaveRequestMutationVariables,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  LEAVE_APPROVAL_REFRESH_MESSAGE,
  leaveApprovalTarget,
} from '../leaveApproval';

interface LeaveRejectModalProps {
  isOpen: boolean;
  leaveRequestId: string | null;
  expectedWorkflowStepId: string | null;
  onClose: () => void;
  onRejected: () => void;
}

const LeaveRejectModal = ({
  isOpen,
  leaveRequestId,
  expectedWorkflowStepId,
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
    const target = leaveApprovalTarget(leaveRequestId, expectedWorkflowStepId);
    if (!target) {
      setErr(LEAVE_APPROVAL_REFRESH_MESSAGE);
      return;
    }
    const r = reason.trim();
    if (!r) {
      setErr('A rejection reason is required.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const variables: RejectLeaveRequestMutationVariables = {
        leaveRequestId: target.leaveRequestId,
        expectedWorkflowStepId: target.expectedWorkflowStepId,
        reason: r,
      };
      await client.request(RejectLeaveRequestDocument, variables);
      onRejected();
      handleClose();
    } catch (ex) {
      setErr(graphQlUserMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Leave Request">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
        <Input
          label="Reason For Rejection"
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
