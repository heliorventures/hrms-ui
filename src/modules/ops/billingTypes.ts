export type TenantRow = { id: string; name: string };

export type InvoiceRow = {
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

export type PaymentRow = {
  id: string;
  invoiceId: string;
  amount: string;
  paymentMethod?: string | null;
  status: string;
  paidAt?: string | null;
  gatewayRef?: string | null;
};

export type CycleRow = {
  id: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  frequency: string;
  status: string;
  createdAt: string;
};
