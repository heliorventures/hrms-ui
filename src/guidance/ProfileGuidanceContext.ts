import { useContext, useEffect } from 'react';

import { authorizationStateKey } from '../auth/permissionService';
import { useAuth } from '../contexts/AuthContext';

import { ProfileGuidanceContext } from './profileGuidanceState';
import type { ProfileGuidanceAccess } from './tourTypes';

export const useProfileGuidanceOwner = () => {
  const auth = useAuth();
  return JSON.stringify([auth.tenantId, auth.user?.id, authorizationStateKey(auth.clientSession)]);
};
export const useProfileGuidanceAccess = (
  employeeId: string | null
): ProfileGuidanceAccess | undefined => {
  const value = useContext(ProfileGuidanceContext);
  const owner = useProfileGuidanceOwner();
  const registration = value?.registration;
  return registration?.owner === owner && registration.employeeId === employeeId
    ? registration.access
    : undefined;
};
export const useRegisterProfileGuidanceAccess = (
  employeeId: string | undefined,
  access: (ProfileGuidanceAccess & { directoryEntry: { employeeId: string } }) | null
) => {
  const value = useContext(ProfileGuidanceContext);
  const setRegistration = value?.setRegistration;
  const owner = useProfileGuidanceOwner();
  useEffect(() => {
    if (!setRegistration || !employeeId || access?.directoryEntry.employeeId !== employeeId) return;
    const token = {};
    setRegistration({ owner, employeeId, access, token });
    return () => setRegistration((previous) => (previous?.token === token ? null : previous));
  }, [access, employeeId, owner, setRegistration]);
};
