import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
  applyDocumentTheme,
  persistThemePreference,
  readThemePreference,
  resolveInitialTheme,
} from './themePreference';
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
  const [theme, setTheme] = useState<Theme>(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return resolveInitialTheme(readThemePreference(), prefersDark);
  });

  useEffect(() => {
    applyDocumentTheme(theme);
    persistThemePreference(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
