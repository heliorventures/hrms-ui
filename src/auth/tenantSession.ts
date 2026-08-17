const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeUuid(value: string | null | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate || !UUID_PATTERN.test(candidate)) return null;
  return candidate.toLowerCase();
}

export function refreshTokenTenantId(token: string): string | null {
  const [tenantId] = token.split('.', 1);
  return normalizeUuid(tenantId);
}

export function sessionMatchesTenant(
  authenticatedTenantId: string | null | undefined,
  resolvedTenantId: string | null | undefined
): boolean {
  const authenticated = normalizeUuid(authenticatedTenantId);
  const resolved = normalizeUuid(resolvedTenantId);
  return authenticated !== null && resolved !== null && authenticated === resolved;
}

export function claimClientSessionBootstrap(
  state: { current: string | null },
  tenantId: string
): boolean {
  if (state.current === tenantId) return false;
  state.current = tenantId;
  return true;
}
