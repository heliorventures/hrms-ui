import { FormEvent, useEffect, useMemo, useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import type { CycleRow, TenantRow } from '../billingTypes';

export interface CreateInvoiceInput {
  tenantId: string;
  billingCycleId?: string;
  subtotal: string;
  discountTotal?: string;
  taxAmount?: string;
  totalAmount: string;
  currency: string;
  dueDate?: string;
}

interface CreateInvoiceModalProps {
  cycles: CycleRow[];
  error: string | null;
  initialTenantId: string;
  isOpen: boolean;
  submitting: boolean;
  tenants: TenantRow[];
  onClose: () => void;
  onSubmit: (input: CreateInvoiceInput) => Promise<void>;
}

const DEFAULT_CURRENCY = 'INR';

const CreateInvoiceModal = ({
  cycles,
  error,
  initialTenantId,
  isOpen,
  submitting,
  tenants,
  onClose,
  onSubmit,
}: CreateInvoiceModalProps) => {
  const [tenantId, setTenantId] = useState(initialTenantId);
  const [subtotal, setSubtotal] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [total, setTotal] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [dueDate, setDueDate] = useState('');
  const [billingCycleId, setBillingCycleId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTenantId(initialTenantId);
    setSubtotal('');
    setDiscount('');
    setTax('');
    setTotal('');
    setCurrency(DEFAULT_CURRENCY);
    setDueDate('');
    setBillingCycleId('');
  }, [initialTenantId, isOpen]);

  const cyclesForTenant = useMemo(
    () => cycles.filter((cycle) => cycle.tenantId === tenantId),
    [cycles, tenantId]
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!tenantId.trim() || !total.trim()) return;
    await onSubmit({
      tenantId: tenantId.trim(),
      billingCycleId: billingCycleId.trim() || undefined,
      subtotal: subtotal.trim() || '0',
      discountTotal: discount.trim() || undefined,
      taxAmount: tax.trim() || undefined,
      totalAmount: total.trim(),
      currency: currency.trim() || DEFAULT_CURRENCY,
      dueDate: dueDate.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create invoice" size="md">
      <form onSubmit={(event) => void submit(event)} className="space-y-3">
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tenant
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={tenantId}
            onChange={(event) => {
              setTenantId(event.target.value);
              setBillingCycleId('');
            }}
            required
          >
            <option value="">Select tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Billing cycle
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={billingCycleId}
            onChange={(event) => setBillingCycleId(event.target.value)}
          >
            <option value="">Auto current month</option>
            {cyclesForTenant.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.periodStart}
                {' -> '}
                {cycle.periodEnd} - {cycle.status}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Subtotal" value={subtotal} onChange={(event) => setSubtotal(event.target.value)} />
          <Input label="Total" value={total} onChange={(event) => setTotal(event.target.value)} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Discount total" value={discount} onChange={(event) => setDiscount(event.target.value)} />
          <Input label="Tax amount" value={tax} onChange={(event) => setTax(event.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} />
          <Input label="Due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInvoiceModal;
