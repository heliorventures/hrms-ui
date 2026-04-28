import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { useGraphClient } from '@/hooks/useGraphClient';
import {
  OPS_BILLING_CYCLES,
  OPS_CREATE_INVOICE,
  OPS_INVOICES,
  OPS_PAYMENTS,
  OPS_RECORD_PAYMENT,
  OPS_TENANTS,
} from './opsGraph';

type TenantRow = { id: string; name: string };

type InvoiceRow = {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  totalAmount: string;
  currency: string;
  status: string;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt: string;
};

type PaymentRow = {
  id: string;
  invoiceId: string;
  amount: string;
  paymentMethod?: string | null;
  status: string;
  paidAt?: string | null;
  gatewayRef?: string | null;
};

type CycleRow = {
  id: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  frequency: string;
  status: string;
  createdAt: string;
};

const OpsBillingPage = () => {
  const client = useGraphClient('operator');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [cycles, setCycles] = useState<CycleRow[]>([]);
  const [tenantFilter, setTenantFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [ciTenantId, setCiTenantId] = useState('');
  const [ciSubtotal, setCiSubtotal] = useState('');
  const [ciDiscount, setCiDiscount] = useState('');
  const [ciTax, setCiTax] = useState('');
  const [ciTotal, setCiTotal] = useState('');
  const [ciCurrency, setCiCurrency] = useState('INR');
  const [ciDueDate, setCiDueDate] = useState('');
  /** Empty = auto current-month cycle; otherwise a billing cycle UUID for this tenant. */
  const [ciBillingCycleId, setCiBillingCycleId] = useState('');
  const [ciSubmitting, setCiSubmitting] = useState(false);

  const [payOpen, setPayOpen] = useState(false);
  const [rpInvoiceId, setRpInvoiceId] = useState('');
  const [rpAmount, setRpAmount] = useState('');
  const [rpMethod, setRpMethod] = useState('');
  const [rpRef, setRpRef] = useState('');
  const [rpSubmitting, setRpSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tid = tenantFilter || undefined;
      const [t, inv, pay, cyc] = await Promise.all([
        client.request<{ tenants: TenantRow[] }>(OPS_TENANTS, { limit: 200 }),
        client.request<{ invoices: InvoiceRow[] }>(OPS_INVOICES, {
          tenantId: tid,
          limit: 200,
        }),
        client.request<{ payments: PaymentRow[] }>(OPS_PAYMENTS, {
          invoiceId: undefined,
          limit: 200,
        }),
        client.request<{ billingCycles: CycleRow[] }>(OPS_BILLING_CYCLES, {
          tenantId: tid,
          limit: 200,
        }),
      ]);
      setTenants(t.tenants ?? []);
      setInvoices(inv.invoices ?? []);
      setPayments(pay.payments ?? []);
      setCycles(cyc.billingCycles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, [client, tenantFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const tenantName = (id: string) => tenants.find((x) => x.id === id)?.name ?? id.slice(0, 8);

  const cyclesForSelectedTenant = useMemo(
    () => cycles.filter((c) => c.tenantId === ciTenantId),
    [cycles, ciTenantId],
  );

  const openCreateInvoice = () => {
    setActionError(null);
    setCiTenantId(tenantFilter || tenants[0]?.id || '');
    setCiSubtotal('');
    setCiDiscount('');
    setCiTax('');
    setCiTotal('');
    setCiCurrency('INR');
    setCiDueDate('');
    setCiBillingCycleId('');
    setCreateOpen(true);
  };

  const onCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciTenantId.trim() || !ciTotal.trim()) return;
    setCiSubmitting(true);
    setActionError(null);
    try {
      await client.request(OPS_CREATE_INVOICE, {
        input: {
          tenantId: ciTenantId.trim(),
          billingCycleId: ciBillingCycleId.trim() || undefined,
          subtotal: ciSubtotal.trim() || '0',
          discountTotal: ciDiscount.trim() || undefined,
          taxAmount: ciTax.trim() || undefined,
          totalAmount: ciTotal.trim(),
          currency: ciCurrency.trim() || 'INR',
          dueDate: ciDueDate.trim() || undefined,
        },
      });
      setToast('Invoice created.');
      setCreateOpen(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Create invoice failed');
    } finally {
      setCiSubmitting(false);
    }
  };

  const openRecordPayment = () => {
    setActionError(null);
    setRpInvoiceId(invoices[0]?.id ?? '');
    setRpAmount('');
    setRpMethod('');
    setRpRef('');
    setPayOpen(true);
  };

  const onRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rpInvoiceId.trim() || !rpAmount.trim()) return;
    setRpSubmitting(true);
    setActionError(null);
    try {
      await client.request(OPS_RECORD_PAYMENT, {
        input: {
          invoiceId: rpInvoiceId.trim(),
          amount: rpAmount.trim(),
          paymentMethod: rpMethod.trim() || undefined,
          gatewayRef: rpRef.trim() || undefined,
        },
      });
      setToast('Payment recorded.');
      setPayOpen(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Record payment failed');
    } finally {
      setRpSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Billing"
        description="Invoices, billing cycles, and payments. Create invoices (default: current-month cycle; optional specific cycle) and record payments."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" onClick={openCreateInvoice}>
              Create invoice
            </Button>
            <Button type="button" variant="secondary" onClick={openRecordPayment} disabled={invoices.length === 0}>
              Record payment
            </Button>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        }
      />

      <label className="text-sm text-slate-600 dark:text-slate-400">
        Filter by tenant (invoices and billing cycles)
        <select
          className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
        >
          <option value="">All tenants</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {toast && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {toast}
          <button
            type="button"
            className="ml-2 text-emerald-700 underline dark:text-emerald-300"
            onClick={() => setToast(null)}
          >
            Dismiss
          </button>
        </p>
      )}
      {actionError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create invoice" size="md">
        <form onSubmit={onCreateInvoice} className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Amounts are decimal strings (e.g. <code className="text-xs">23600</code> or{' '}
            <code className="text-xs">23600.00</code>). Omitting subtotal/discount/tax sends zeros except{' '}
            <code className="text-xs">totalAmount</code>, which is required.
          </p>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tenant
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              value={ciTenantId}
              onChange={(e) => {
                setCiTenantId(e.target.value);
                setCiBillingCycleId('');
              }}
              required
            >
              <option value="">— Select —</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Billing cycle (optional)
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              value={ciBillingCycleId}
              onChange={(e) => setCiBillingCycleId(e.target.value)}
            >
              <option value="">Auto — current month (create if missing)</option>
              {cyclesForSelectedTenant.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.periodStart} → {c.periodEnd} · {c.status}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cycles shown are loaded for this page (respects tenant filter above). If a tenant has no rows here, refresh
            with “All tenants” or use Auto.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Subtotal" value={ciSubtotal} onChange={(e) => setCiSubtotal(e.target.value)} placeholder="0" />
            <Input label="Total (required)" value={ciTotal} onChange={(e) => setCiTotal(e.target.value)} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Discount total" value={ciDiscount} onChange={(e) => setCiDiscount(e.target.value)} />
            <Input label="Tax amount" value={ciTax} onChange={(e) => setCiTax(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Currency (ISO)" value={ciCurrency} onChange={(e) => setCiCurrency(e.target.value)} />
            <Input
              label="Due date (optional)"
              type="date"
              value={ciDueDate}
              onChange={(e) => setCiDueDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={ciSubmitting}>
              {ciSubmitting ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title="Record payment" size="md">
        <form onSubmit={onRecordPayment} className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Records a payment (defaults to <code className="text-xs">SUCCEEDED</code>). If succeeded payments cover the
            invoice total, the invoice is marked <code className="text-xs">PAID</code>.
          </p>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Invoice
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
              value={rpInvoiceId}
              onChange={(e) => setRpInvoiceId(e.target.value)}
              required
            >
              <option value="">— Select —</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} · {inv.totalAmount} {inv.currency} ({inv.status})
                </option>
              ))}
            </select>
          </label>
          <Input label="Amount" value={rpAmount} onChange={(e) => setRpAmount(e.target.value)} required />
          <Input label="Payment method (optional)" value={rpMethod} onChange={(e) => setRpMethod(e.target.value)} placeholder="CARD, NEFT, …" />
          <Input label="Gateway ref (optional)" value={rpRef} onChange={(e) => setRpRef(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={rpSubmitting}>
              {rpSubmitting ? 'Saving…' : 'Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {!loading && !error && (
        <>
          <Card title="Billing cycles">
            <Table<CycleRow>
              data={cycles}
              keyExtractor={(r) => r.id}
              columns={[
                {
                  key: 'tenantId',
                  label: 'Tenant',
                  render: (r) => tenantName(r.tenantId),
                },
                {
                  key: 'periodStart',
                  label: 'Period',
                  render: (r) => `${r.periodStart} → ${r.periodEnd}`,
                },
                { key: 'frequency', label: 'Frequency' },
                { key: 'status', label: 'Status' },
              ]}
            />
          </Card>

          <Card title="Invoices">
            <Table<InvoiceRow>
              data={invoices}
              keyExtractor={(r) => r.id}
              columns={[
                { key: 'invoiceNumber', label: 'Invoice #' },
                {
                  key: 'tenantId',
                  label: 'Tenant',
                  render: (r) => tenantName(r.tenantId),
                },
                {
                  key: 'totalAmount',
                  label: 'Total',
                  render: (r) => `${r.totalAmount} ${r.currency}`,
                },
                { key: 'status', label: 'Status' },
                { key: 'dueDate', label: 'Due', render: (r) => r.dueDate ?? '—' },
                { key: 'paidAt', label: 'Paid at', render: (r) => r.paidAt ?? '—' },
              ]}
            />
          </Card>

          <Card title="Payments (recent)">
            <Table<PaymentRow>
              data={payments}
              keyExtractor={(r) => r.id}
              columns={[
                {
                  key: 'invoiceId',
                  label: 'Invoice id',
                  render: (r) => <span className="font-mono text-xs">{r.invoiceId.slice(0, 8)}…</span>,
                },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'paymentMethod', label: 'Method', render: (r) => r.paymentMethod ?? '—' },
                { key: 'paidAt', label: 'Paid at', render: (r) => r.paidAt ?? '—' },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default OpsBillingPage;
