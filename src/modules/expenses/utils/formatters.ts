import type { BadgeProps } from '../../../components/common/Badge';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';

export function formatCurrency(amount: string, currency = EXPENSE_DEFAULT_CURRENCY): string {
  const parsed = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(parsed) ? parsed : 0);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IN');
}

export function shortId(value?: string | null): string {
  return value ? `${value.slice(0, 8)}...` : '-';
}

export function expenseStatusVariant(status: string): BadgeProps['variant'] {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
    case 'submitted':
      return 'warning';
    case 'partial_approved':
    case 'reimbursed':
      return 'info';
    default:
      return 'neutral';
  }
}
