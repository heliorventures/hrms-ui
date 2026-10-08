import { createContext, type Dispatch, type SetStateAction } from 'react';

import type { ProfileGuidanceAccess } from './tourTypes';

export type ProfileGuidanceRegistration = {
  owner: string;
  employeeId: string;
  access: ProfileGuidanceAccess;
  token: object;
};
export const ProfileGuidanceContext = createContext<{
  registration: ProfileGuidanceRegistration | null;
  setRegistration: Dispatch<SetStateAction<ProfileGuidanceRegistration | null>>;
} | null>(null);
