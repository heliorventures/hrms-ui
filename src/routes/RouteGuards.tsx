import { Navigate } from 'react-router-dom';
import { canAccessTenantPath } from '../auth/navAccess';
import { createPermissionService, type Capability } from '../auth/permissionService';
import AppLayout from '../components/layout/AppLayout';
import { APP_BRAND } from '../constants/brand';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import OpsLayout from '../modules/ops/OpsLayout';

export const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  const { resolutionStatus } = useTenant();
  if (resolutionStatus !== 'resolved') {
    return <Navigate to="/" replace />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

export const OpsProtectedLayout = () => {
  const { isOpsAuthenticated } = useAuth();
  if (!isOpsAuthenticated) {
    return <Navigate to="/ops/login" replace />;
  }
  return <OpsLayout />;
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
    return <Navigate to="/payroll/pay" replace />;
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
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const TenantResolvingPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
    <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-card dark:border-slate-700 dark:bg-slate-900">
      <h1 className="text-lg font-semibold">{APP_BRAND.productName}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Opening your organization workspace...
      </p>
    </div>
  </main>
);

export const TenantNotFoundPage = ({ message }: { message: string | null }) => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
    <div className="max-w-md rounded-lg border border-amber-200 bg-white p-6 text-center shadow-card dark:border-amber-700/60 dark:bg-slate-900">
      <h1 className="text-lg font-semibold">Organization not found</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {message ?? 'Check the HeliorHRMS link and try again.'}
      </p>
    </div>
  </main>
);
