import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { sessionMatchesTenant } from '../auth/tenantSession';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import LoginPage from '../modules/auth/LoginPage';
import ForgotPasswordPage from '../modules/auth/ForgotPasswordPage';
import MarketingPage from '../modules/public/MarketingPage';
import OpsLoginPage from '../modules/ops/OpsLoginPage';
import { OPS_CHILD_ROUTES } from './opsRouteConfig';
import { TENANT_APP_ROUTES, type AppChildRoute } from './appRouteConfig';
import {
  OpsProtectedLayout,
  PayrollPermissionRoute,
  ProtectedLayout,
  TenantNotFoundPage,
  TenantPermissionRoute,
  TenantResolvingPage,
} from './RouteGuards';

function routeKey(route: AppChildRoute): string {
  return route.index ? 'index' : (route.path ?? 'missing-path');
}

function withRouteGuard(route: AppChildRoute): JSX.Element {
  if (route.payrollCapability) {
    return (
      <PayrollPermissionRoute capability={route.payrollCapability}>
        {route.element}
      </PayrollPermissionRoute>
    );
  }
  if (route.tenantPath) {
    return (
      <TenantPermissionRoute tenantPath={route.tenantPath}>
        {route.element}
      </TenantPermissionRoute>
    );
  }
  return route.element;
}

function renderChildRoute(route: AppChildRoute): JSX.Element {
  if (route.index) {
    return (
      <Route
        key={routeKey(route)}
        index
        element={withRouteGuard(route)}
      />
    );
  }
  return (
    <Route
      key={routeKey(route)}
      path={route.path}
      element={withRouteGuard(route)}
    />
  );
}

function renderOpsRoute(): JSX.Element {
  return (
    <Route
      path="/ops"
      element={<OpsProtectedLayout />}
    >
      {OPS_CHILD_ROUTES.map(renderChildRoute)}
    </Route>
  );
}

const AppRoutes = () => {
  const { isAuthenticated, isOpsAuthenticated, tenantId } = useAuth();
  const { currentTenant, resolutionStatus, resolutionError } = useTenant();
  const location = useLocation();
  const isTenantAuthenticated =
    isAuthenticated && sessionMatchesTenant(tenantId, currentTenant.id);

  const tenantPathMatch = location.pathname.match(/^\/t\/[^/]+(?<rest>\/.*)?$/);
  if (tenantPathMatch && resolutionStatus === 'resolved') {
    return <Navigate to={tenantPathMatch.groups?.rest ?? '/login'} replace />;
  }

  if (resolutionStatus === 'marketing') {
    return (
      <Routes>
        <Route
          path="/ops/login"
          element={isOpsAuthenticated ? <Navigate to="/ops/tenants" replace /> : <OpsLoginPage />}
        />
        {renderOpsRoute()}
        <Route path="*" element={<MarketingPage />} />
      </Routes>
    );
  }

  if (resolutionStatus === 'resolving') {
    return (
      <Routes>
        <Route path="/ops/login" element={<OpsLoginPage />} />
        <Route path="*" element={<TenantResolvingPage />} />
      </Routes>
    );
  }

  if (resolutionStatus === 'not-found' || resolutionStatus === 'error') {
    return (
      <Routes>
        <Route path="/ops/login" element={<OpsLoginPage />} />
        <Route path="*" element={<TenantNotFoundPage message={resolutionError} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isTenantAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/forgot-password"
        element={isTenantAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/ops/login"
        element={isOpsAuthenticated ? <Navigate to="/ops/tenants" replace /> : <OpsLoginPage />}
      />

      {renderOpsRoute()}

      <Route path="/" element={<ProtectedLayout />}>
        {TENANT_APP_ROUTES.map(renderChildRoute)}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
