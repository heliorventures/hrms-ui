import { getClientAccessToken } from './tokenStore';
import { parseClientAccessToken } from './clientSession';
import { PERMISSIONS } from './permissions';

/** Same rule as `ClientClaims::can_approve_expense`: effective `expense:approve` on the JWT. */
export function canApproveExpenseFromAccessToken(accessToken: string | null): boolean {
  if (!accessToken) return false;
  const session = parseClientAccessToken(accessToken);
  if (!session) return false;
  return session.permissions.has(PERMISSIONS.expenseApprove);
}

export function canApproveExpenseFromStoredClientToken(): boolean {
  return canApproveExpenseFromAccessToken(getClientAccessToken());
}

/** Aligns loosely with `ClientClaims::can_mark_expense_payment` (pay or approve permission on JWT). */
export function canMarkExpensePaymentFromAccessToken(accessToken: string | null): boolean {
  if (!accessToken) return false;
  const session = parseClientAccessToken(accessToken);
  if (!session) return false;
  return (
    session.permissions.has(PERMISSIONS.expensePay) ||
    session.permissions.has(PERMISSIONS.expenseApprove)
  );
}
