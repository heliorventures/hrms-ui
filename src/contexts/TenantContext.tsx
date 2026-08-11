import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Tenant } from '../types';
import { getAppConfig } from '../config';
import { AuthError, resolveTenantBySlug, type ResolvedTenant } from '../auth/authClient';
import { APP_BRAND } from '../constants/brand';
import { graphQlUserMessage } from '../utils/graphqlUserMessage';

type TenantResolutionStatus = 'marketing' | 'resolving' | 'resolved' | 'not-found' | 'error';
const TENANT_SLUG_SESSION_KEY = 'heliorhrms.tenantSlug';
const LOCAL_TENANT_QUERY_KEYS = ['tenant', 'tenantSlug', 'slug'] as const;

interface TenantContextType {
  currentTenant: Tenant;
  tenants: Tenant[];
  tenantSlug: string | null;
  resolutionStatus: TenantResolutionStatus;
  resolutionError: string | null;
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
  };
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
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
    const slug = host.slice(0, -(configuredBase.length + 1)).split('.').pop();
    return slug && slug !== 'www' && slug !== 'app' ? slug : null;
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

function detectTenantSlug(): string | null {
  const pathSlug = slugFromPath(window.location.pathname);
  if (pathSlug) {
    sessionStorage.setItem(TENANT_SLUG_SESSION_KEY, pathSlug);
    return pathSlug;
  }
  const querySlug = slugFromQuery(window.location.search, window.location.hostname);
  if (querySlug) {
    sessionStorage.setItem(TENANT_SLUG_SESSION_KEY, querySlug);
    return querySlug;
  }
  return slugFromHost(window.location.hostname);
}

function tenantResolutionErrorStatus(err: unknown): TenantResolutionStatus {
  if (err instanceof AuthError && (err.status === 404 || err.code === 'TENANT_NOT_FOUND')) {
    return 'not-found';
  }
  return 'error';
}

function tenantResolutionErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return `Cannot reach the authentication service at ${getAppConfig().authUrl}.`;
  }
  return graphQlUserMessage(err);
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const tenantSlug = useMemo(() => detectTenantSlug(), []);
  const [resolvedTenant, setResolvedTenant] = useState<Tenant | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<TenantResolutionStatus>(
    tenantSlug ? 'resolving' : 'marketing'
  );
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantSlug) {
      setResolvedTenant(null);
      setResolutionStatus('marketing');
      setResolutionError(null);
      return;
    }

    let cancelled = false;
    setResolutionStatus('resolving');
    setResolutionError(null);
    void (async () => {
      try {
        const row = await resolveTenantBySlug(tenantSlug);
        if (cancelled) return;
        setResolvedTenant(tenantFromResolved(row));
        setResolutionStatus('resolved');
      } catch (err) {
        if (cancelled) return;
        setResolvedTenant(null);
        setResolutionStatus(tenantResolutionErrorStatus(err));
        setResolutionError(tenantResolutionErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

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
    requiresTenant: tenantSlug !== null,
    switchTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
