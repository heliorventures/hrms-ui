import { createContext, useContext } from 'react';

import { DEFAULT_APPEARANCE, type AppearancePreferences } from './preferences';

export const AppearanceContext = createContext({
  preferences: DEFAULT_APPEARANCE,
  savePreferences: (_preferences: AppearancePreferences): boolean => false,
});

export const useAppearance = () => useContext(AppearanceContext);
