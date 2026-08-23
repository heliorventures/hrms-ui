import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import Modal from './Modal';
import Button from './Button';
import Input from './Input';

export interface HighRiskActionDialogProps {
  open: boolean;
  action: string;
  target: string;
  scope: string;
  consequence: string;
  confirmLabel: string;
  confirmationText?: string;
  requireReason?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
}

const HighRiskActionDialog = ({
  open,
  action,
  target,
  scope,
  consequence,
  confirmLabel,
  confirmationText,
  requireReason,
  onConfirm,
  onOpenChange,
  busy,
}: HighRiskActionDialogProps) => {
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setReason('');
    setConfirmation('');
    setFailureMessage(null);
  }, [open]);

  const canSubmit = useMemo(() => {
    const reasonRequired = !requireReason || reason.trim().length > 0;
    const phraseRequired = confirmationText ? confirmation === confirmationText : true;
    return reasonRequired && phraseRequired;
  }, [confirmation, confirmationText, reason, requireReason]);

  const externallyBusy = Boolean(busy);
  const locked = submitting || externallyBusy;
  const disableConfirm = locked || !canSubmit;

  const requestClose = () => {
    if (submittingRef.current || externallyBusy) return;
    onOpenChange(false);
  };

  const onConfirmClick = async () => {
    if (submittingRef.current || externallyBusy || !canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    setFailureMessage(null);
    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
    } catch {
      if (mountedRef.current) {
        setFailureMessage('The action could not be completed. Review the details and try again.');
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={requestClose}
      title="High-risk action"
      description="Review the action and its consequences before continuing."
      isDismissible={!locked}
      footer={
        <div className="flex w-full items-start justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={requestClose}
            disabled={locked}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              void onConfirmClick();
            }}
            disabled={disableConfirm}
            busy={locked}
            busyLabel="Working…"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <dl className="grid gap-3 rounded-lg border border-line bg-canvas p-4 text-sm">
          <div>
            <dt className="font-semibold text-content-secondary">Action</dt>
            <dd className="mt-1 text-content-primary">{action}</dd>
          </div>
          <div>
            <dt className="font-semibold text-content-secondary">Target</dt>
            <dd className="mt-1 break-words text-content-primary">{target}</dd>
          </div>
          <div>
            <dt className="font-semibold text-content-secondary">Scope</dt>
            <dd className="mt-1 break-words text-content-primary">{scope}</dd>
          </div>
          <div>
            <dt className="font-semibold text-content-secondary">Consequence</dt>
            <dd className="mt-1 break-words text-content-primary">{consequence}</dd>
          </div>
        </dl>

        {requireReason ? (
          <Input
            label="Reason"
            value={reason}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setReason(event.target.value)}
            description="Provide the approved business reason for this action."
            required
            fullWidth
          />
        ) : null}

        {confirmationText ? (
          <Input
            label={`Type ${confirmationText} to confirm`}
            value={confirmation}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmation(event.target.value)}
            description="The phrase is case-sensitive and spaces must match exactly."
            autoComplete="off"
            spellCheck={false}
            required
            fullWidth
          />
        ) : null}

        {failureMessage ? (
          <p role="alert" className="text-sm font-medium text-status-danger">
            {failureMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
};

export default HighRiskActionDialog;
