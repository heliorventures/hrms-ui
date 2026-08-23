import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { DialogProvider } from './contexts/DialogContext';
import { CommandPaletteProvider } from './components/layout/CommandPaletteContext';
import AppRoutes from './routes/AppRoutes';

function dialogApplicationDomain(pathname: string): string {
  if (pathname === '/ops/login') return 'ops-login';
  if (pathname === '/ops' || pathname.startsWith('/ops/')) return 'ops';
  if (pathname === '/login' || pathname === '/forgot-password') return 'tenant-login';
  return 'tenant';
}

const AuthorizationScopedApplication = () => {
  const location = useLocation();
  const { isAuthenticated, isOpsAuthenticated, opsUser, tenantId, user } = useAuth();
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
      <CommandPaletteProvider>
        <AppRoutes />
      </CommandPaletteProvider>
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
