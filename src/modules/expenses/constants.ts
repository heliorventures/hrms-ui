export const EXPENSE_DEFAULT_CURRENCY = 'INR';
export const EXPENSE_BOARD_LIMIT = 20;

export const EXPENSE_STATUS = {
  approved: 'APPROVED',
  partialApproved: 'PARTIAL_APPROVED',
  paid: 'PAID',
  pending: 'PENDING',
  rejected: 'REJECTED',
} as const;

export const EXPENSE_BUSY_PREFIX = {
  expense: 'e',
  payment: 'pay',
  travel: 't',
} as const;
