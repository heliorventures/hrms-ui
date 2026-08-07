import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import type { CycleRow, InvoiceRow, PaymentRow, TenantRow } from '../billingTypes';

interface OpsBillingTablesProps {
  cycles: CycleRow[];
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  tenants: TenantRow[];
}

function tenantName(tenants: TenantRow[], id: string): string {
  return tenants.find((tenant) => tenant.id === id)?.name ?? id.slice(0, 8);
}

const OpsBillingTables = ({ cycles, invoices, payments, tenants }: OpsBillingTablesProps) => (
  <>
    <Card title="Billing cycles">
      <Table<CycleRow>
        data={cycles}
        keyExtractor={(row) => row.id}
        columns={[
          {
            key: 'tenantId',
            label: 'Tenant',
            render: (row) => tenantName(tenants, row.tenantId),
          },
          {
            key: 'periodStart',
            label: 'Period',
            render: (row) => `${row.periodStart} -> ${row.periodEnd}`,
          },
          { key: 'frequency', label: 'Frequency' },
          { key: 'status', label: 'Status' },
        ]}
      />
    </Card>

    <Card title="Invoices">
      <Table<InvoiceRow>
        data={invoices}
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'invoiceNumber', label: 'Invoice #' },
          {
            key: 'tenantId',
            label: 'Tenant',
            render: (row) => tenantName(tenants, row.tenantId),
          },
          {
            key: 'totalAmount',
            label: 'Total',
            render: (row) => `${row.totalAmount} ${row.currency}`,
          },
          { key: 'status', label: 'Status' },
          { key: 'dueDate', label: 'Due', render: (row) => row.dueDate ?? '-' },
          { key: 'paidAt', label: 'Paid at', render: (row) => row.paidAt ?? '-' },
        ]}
      />
    </Card>

    <Card title="Payments (recent)">
      <Table<PaymentRow>
        data={payments}
        keyExtractor={(row) => row.id}
        columns={[
          {
            key: 'invoiceId',
            label: 'Invoice id',
            render: (row) => <span className="font-mono text-xs">{row.invoiceId.slice(0, 8)}...</span>,
          },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
          { key: 'paymentMethod', label: 'Method', render: (row) => row.paymentMethod ?? '-' },
          { key: 'paidAt', label: 'Paid at', render: (row) => row.paidAt ?? '-' },
        ]}
      />
    </Card>
  </>
);

export default OpsBillingTables;
