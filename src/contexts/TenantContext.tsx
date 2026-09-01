import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

import { AuthError, resolveTenantBySlug, type ResolvedTenant } from '../auth/authClient';
import { authUserMessage } from '../auth/authUserMessage';
import { getAppConfig } from '../config';
import { APP_BRAND } from '../constants/brand';
import type { Tenant } from '../types';
import { normalizeTenantTimezone } from '../utils/tenantCalendar';

export type TenantResolutionStatus = 'marketing' | 'resolving' | 'resolved' | 'not-found' | 'error';

export const TENANT_RESOLUTION_TIMEOUT_MS = 10_000;
export const MAX_TENANT_RESOLUTION_ATTEMPTS = 3;

const TENANT_SLUG_SESSION_KEY = 'heliorhrms.tenantSlug';
const LOCAL_TENANT_QUERY_KEYS = ['tenant', 'tenantSlug', 'slug'] as const;

interface TenantContextType {
  currentTenant: Tenant;
  tenants: Tenant[];
  tenantSlug: string | null;
  resolutionStatus: TenantResolutionStatus;
  resolutionError: string | null;
  retryTenantResolution: () => boolean;
  canRetryTenantResolution: boolean;
  requiresTenant: boolean;
  switchTenant: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

function emptyTenant(): Tenant {
  return {
    id: '',
    name: APP_BRAND.productName,
    companyCode: 'HELIOR',
    timezone: 'UTC',
  };
}

function tenantFromResolved(row: ResolvedTenant): Tenant {
  return {
    id: row.id,
    name: row.name,
    companyCode: row.subdomain.slice(0, 4).toUpperCase(),
    logoUrl: row.logoUrl,
    status: row.status,
    slug: row.subdomain,
    primaryColor: row.primaryColor,
    timezone: normalizeTenantTimezone(row.timezone),
  };
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function slugForConfiguredBase(host: string, configuredBase: string): string | null {
  const slug = host
    .slice(0, -(configuredBase.length + 1))
    .split('.')
    .pop();
  return slug && slug !== 'www' && slug !== 'app' ? slug : null;
}

function slugFromPath(pathname: string): string | null {
  const [scope, slug] = pathname.split('/').filter(Boolean);
  if (scope !== 't' || !slug) return null;
  return slug.toLowerCase();
}

function slugFromHost(hostname: string): string | null {
  const host = hostname.toLowerCase();
  if (isLocalHost(host)) {
    return getAppConfig().devTenantSlug ?? sessionStorage.getItem(TENANT_SLUG_SESSION_KEY);
  }

  const configuredBase = getAppConfig().tenantBaseDomain;
  if (configuredBase && host.endsWith(`.${configuredBase}`)) {
    return slugForConfiguredBase(host, configuredBase);
  }

  const [subdomain] = host.split('.');
  if (host.split('.').length >= 3 && subdomain !== 'www' && subdomain !== 'app') {
    return subdomain;
  }
  return null;
}

function slugFromQuery(search: string, hostname: string): string | null {
  if (!isLocalHost(hostname)) return null;
  const params = new URLSearchParams(search);
  for (const key of LOCAL_TENANT_QUERY_KEYS) {
    const slug = params.get(key)?.trim().toLowerCase();
    if (slug) return slug;
  }
  return null;
}

function detectTenantSlug(pathname: string, search: string, hostname: string): string | null {
  const pathSlug = slugFromPath(pathname);
  if (pathSlug) {
    sessionStorage.setItem(TENANT_SLUG_SESSION_KEY, pathSlug);
    return pathSlug;
  }
  const querySlug = slugFromQuery(search, hostname);
  if (querySlug) {
    sessionStorage.setItem(TENANT_SLUG_SESSION_KEY, querySlug);
    return querySlug;
  }
  return slugFromHost(hostname);
}

function tenantResolutionErrorStatus(err: unknown): TenantResolutionStatus {
  try {
    if (err instanceof AuthError && (err.status === 404 || err.code === 'TENANT_NOT_FOUND')) {
      return 'not-found';
    }
  } catch {
    return 'error';
  }
  return 'error';
}

function tenantResolutionErrorMessage(err: unknown): string {
  return authUserMessage(err, 'tenant-resolution');
}

interface TenantResolutionResult {
  resolvedTenant: Tenant | null;
  resolutionStatus: TenantResolutionStatus;
  resolutionError: string | null;
  retryTenantResolution: () => boolean;
  canRetryTenantResolution: boolean;
}

interface TenantResolutionRequestState {
  active: boolean;
  timeoutId: number | null;
}

function ownsTenantResolutionRequest(requestState: TenantResolutionRequestState): boolean {
  return requestState.active;
}

function clearTenantResolutionTimeout(requestState: TenantResolutionRequestState): void {
  if (requestState.timeoutId === null) return;
  window.clearTimeout(requestState.timeoutId);
  requestState.timeoutId = null;
}

function initialResolutionStatus(tenantSlug: string | null): TenantResolutionStatus {
  return tenantSlug ? 'resolving' : 'marketing';
}

function useTenantResolution(tenantSlug: string | null): TenantResolutionResult {
  const initialStatus = initialResolutionStatus(tenantSlug);
  const initialAttempt = tenantSlug ? 1 : 0;
  const [resolvedTenant, setResolvedTenant] = useState<Tenant | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<TenantResolutionStatus>(initialStatus);
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(initialAttempt);
  const statusRef = useRef<TenantResolutionStatus>(initialStatus);
  const attemptRef = useRef(initialAttempt);

  const updateStatus = useCallback((status: TenantResolutionStatus) => {
    statusRef.current = status;
    setResolutionStatus(status);
  }, []);

  useEffect(() => {
    if (!tenantSlug) {
      attemptRef.current = 0;
      setAttemptNumber(0);
      setResolvedTenant(null);
      updateStatus('marketing');
      setResolutionError(null);
      return;
    }

    const controller = new AbortController();
    const requestState: TenantResolutionRequestState = { active: true, timeoutId: null };
    updateStatus('resolving');
    setResolutionError(null);

    void (async () => {
      await Promise.resolve();
      if (!ownsTenantResolutionRequest(requestState)) return;
      requestState.timeoutId = window.setTimeout(
        () => controller.abort(),
        TENANT_RESOLUTION_TIMEOUT_MS
      );

      try {
        const row = await resolveTenantBySlug(tenantSlug, { signal: controller.signal });
        if (!ownsTenantResolutionRequest(requestState)) return;
        setResolvedTenant(tenantFromResolved(row));
        setResolutionError(null);
        updateStatus('resolved');
      } catch (err) {
        if (!ownsTenantResolutionRequest(requestState)) return;
        setResolvedTenant(null);
        setResolutionError(tenantResolutionErrorMessage(err));
        updateStatus(tenantResolutionErrorStatus(err));
      } finally {
        clearTenantResolutionTimeout(requestState);
      }
    })();

    return () => {
      requestState.active = false;
      clearTenantResolutionTimeout(requestState);
      controller.abort();
    };
  }, [attemptNumber, tenantSlug, updateStatus]);

  const retryTenantResolution = useCallback((): boolean => {
    if (!tenantSlug || statusRef.current !== 'error') return false;
    if (attemptRef.current >= MAX_TENANT_RESOLUTION_ATTEMPTS) return false;

    const nextAttempt = attemptRef.current + 1;
    attemptRef.current = nextAttempt;
    updateStatus('resolving');
    setResolutionError(null);
    setAttemptNumber(nextAttempt);
    return true;
  }, [tenantSlug, updateStatus]);

  return {
    resolvedTenant,
    resolutionStatus,
    resolutionError,
    retryTenantResolution,
    canRetryTenantResolution:
      resolutionStatus === 'error' && attemptNumber < MAX_TENANT_RESOLUTION_ATTEMPTS,
  };
}

interface TenantResolutionScopeProps extends TenantProviderProps {
  tenantSlug: string | null;
}

const TenantResolutionScope = ({ children, tenantSlug }: TenantResolutionScopeProps) => {
  const {
    resolvedTenant,
    resolutionStatus,
    resolutionError,
    retryTenantResolution,
    canRetryTenantResolution,
  } = useTenantResolution(tenantSlug);

  const currentTenant = useMemo<Tenant>(() => {
    if (resolvedTenant) return resolvedTenant;
    return emptyTenant();
  }, [resolvedTenant]);

  const switchTenant = (_tenantId: string) => {
    // Tenant switching is intentionally disabled until the API provides a scoped tenant list.
  };

  const value = {
    currentTenant,
    tenants: currentTenant.id ? [currentTenant] : [],
    tenantSlug,
    resolutionStatus,
    resolutionError,
    retryTenantResolution,
    canRetryTenantResolution,
    requiresTenant: tenantSlug !== null,
    switchTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const location = useLocation();
  const pathTenantSlug = slugFromPath(location.pathname);
  const [ownedTenantSlug, setOwnedTenantSlug] = useState<string | null>(() =>
    detectTenantSlug(location.pathname, location.search, window.location.hostname)
  );
  const tenantSlug = pathTenantSlug ?? ownedTenantSlug;

  useEffect(() => {
    if (!pathTenantSlug) return;
    sessionStorage.setItem(TENANT_SLUG_SESSION_KEY, pathTenantSlug);
    setOwnedTenantSlug(pathTenantSlug);
  }, [pathTenantSlug]);

  return (
    <TenantResolutionScope key={tenantSlug ?? 'marketing'} tenantSlug={tenantSlug}>
      {children}
    </TenantResolutionScope>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
