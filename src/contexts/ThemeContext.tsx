import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { AppearanceContext } from '../appearance/appearanceContext';
import { applyAppearance } from '../appearance/applyAppearance';
import { initialAppearance } from '../appearance/initialAppearance';
import type { AppearancePreferences } from '../appearance/preferences';
import { saveAppearance } from '../appearance/storage';
import { useSystemTheme } from '../appearance/useSystemTheme';

import { applyDocumentTheme, persistThemePreference } from './themePreference';
import type { Theme } from './themePreference';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [preferences, setPreferences] = useState(initialAppearance);
  const systemDark = useSystemTheme();
  const dark = preferences.mode === 'dark' || (preferences.mode === 'system' && systemDark);
  const theme: Theme = dark ? 'dark' : 'light';

  useEffect(() => {
    applyDocumentTheme(theme);
    applyAppearance(preferences, dark);
    if (preferences.mode !== 'system') persistThemePreference(theme);
  }, [dark, preferences, theme]);

  const savePreferences = useCallback((next: AppearancePreferences) => {
    if (!saveAppearance(next)) return false;
    setPreferences(next);
    return true;
  }, []);
  const toggleTheme = useCallback(() => {
    const next: AppearancePreferences = { ...preferences, mode: dark ? 'light' : 'dark' };
    saveAppearance(next);
    setPreferences(next);
  }, [dark, preferences]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  const appearance = useMemo(
    () => ({ preferences, savePreferences }),
    [preferences, savePreferences]
  );

  return (
    <ThemeContext.Provider value={value}>
      <AppearanceContext.Provider value={appearance}>{children}</AppearanceContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
