import { createContext, useContext } from 'react';

import { useAuth } from './AuthContext';

export const EmployeeDisplayNameContext = createContext<string | null>(null);

export function useEmployeeDisplayName() {
  const fullName = useContext(EmployeeDisplayNameContext);
  const { user } = useAuth();
  return fullName || user?.name || '';
}
