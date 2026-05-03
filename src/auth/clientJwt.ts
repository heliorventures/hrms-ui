import { getClientAccessToken } from './tokenStore';
import { parseClientAccessToken } from './clientSession';

/** Same rule as `ClientClaims::can_approve_expense`: effective `expense:approve` on the JWT. */
export function canApproveExpenseFromAccessToken(accessToken: string | null): boolean {
  if (!accessToken) return false;
  const session = parseClientAccessToken(accessToken);
  if (!session) return false;
  return session.permissions.has('expense:approve');
}

export function canApproveExpenseFromStoredClientToken(): boolean {
  return canApproveExpenseFromAccessToken(getClientAccessToken());
}
