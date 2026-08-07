/**
 * Runtime app configuration is loaded from `/config.json` (served from `public/config.json`)
 * so environments can be switched without a rebuild by replacing that file.
 */

export interface AppConfig {
  /** Federated GraphQL HTTP endpoint; include path e.g. `/graphql`. */
  gatewayUrl: string;
  /** Auth REST base URL; no trailing slash. */
  authUrl: string;
  /** Optional local-dev tenant id. Production code must not fall back to this. */
  devTenantId?: string;
  /** Optional local-dev tenant slug used only when running Vite locally. */
  devTenantSlug?: string;
  /** Optional base domain for tenant subdomain extraction, e.g. heliorhrms.com. */
  tenantBaseDomain?: string;
}

let cached: AppConfig | null = null;

function trimSlash(u: string): string {
  return u.replace(/\/$/, '');
}

function validate(raw: unknown): AppConfig {
  if (raw === null || typeof raw !== 'object') {
    throw new Error('config.json: expected an object at the top level');
  }
  const { gatewayUrl, authUrl, devTenantId, devTenantSlug, tenantBaseDomain } = raw as Record<
    string,
    unknown
  >;
  if (typeof gatewayUrl !== 'string' || !gatewayUrl.trim()) {
    throw new Error('config.json: "gatewayUrl" is required and must be a non-empty string');
  }
  if (typeof authUrl !== 'string' || !authUrl.trim()) {
    throw new Error('config.json: "authUrl" is required and must be a non-empty string');
  }
  const config: AppConfig = {
    gatewayUrl: trimSlash(gatewayUrl.trim()),
    authUrl: trimSlash(authUrl.trim()),
  };
  if (typeof devTenantId === 'string' && devTenantId.trim()) {
    config.devTenantId = devTenantId.trim();
  }
  if (typeof devTenantSlug === 'string' && devTenantSlug.trim()) {
    config.devTenantSlug = devTenantSlug.trim().toLowerCase();
  }
  if (typeof tenantBaseDomain === 'string' && tenantBaseDomain.trim()) {
    config.tenantBaseDomain = tenantBaseDomain.trim().toLowerCase();
  }
  return config;
}

/**
 * Fetches and caches the app config. Call once at startup before rendering the app.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  if (cached) {
    return cached;
  }
  const res = await fetch('/config.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Failed to load /config.json (${res.status}). Ensure public/config.json exists.`
    );
  }
  const json: unknown = await res.json();
  cached = validate(json);
  return cached;
}

/**
 * Synchronous read of the last loaded config. Only valid after `loadAppConfig` resolves.
 */
export function getAppConfig(): AppConfig {
  if (!cached) {
    throw new Error('App config not loaded. Await loadAppConfig() before using getAppConfig().');
  }
  return cached;
}
