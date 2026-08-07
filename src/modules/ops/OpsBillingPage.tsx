import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import { useGraphClient } from '@/hooks/useGraphClient';
import { graphQlUserMessage } from '@/utils/graphqlUserMessage';
import CreateInvoiceModal, {
  type CreateInvoiceInput,
} from './components/CreateInvoiceModal';
import OpsBillingTables from './components/OpsBillingTables';
import RecordPaymentModal, {
  type RecordPaymentInput,
} from './components/RecordPaymentModal';
import type { CycleRow, InvoiceRow, PaymentRow, TenantRow } from './billingTypes';
import {
  OPS_BILLING_CYCLES,
  OPS_CREATE_INVOICE,
  OPS_INVOICES,
  OPS_PAYMENTS,
  OPS_RECORD_PAYMENT,
  OPS_TENANTS,
} from './opsGraph';

const BILLING_PAGE_LIMIT = 200;

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
  const [payOpen, setPayOpen] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantId = tenantFilter || undefined;
      const [tenantResult, invoiceResult, paymentResult, cycleResult] = await Promise.all([
        client.request<{ tenants: TenantRow[] }>(OPS_TENANTS, { limit: BILLING_PAGE_LIMIT }),
        client.request<{ invoices: InvoiceRow[] }>(OPS_INVOICES, {
          tenantId,
          limit: BILLING_PAGE_LIMIT,
        }),
        client.request<{ payments: PaymentRow[] }>(OPS_PAYMENTS, {
          invoiceId: undefined,
          limit: BILLING_PAGE_LIMIT,
        }),
        client.request<{ billingCycles: CycleRow[] }>(OPS_BILLING_CYCLES, {
          tenantId,
          limit: BILLING_PAGE_LIMIT,
        }),
      ]);
      setTenants(tenantResult.tenants ?? []);
      setInvoices(invoiceResult.invoices ?? []);
      setPayments(paymentResult.payments ?? []);
      setCycles(cycleResult.billingCycles ?? []);
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [client, tenantFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedTenantId = tenantFilter || tenants[0]?.id || '';
  const selectedInvoiceId = invoices[0]?.id ?? '';

  const createInvoice = async (input: CreateInvoiceInput) => {
    setCreatingInvoice(true);
    setActionError(null);
    try {
      await client.request(OPS_CREATE_INVOICE, { input });
      setToast('Invoice created.');
      setCreateOpen(false);
      await load();
    } catch (err) {
      setActionError(graphQlUserMessage(err));
    } finally {
      setCreatingInvoice(false);
    }
  };

  const recordPayment = async (input: RecordPaymentInput) => {
    setRecordingPayment(true);
    setActionError(null);
    try {
      await client.request(OPS_RECORD_PAYMENT, { input });
      setToast('Payment recorded.');
      setPayOpen(false);
      await load();
    } catch (err) {
      setActionError(graphQlUserMessage(err));
    } finally {
      setRecordingPayment(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Billing"
        description="Invoices, billing cycles, and payments."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setActionError(null);
                setCreateOpen(true);
              }}
            >
              Create invoice
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setActionError(null);
                setPayOpen(true);
              }}
              disabled={invoices.length === 0}
            >
              Record payment
            </Button>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Refresh
            </Button>
          </div>
        }
      />

      <label className="text-sm text-slate-600 dark:text-slate-400">
        Filter by tenant
        <select
          className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          value={tenantFilter}
          onChange={(event) => setTenantFilter(event.target.value)}
        >
          <option value="">All tenants</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </label>

      {toast ? (
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
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <CreateInvoiceModal
        cycles={cycles}
        error={actionError}
        initialTenantId={selectedTenantId}
        isOpen={createOpen}
        submitting={creatingInvoice}
        tenants={tenants}
        onClose={() => setCreateOpen(false)}
        onSubmit={createInvoice}
      />

      <RecordPaymentModal
        error={actionError}
        initialInvoiceId={selectedInvoiceId}
        invoices={invoices}
        isOpen={payOpen}
        submitting={recordingPayment}
        onClose={() => setPayOpen(false)}
        onSubmit={recordPayment}
      />

      {!loading && !error ? (
        <OpsBillingTables
          cycles={cycles}
          invoices={invoices}
          payments={payments}
          tenants={tenants}
        />
      ) : null}
    </div>
  );
};

export default OpsBillingPage;
