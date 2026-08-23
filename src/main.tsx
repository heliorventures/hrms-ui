import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { loadAppConfig } from './config';
import {
  applyDocumentTheme,
  persistThemePreference,
  readThemePreference,
  resolveInitialTheme,
} from './contexts/themePreference';
import { ConfigurationError } from './startup/ConfigurationError';
import './index.css';

const rootEl = document.getElementById('root');

void (async () => {
  if (!rootEl) {
    return;
  }

  const preference = readThemePreference();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = resolveInitialTheme(preference, prefersDark);
  if (preference) {
    persistThemePreference(preference);
  }
  applyDocumentTheme(theme);

  try {
    await loadAppConfig();
  } catch (e) {
    createRoot(rootEl).render(<ConfigurationError error={e} />);
    return;
  }

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();
