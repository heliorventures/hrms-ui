import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Tenant } from '../types';
import { useAuth } from './AuthContext';
import { getAppConfig } from '../config';

interface TenantContextType {
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { user } = useAuth();
  const devTenantId = getAppConfig().devTenantId;

  const { tenants, currentTenant } = useMemo(() => {
    // In local dev we pin to config.devTenantId so stale sessions/tokens
    // cannot accidentally switch the UI to another tenant schema.
    const id = devTenantId || user?.tenantId || '';
    const tenant: Tenant = {
      id,
      name: user ? 'Organization' : 'KabiPay',
      companyCode: id.length >= 4 ? id.slice(0, 4).toUpperCase() : id.toUpperCase(),
    };
    return { tenants: [tenant], currentTenant: tenant };
  }, [user, devTenantId]);

  const switchTenant = (_tenantId: string) => {
    // Multi-tenant switching will use API-backed tenant list when available.
  };

  const value = {
    currentTenant,
    tenants,
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
