import { useEffect, useRef, useState } from 'react';

import Button from './Button';
import Modal from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  busy?: boolean;
  busyLabel?: string;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onOpenChange,
  cancelLabel,
  tone = 'default',
  busy,
  busyLabel,
}: ConfirmDialogProps) => {
  const [inFlight, setInFlight] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const externallyBusy = Boolean(busy);
  const locked = inFlight || externallyBusy;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (open) setFailureMessage(null);
  }, [open]);

  const requestClose = () => {
    if (inFlightRef.current || externallyBusy) return;
    onOpenChange(false);
  };

  const onConfirmClick = async () => {
    if (inFlightRef.current || externallyBusy) return;
    inFlightRef.current = true;
    setInFlight(true);
    setFailureMessage(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      if (mountedRef.current) {
        setFailureMessage('The action could not be completed. Review the details and try again.');
      }
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setInFlight(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={requestClose}
      title={title}
      isDismissible={!locked}
      description={description}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={requestClose} disabled={locked}>
            {cancelLabel ?? 'Cancel'}
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              void onConfirmClick();
            }}
            disabled={locked}
            busy={locked}
            busyLabel={busyLabel ?? 'Working…'}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {failureMessage ? (
        <p role="alert" className="text-sm font-medium text-status-danger">
          {failureMessage}
        </p>
      ) : null}
    </Modal>
  );
};

export default ConfirmDialog;
