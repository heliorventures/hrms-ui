import { useEffect, useState, type ReactNode } from 'react';

import { useGraphClient } from '../hooks/useGraphClient';

import { useAuth } from './AuthContext';
import { EmployeeDisplayNameContext } from './employeeDisplayNameContext';
import { useTenant } from './TenantContext';

const EmployeeDisplayNameDocument = `query EmployeeDisplayName {
  myEmployee { firstName lastName }
}`;

interface EmployeeNameResponse {
  myEmployee: { firstName: string; lastName: string | null } | null;
}

const EmployeeDisplayNameProvider = ({ children }: { children: ReactNode }) => {
  const { user, tenantId, isAuthenticated } = useAuth();
  const { currentTenant } = useTenant();
  const client = useGraphClient('client');
  const userId = user?.id;
  const scope = `${currentTenant.id}:${userId ?? ''}`;
  const [loaded, setLoaded] = useState<{ scope: string; name: string } | null>(null);
  useEffect(() => {
    if (!isAuthenticated || !userId || tenantId !== currentTenant.id) return;
    let cancelled = false;
    void client
      .request<EmployeeNameResponse>(EmployeeDisplayNameDocument)
      .then((result) => {
        if (cancelled) return;
        const employee = result.myEmployee;
        const name = employee
          ? [employee.firstName, employee.lastName]
              .map((part) => part?.trim())
              .filter(Boolean)
              .join(' ')
          : '';
        setLoaded({ scope, name });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ scope, name: '' });
      });
    return () => {
      cancelled = true;
    };
  }, [client, currentTenant.id, isAuthenticated, scope, tenantId, userId]);
  const name =
    isAuthenticated && tenantId === currentTenant.id && loaded?.scope === scope
      ? loaded.name
      : null;
  return (
    <EmployeeDisplayNameContext.Provider value={name}>
      {children}
    </EmployeeDisplayNameContext.Provider>
  );
};

export default EmployeeDisplayNameProvider;
