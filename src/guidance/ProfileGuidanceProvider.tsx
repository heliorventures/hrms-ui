import { useMemo, useState, type PropsWithChildren } from 'react';

import { ProfileGuidanceContext, type ProfileGuidanceRegistration } from './profileGuidanceState';

export const ProfileGuidanceProvider = ({ children }: PropsWithChildren) => {
  const [registration, setRegistration] = useState<ProfileGuidanceRegistration | null>(null);
  const value = useMemo(() => ({ registration, setRegistration }), [registration]);
  return (
    <ProfileGuidanceContext.Provider value={value}>{children}</ProfileGuidanceContext.Provider>
  );
};
