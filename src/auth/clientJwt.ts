import { getClientAccessToken } from './tokenStore';
import { parseClientAccessToken } from './clientSession';

/** Same rule as `ClientClaims::can_approve_expense` (permission or HR / tenant / org admin role). */
export function canApproveExpenseFromAccessToken(accessToken: string | null): boolean {
  if (!accessToken) return false;
  const session = parseClientAccessToken(accessToken);
  if (!session) return false;
  if (session.permissions.has('expense:approve')) return true;
  return session.jwtRoles.some((r) => {
    const u = r.toUpperCase();
    return u === 'HR_ADMIN' || u === 'TENANT_ADMIN' || u === 'ORG_ADMIN';
  });
}

export function canApproveExpenseFromStoredClientToken(): boolean {
  return canApproveExpenseFromAccessToken(getClientAccessToken());
}
