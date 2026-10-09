import { BrowserRouter, useLocation } from 'react-router-dom';

import { authorizationStateKey } from './auth/permissionService';
import { CommandPaletteProvider } from './components/layout/CommandPaletteContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DialogProvider } from './contexts/DialogContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { ThemeProvider } from './contexts/ThemeContext';
import FeedbackProvider from './notifications/FeedbackProvider';
import AppRoutes from './routes/AppRoutes';

function dialogApplicationDomain(pathname: string): string {
  if (pathname === '/ops/login') return 'ops-login';
  if (pathname === '/ops' || pathname.startsWith('/ops/')) return 'ops';
  if (pathname === '/login' || pathname === '/forgot-password') return 'tenant-login';
  return 'tenant';
}

const AuthorizationScopedApplication = () => {
  const location = useLocation();
  const { isAuthenticated, isOpsAuthenticated, opsUser, tenantId, user, clientSession } = useAuth();
  const { currentTenant, tenantSlug } = useTenant();
  const dialogAuthorizationOwner = JSON.stringify({
    domain: dialogApplicationDomain(location.pathname),
    tenantPrincipal: isAuthenticated ? (user?.id ?? 'unknown') : null,
    operatorPrincipal: isOpsAuthenticated ? (opsUser?.id ?? 'unknown') : null,
    sessionTenantId: tenantId,
    resolvedTenantId: currentTenant.id || null,
    tenantSlug: tenantSlug ?? null,
  });

  return (
    <DialogProvider key={dialogAuthorizationOwner}>
      <FeedbackProvider key={authorizationStateKey(clientSession)} scopeKey={location.pathname}>
        <CommandPaletteProvider>
          <AppRoutes />
        </CommandPaletteProvider>
      </FeedbackProvider>
    </DialogProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TenantProvider>
          <AuthProvider>
            <AuthorizationScopedApplication />
          </AuthProvider>
        </TenantProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
