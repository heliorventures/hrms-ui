/**
 * Runtime app configuration is loaded from `/config.json` (served from `public/config.json`)
 * so environments can be switched without a rebuild by replacing that file.
 */

export interface AppConfig {
  /** Federated GraphQL HTTP endpoint; include path e.g. `/graphql`. */
  gatewayUrl: string;
  /** kabipay-auth REST base URL; no trailing slash. */
  authUrl: string;
  /** Default tenant for dev login and GraphQL `x-tenant-id` when unauthenticated. */
  devTenantId: string;
}

let cached: AppConfig | null = null;

function trimSlash(u: string): string {
  return u.replace(/\/$/, '');
}

function validate(raw: unknown): AppConfig {
  if (raw === null || typeof raw !== 'object') {
    throw new Error('config.json: expected an object at the top level');
  }
  const { gatewayUrl, authUrl, devTenantId } = raw as Record<string, unknown>;
  if (typeof gatewayUrl !== 'string' || !gatewayUrl.trim()) {
    throw new Error('config.json: "gatewayUrl" is required and must be a non-empty string');
  }
  if (typeof authUrl !== 'string' || !authUrl.trim()) {
    throw new Error('config.json: "authUrl" is required and must be a non-empty string');
  }
  if (typeof devTenantId !== 'string' || !devTenantId.trim()) {
    throw new Error('config.json: "devTenantId" is required and must be a non-empty string');
  }
  return {
    gatewayUrl: trimSlash(gatewayUrl.trim()),
    authUrl: trimSlash(authUrl.trim()),
    devTenantId: devTenantId.trim(),
  };
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
