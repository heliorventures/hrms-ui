import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import type { ExpenseRow } from '../types';

interface PaymentReferenceModalProps {
  busy: boolean;
  target: ExpenseRow | null;
  onCancel: () => void;
  onConfirm: (paymentReference: string) => void;
}

const PaymentReferenceModal = ({
  busy,
  target,
  onCancel,
  onConfirm,
}: PaymentReferenceModalProps) => {
  const [paymentReference, setPaymentReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setPaymentReference('');
    setError(null);
  }, [target]);

  const submit = () => {
    const trimmed = paymentReference.trim();
    if (!trimmed) {
      setError('Payment reference is required before marking an expense as paid.');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal isOpen={target !== null} onClose={onCancel} title="Mark Expense Paid">
      {target ? (
        <div className="space-y-4">
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Record payment for <strong>{formatCurrency(target.approvedAmount ?? target.amount, target.currency)}</strong>.
          </p>
          <Input
            label="Payment Reference"
            value={paymentReference}
            onChange={(event) => {
              setError(null);
              setPaymentReference(event.target.value);
            }}
            fullWidth
            placeholder="UTR, bank reference, or payout batch ID"
            required
          />
          <div className="flex gap-3">
            <Button type="button" variant="primary" disabled={busy} onClick={submit}>
              {busy ? 'Saving...' : 'Mark paid'}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default PaymentReferenceModal;
