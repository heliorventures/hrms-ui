import { FormEvent, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import type { InvoiceRow } from '../billingTypes';

export interface RecordPaymentInput {
  invoiceId: string;
  amount: string;
  paymentMethod?: string;
  gatewayRef?: string;
}

interface RecordPaymentModalProps {
  error: string | null;
  initialInvoiceId: string;
  invoices: InvoiceRow[];
  isOpen: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: RecordPaymentInput) => Promise<void>;
}

const RecordPaymentModal = ({
  error,
  initialInvoiceId,
  invoices,
  isOpen,
  submitting,
  onClose,
  onSubmit,
}: RecordPaymentModalProps) => {
  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setInvoiceId(initialInvoiceId);
    setAmount('');
    setMethod('');
    setReference('');
  }, [initialInvoiceId, isOpen]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!invoiceId.trim() || !amount.trim()) return;
    await onSubmit({
      invoiceId: invoiceId.trim(),
      amount: amount.trim(),
      paymentMethod: method.trim() || undefined,
      gatewayRef: reference.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <form onSubmit={(event) => void submit(event)} className="space-y-3">
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Invoice
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
            required
          >
            <option value="">Select Invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {invoice.totalAmount} {invoice.currency} ({invoice.status})
              </option>
            ))}
          </select>
        </label>
        <Input label="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <Input label="Payment Method" value={method} onChange={(event) => setMethod(event.target.value)} />
        <Input label="Gateway Ref" value={reference} onChange={(event) => setReference(event.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
