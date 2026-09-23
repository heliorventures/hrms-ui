import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { applyAppearance } from './appearance/applyAppearance';
import { initialAppearance } from './appearance/initialAppearance';
import { systemPrefersDark } from './appearance/useSystemTheme';
import { loadAppConfig } from './config';
import { applyDocumentTheme } from './contexts/themePreference';
import { ConfigurationError } from './startup/ConfigurationError';
import './index.css';

const rootEl = document.getElementById('root');

void (async () => {
  if (!rootEl) {
    return;
  }

  const preference = initialAppearance();
  const dark = preference.mode === 'dark' || (preference.mode === 'system' && systemPrefersDark());
  applyDocumentTheme(dark ? 'dark' : 'light');
  applyAppearance(preference, dark);

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
