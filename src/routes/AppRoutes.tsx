import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { sessionMatchesTenant } from '../auth/tenantSession';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

import { TENANT_APP_ROUTES } from './appRouteConfig';
import { OPS_CHILD_ROUTES } from './opsRouteConfig';
import RouteContent from './RouteContent';
import {
  OpsProtectedLayout,
  PayrollPermissionRoute,
  ProtectedLayout,
  TenantNotFoundPage,
  TenantPermissionRoute,
  TenantResolvingPage,
  TenantUnavailablePage,
} from './RouteGuards';
import RouteStatePage from './RouteStatePage';
import type { AppChildRoute, RoutePage } from './routeTypes';

const MARKETING_PAGE: Pick<RoutePage, 'title' | 'load'> = {
  title: 'HR and payroll software',
  load: () => import('../modules/public/MarketingPage'),
};

const LOGIN_PAGE: Pick<RoutePage, 'title' | 'load'> = {
  title: 'Sign in',
  load: () => import('../modules/auth/LoginPage'),
};

const FORGOT_PASSWORD_PAGE: Pick<RoutePage, 'title' | 'load'> = {
  title: 'Reset password',
  load: () => import('../modules/auth/ForgotPasswordPage'),
};

const OPS_LOGIN_PAGE: Pick<RoutePage, 'title' | 'load'> = {
  title: 'Operator sign in',
  load: () => import('../modules/ops/OpsLoginPage'),
};

function routeKey(route: AppChildRoute): string {
  return route.kind === 'redirect' && route.index ? 'index' : (route.path ?? 'missing-path');
}

function withRouteGuard(route: AppChildRoute, content: JSX.Element): JSX.Element {
  if (route.payrollCapability) {
    return (
      <PayrollPermissionRoute capability={route.payrollCapability}>
        {content}
      </PayrollPermissionRoute>
    );
  }
  if (route.tenantPath) {
    return <TenantPermissionRoute tenantPath={route.tenantPath}>{content}</TenantPermissionRoute>;
  }
  return content;
}

function childRouteElement(
  route: AppChildRoute,
  returnTo: string,
  returnLabel: string
): JSX.Element {
  const content =
    route.kind === 'redirect' ? (
      <Navigate to={route.to} replace />
    ) : (
      <RouteContent
        title={route.title}
        load={route.load}
        returnTo={returnTo}
        returnLabel={returnLabel}
      />
    );
  return withRouteGuard(route, content);
}

function renderChildRoute(
  route: AppChildRoute,
  returnTo: string,
  returnLabel: string
): JSX.Element {
  const element = childRouteElement(route, returnTo, returnLabel);
  if (route.kind === 'redirect' && route.index) {
    return <Route key={routeKey(route)} index element={element} />;
  }
  return <Route key={routeKey(route)} path={route.path} element={element} />;
}

function renderOpsRoute(): JSX.Element {
  return (
    <Route path="/ops" element={<OpsProtectedLayout />}>
      {OPS_CHILD_ROUTES.map((route) =>
        renderChildRoute(route, '/ops/tenants', 'Return to tenants')
      )}
      <Route
        path="*"
        element={
          <RouteStatePage
            state="not-found"
            returnTo="/ops/tenants"
            returnLabel="Return to tenants"
          />
        }
      />
    </Route>
  );
}

function operationsRoutes(isOpsAuthenticated: boolean): JSX.Element {
  return (
    <Routes>
      <Route
        path="/ops/login"
        element={
          isOpsAuthenticated ? (
            <Navigate to="/ops/tenants" replace />
          ) : (
            <RouteContent {...OPS_LOGIN_PAGE} returnTo="/" returnLabel="Return home" />
          )
        }
      />
      {renderOpsRoute()}
    </Routes>
  );
}

function tenantResolutionFailurePage(resolutionStatus: 'not-found' | 'error'): JSX.Element {
  if (resolutionStatus === 'not-found') return <TenantNotFoundPage />;
  return <TenantUnavailablePage />;
}

const AppRoutes = () => {
  const { isAuthenticated, isOpsAuthenticated, tenantId } = useAuth();
  const { currentTenant, resolutionStatus, tenantSlug } = useTenant();
  const location = useLocation();

  const isOperationsPath = location.pathname === '/ops' || location.pathname.startsWith('/ops/');
  if (isOperationsPath) {
    return operationsRoutes(isOpsAuthenticated);
  }

  const isTenantAuthenticated = isAuthenticated && sessionMatchesTenant(tenantId, currentTenant.id);
  const tenantPathMatch = location.pathname.match(/^\/t\/(?<slug>[^/]+)(?<rest>\/.*)?$/);
  const pathTenantSlug = tenantPathMatch?.groups?.slug?.toLowerCase();
  if (tenantPathMatch && pathTenantSlug === tenantSlug && resolutionStatus === 'resolved') {
    return <Navigate to={tenantPathMatch.groups?.rest ?? '/login'} replace />;
  }

  if (resolutionStatus === 'marketing') {
    return (
      <Routes>
        <Route path="*" element={<RouteContent {...MARKETING_PAGE} />} />
      </Routes>
    );
  }

  if (resolutionStatus === 'resolving') {
    return (
      <Routes>
        <Route path="*" element={<TenantResolvingPage />} />
      </Routes>
    );
  }

  if (resolutionStatus === 'not-found' || resolutionStatus === 'error') {
    return (
      <Routes>
        <Route path="*" element={tenantResolutionFailurePage(resolutionStatus)} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isTenantAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RouteContent {...LOGIN_PAGE} returnTo="/" returnLabel="Return home" />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isTenantAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RouteContent
              {...FORGOT_PASSWORD_PAGE}
              returnTo="/login"
              returnLabel="Return to sign in"
            />
          )
        }
      />
      <Route path="/" element={<ProtectedLayout />}>
        {TENANT_APP_ROUTES.map((route) =>
          renderChildRoute(route, '/dashboard', 'Return to dashboard')
        )}
        <Route
          path="*"
          element={
            <RouteStatePage
              state="not-found"
              returnTo="/dashboard"
              returnLabel="Return to dashboard"
            />
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
