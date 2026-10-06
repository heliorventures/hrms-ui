import { toDateInputValue } from '../../../utils/dateInput';
import type { ExpenseSubmissionHints } from '../types';

import { normalizeCurrencyCode, parseStrictMoney, validatePositiveMoney } from './amountValidation';
import { formatCurrency } from './formatters';

export interface ExpenseDraft {
  categoryId: string;
  amount: string;
  currency: string;
  expenseDate: string;
  title: string;
  travelRequestId: string;
}

export const expenseDraftError = (draft: ExpenseDraft, hints: ExpenseSubmissionHints | null) => {
  if (!draft.categoryId || !draft.title.trim() || !draft.amount.trim()) {
    return 'Category, title, and amount are required.';
  }
  const amountError = validatePositiveMoney(draft.amount, 'Amount');
  if (amountError) return amountError;
  const currency = normalizeCurrencyCode(draft.currency);
  if (!currency) return 'Currency must be a 3-letter ISO code.';
  if (!draft.expenseDate || draft.expenseDate > toDateInputValue())
    return 'Expense date is required and cannot be in the future.';
  const maximum = hints?.maxAmountPerClaim ?? '';
  if (maximum && parseStrictMoney(draft.amount) > parseStrictMoney(maximum)) {
    return `Amount exceeds the category limit of ${formatCurrency(maximum, currency)}.`;
  }
  return null;
};
