import type { BadgeProps } from '../../../components/common/Badge';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';
import { normalizeCurrencyCode } from './amountValidation';

export function formatCurrency(amount: string, currency = EXPENSE_DEFAULT_CURRENCY): string {
  const parsed = Number(amount);
  const numericAmount = Number.isFinite(parsed) ? parsed : 0;
  const normalizedCurrency = normalizeCurrencyCode(currency);
  if (!normalizedCurrency) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(numericAmount);
  }
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(numericAmount)} ${normalizedCurrency}`;
  }
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
