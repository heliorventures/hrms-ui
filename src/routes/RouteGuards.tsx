import { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessTenantPath } from '../auth/navAccess';
import { createPermissionService, type Capability } from '../auth/permissionService';
import { sessionMatchesTenant } from '../auth/tenantSession';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import RouteErrorBoundary from './RouteErrorBoundary';
import RouteStatePage from './RouteStatePage';

const OpsLayout = lazy(() => import('../modules/ops/OpsLayout'));

const OpsLayoutLoadingPage = () => (
  <main className="min-h-screen bg-canvas text-content-primary">
    <RouteStatePage state="loading" statusLabel="Opening operator console" />
  </main>
);

const AuthorizedOpsLayout = () => {
  return (
    <RouteErrorBoundary returnTo="/" returnLabel="Return home">
      <Suspense fallback={<OpsLayoutLoadingPage />}>
        <OpsLayout />
      </Suspense>
    </RouteErrorBoundary>
  );
};

export const ProtectedLayout = () => {
  const { clientSession, isAuthenticated, tenantId } = useAuth();
  const { currentTenant, resolutionStatus } = useTenant();
  const location = useLocation();
  if (resolutionStatus !== 'resolved') {
    return <Navigate to="/" replace />;
  }
  if (!isAuthenticated || !sessionMatchesTenant(tenantId, currentTenant.id)) {
    return <Navigate to="/login" replace />;
  }
  const onForcedPasswordChange =
    location.pathname === '/profile/settings' &&
    new URLSearchParams(location.search).get('tab') === 'security';
  if (clientSession?.mustChangePassword && !onForcedPasswordChange) {
    return <Navigate to="/profile/settings?tab=security" replace />;
  }
  return <AppLayout />;
};

export const OpsProtectedLayout = () => {
  const { isOpsAuthenticated } = useAuth();
  if (!isOpsAuthenticated) {
    return <Navigate to="/ops/login" replace />;
  }
  return <AuthorizedOpsLayout />;
};

export const PayrollPermissionRoute = ({
  children,
  capability,
}: {
  children: JSX.Element;
  capability: Capability;
}) => {
  const { clientSession } = useAuth();
  if (!createPermissionService(clientSession).canCapability(capability)) {
    return (
      <RouteStatePage
        state="access-denied"
        returnTo="/payroll/pay"
        returnLabel="Return to payroll"
      />
    );
  }
  return children;
};

export const TenantPermissionRoute = ({
  tenantPath,
  children,
}: {
  tenantPath: string;
  children: JSX.Element;
}) => {
  const { can, clientSession } = useAuth();
  if (!canAccessTenantPath(tenantPath, { can, clientSession })) {
    return (
      <RouteStatePage
        state="access-denied"
        returnTo="/dashboard"
        returnLabel="Return to dashboard"
      />
    );
  }
  return children;
};

export const TenantResolvingPage = () => (
  <main className="min-h-screen bg-canvas text-content-primary">
    <RouteStatePage state="loading" />
  </main>
);

export const TenantNotFoundPage = () => (
  <main className="min-h-screen bg-canvas text-content-primary">
    <RouteStatePage state="organization-not-found" />
  </main>
);

export const TenantUnavailablePage = () => {
  const { canRetryTenantResolution, retryTenantResolution } = useTenant();
  const handleRetry = () => {
    retryTenantResolution();
  };

  return (
    <main className="min-h-screen bg-canvas text-content-primary">
      <RouteStatePage
        state="unavailable"
        onRetry={canRetryTenantResolution ? handleRetry : undefined}
        retryExhausted={!canRetryTenantResolution}
      />
    </main>
  );
};
