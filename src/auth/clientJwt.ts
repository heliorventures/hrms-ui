import { getClientAccessToken } from './tokenStore';

/** Claims shape for client JWT (`kabipay-common` `ClientClaims`), subset for UI gates. */
interface ClientJwtPayload {
  permissions?: string[];
  roles?: string[];
}

function decodeJwtPayload<T>(accessToken: string): T | null {
  const parts = accessToken.split('.');
  if (parts.length < 2) return null;
  try {
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = segment.length % 4;
    const base64 = pad ? segment + '='.repeat(4 - pad) : segment;
    const json = atob(base64);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** Same rule as `ClientClaims::can_approve_expense` (permission or HR / tenant / org admin role). */
export function canApproveExpenseFromAccessToken(accessToken: string | null): boolean {
  if (!accessToken) return false;
  const p = decodeJwtPayload<ClientJwtPayload>(accessToken);
  if (!p) return false;
  if (p.permissions?.includes('expense:approve')) return true;
  return (
    p.roles?.some((r) => {
      const u = r.toUpperCase();
      return u === 'HR_ADMIN' || u === 'TENANT_ADMIN' || u === 'ORG_ADMIN';
    }) ?? false
  );
}

export function canApproveExpenseFromStoredClientToken(): boolean {
  return canApproveExpenseFromAccessToken(getClientAccessToken());
}
