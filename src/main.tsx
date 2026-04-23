import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadAppConfig } from './config';
import './index.css';

const rootEl = document.getElementById('root');

void (async () => {
  if (!rootEl) {
    return;
  }
  try {
    await loadAppConfig();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    rootEl.innerHTML = `<div style="font-family:system-ui,sans-serif;padding:1.5rem;max-width:32rem">
      <h1 style="font-size:1.1rem">Configuration error</h1>
      <p style="color:#b91c1c">${msg}</p>
      <p style="color:#64748b;font-size:0.9rem">Fix <code>public/config.json</code> and reload.</p>
    </div>`;
    return;
  }

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
