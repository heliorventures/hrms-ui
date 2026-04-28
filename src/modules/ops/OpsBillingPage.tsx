import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import { useGraphClient } from '@/hooks/useGraphClient';
import { OPS_INVOICES, OPS_PAYMENTS, OPS_TENANTS } from './opsGraph';

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

const OpsBillingPage = () => {
  const client = useGraphClient('operator');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [tenantFilter, setTenantFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, inv, pay] = await Promise.all([
        client.request<{ tenants: TenantRow[] }>(OPS_TENANTS, { limit: 200 }),
        client.request<{ invoices: InvoiceRow[] }>(OPS_INVOICES, {
          tenantId: tenantFilter || undefined,
          limit: 200,
        }),
        client.request<{ payments: PaymentRow[] }>(OPS_PAYMENTS, {
          invoiceId: undefined,
          limit: 200,
        }),
      ]);
      setTenants(t.tenants ?? []);
      setInvoices(inv.invoices ?? []);
      setPayments(pay.payments ?? []);
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Billing"
        description="Invoices and payments (read-only). Recording new invoices or payments still uses ops DB scripts / future billing mutations."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Refresh
          </button>
        }
      />

      <label className="text-sm text-slate-600 dark:text-slate-400">
        Filter invoices by tenant
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

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
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
