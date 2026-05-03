import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessTenantPath } from '../auth/navAccess';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../modules/auth/LoginPage';
import OpsLoginPage from '../modules/ops/OpsLoginPage';
import OpsLayout from '../modules/ops/OpsLayout';
import OpsTenantsPage from '../modules/ops/OpsTenantsPage';
import OpsModulesPage from '../modules/ops/OpsModulesPage';
import OpsBillingPage from '../modules/ops/OpsBillingPage';
import OpsOperatorsPage from '../modules/ops/OpsOperatorsPage';
import OpsFeatureFlagsPage from '../modules/ops/OpsFeatureFlagsPage';
import Dashboard from '../modules/dashboard/Dashboard';
import AttendancePage from '../modules/attendance/AttendancePage';
import LeavePage from '../modules/leave/LeavePage';
import LeaveHolidaysPage from '../modules/leave/LeaveHolidaysPage';
import LeaveTeamCalendarPage from '../modules/leave/LeaveTeamCalendarPage';
import PayrollPage from '../modules/payroll/PayrollPage';
import PayrollPayPage from '../modules/payroll/PayrollPayPage';
import PayrollTaxPage from '../modules/payroll/PayrollTaxPage';
import PayrollCompensationPage from '../modules/payroll/PayrollCompensationPage';
import ExpensesPage from '../modules/expenses/ExpensesPage';
import NotificationsPage from '../modules/notifications/NotificationsPage';
import ProfileSettingsPage from '../modules/profile/ProfileSettingsPage';
import OrganizationEmployeesPage from '../modules/organization/OrganizationEmployeesPage';
import OrganizationDocumentsPage from '../modules/organization/OrganizationDocumentsPage';
import OrgChartPage from '../modules/organization/OrgChartPage';
import EmployeeDetailPage from '../modules/organization/EmployeeDetailPage';
import AdminEmployeesPage from '../modules/admin/AdminEmployeesPage';
import AdminReportsPage from '../modules/admin/AdminReportsPage';
import AdminSettingsPage from '../modules/admin/AdminSettingsPage';
import ModuleHealth from '../modules/admin/ModuleHealth';
import AdminAttendancePolicyPage from '../modules/admin/AdminAttendancePolicyPage';
import AdminLeaveSettingsPage from '../modules/admin/AdminLeaveSettingsPage';
import BenefitsPage from '../modules/workplace/BenefitsPage';
import RecruitmentPage from '../modules/workplace/RecruitmentPage';
import OnboardingPage from '../modules/workplace/OnboardingPage';
import PerformancePage from '../modules/workplace/PerformancePage';
import LearningPage from '../modules/workplace/LearningPage';
import AssetsPage from '../modules/workplace/AssetsPage';
import GrievancePage from '../modules/workplace/GrievancePage';
import SuccessionPage from '../modules/workplace/SuccessionPage';
import CompensationPage from '../modules/workplace/CompensationPage';
import AnalyticsPage from '../modules/insights/AnalyticsPage';
import AdminWorkflowsPage from '../modules/admin/AdminWorkflowsPage';
import HrHomePage from '../modules/hr/HrHomePage';
import HrAccessManagementPage from '../modules/hr/HrAccessManagementPage';
import HrLeavesPage from '../modules/hr/HrLeavesPage';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

const OpsProtectedLayout = () => {
  const { isOpsAuthenticated } = useAuth();
  if (!isOpsAuthenticated) {
    return <Navigate to="/ops/login" replace />;
  }
  return <OpsLayout />;
};

const PayrollAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { showTenantAdminNav } = useAuth();
  if (!showTenantAdminNav) return <Navigate to="/payroll/pay" replace />;
  return children;
};

const TenantPermissionRoute = ({
  tenantPath,
  children,
}: {
  tenantPath: string;
  children: JSX.Element;
}) => {
  const { isElevated, can, clientSession, showTenantAdminNav, showHrNav } = useAuth();
  const jwtPermissionCount = clientSession?.permissions.size ?? 0;
  if (
    !canAccessTenantPath(tenantPath, {
      isElevated,
      can,
      jwtPermissionCount,
      showTenantAdminNav,
      showHrNav,
      clientSession,
    })
  ) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { showTenantAdminNav, isAuthenticated, isOpsAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/ops/login"
        element={isOpsAuthenticated ? <Navigate to="/ops/tenants" replace /> : <OpsLoginPage />}
      />

      <Route path="/ops" element={<OpsProtectedLayout />}>
        <Route index element={<Navigate to="/ops/tenants" replace />} />
        <Route path="tenants" element={<OpsTenantsPage />} />
        <Route path="modules" element={<OpsModulesPage />} />
        <Route path="billing" element={<OpsBillingPage />} />
        <Route path="operators" element={<OpsOperatorsPage />} />
        <Route path="feature-flags" element={<OpsFeatureFlagsPage />} />
        <Route path="*" element={<Navigate to="/ops/tenants" replace />} />
      </Route>

      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="insights" element={<AnalyticsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave/holidays" element={<LeaveHolidaysPage />} />
        <Route path="leave/team-calendar" element={<LeaveTeamCalendarPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="payroll" element={<Navigate to="/payroll/payslips" replace />} />
        <Route path="payroll/payslips" element={<PayrollPage />} />
        <Route path="payroll/pay" element={<PayrollPayPage />} />
        <Route
          path="payroll/tax"
          element={
            <PayrollAdminRoute>
              <PayrollTaxPage />
            </PayrollAdminRoute>
          }
        />
        <Route
          path="payroll/compensation"
          element={
            <PayrollAdminRoute>
              <PayrollCompensationPage />
            </PayrollAdminRoute>
          }
        />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile/settings" element={<ProfileSettingsPage />} />
        <Route path="organization/employees" element={<OrganizationEmployeesPage />} />
        <Route path="organization/employees/:employeeId" element={<EmployeeDetailPage />} />
        <Route path="organization/org-chart" element={<OrgChartPage />} />
        <Route path="organization/documents" element={<OrganizationDocumentsPage />} />

        <Route path="workplace/benefits" element={<BenefitsPage />} />
        <Route path="workplace/recruitment" element={<RecruitmentPage />} />
        <Route path="workplace/onboarding" element={<OnboardingPage />} />
        <Route path="workplace/performance" element={<PerformancePage />} />
        <Route path="workplace/succession" element={<SuccessionPage />} />
        <Route path="workplace/compensation" element={<CompensationPage />} />
        <Route path="workplace/learning" element={<LearningPage />} />
        <Route path="workplace/assets" element={<AssetsPage />} />
        <Route path="workplace/grievance" element={<GrievancePage />} />
        <Route
          path="workplace/workflows"
          element={
            <TenantPermissionRoute tenantPath="/workplace/workflows">
              <AdminWorkflowsPage />
            </TenantPermissionRoute>
          }
        />

        <Route
          path="hr"
          element={
            <TenantPermissionRoute tenantPath="/hr">
              <HrHomePage />
            </TenantPermissionRoute>
          }
        />
        <Route
          path="hr/people"
          element={
            <TenantPermissionRoute tenantPath="/hr/people">
              <AdminEmployeesPage />
            </TenantPermissionRoute>
          }
        />
        <Route
          path="hr/leaves"
          element={
            <TenantPermissionRoute tenantPath="/hr/leaves">
              <HrLeavesPage />
            </TenantPermissionRoute>
          }
        />
        <Route
          path="hr/leave-settings"
          element={
            <TenantPermissionRoute tenantPath="/hr/leave-settings">
              <AdminLeaveSettingsPage />
            </TenantPermissionRoute>
          }
        />
        <Route
          path="hr/access"
          element={
            <TenantPermissionRoute tenantPath="/hr/access">
              <HrAccessManagementPage />
            </TenantPermissionRoute>
          }
        />

        <Route
          path="admin/leave-settings"
          element={
            <TenantPermissionRoute tenantPath="/admin/leave-settings">
              <AdminLeaveSettingsPage />
            </TenantPermissionRoute>
          }
        />

        {showTenantAdminNav && (
          <>
            <Route
              path="admin/employees"
              element={
                <TenantPermissionRoute tenantPath="/admin/employees">
                  <AdminEmployeesPage />
                </TenantPermissionRoute>
              }
            />
            <Route
              path="admin/attendance-policy"
              element={
                <TenantPermissionRoute tenantPath="/admin/attendance-policy">
                  <AdminAttendancePolicyPage />
                </TenantPermissionRoute>
              }
            />
            <Route
              path="admin/reports"
              element={
                <TenantPermissionRoute tenantPath="/admin/reports">
                  <AdminReportsPage />
                </TenantPermissionRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <TenantPermissionRoute tenantPath="/admin/settings">
                  <AdminSettingsPage />
                </TenantPermissionRoute>
              }
            />
            <Route
              path="admin/module-health"
              element={
                <TenantPermissionRoute tenantPath="/admin/module-health">
                  <ModuleHealth />
                </TenantPermissionRoute>
              }
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
