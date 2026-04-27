import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../modules/auth/LoginPage';
import Dashboard from '../modules/dashboard/Dashboard';
import AttendancePage from '../modules/attendance/AttendancePage';
import LeavePage from '../modules/leave/LeavePage';
import PayrollPage from '../modules/payroll/PayrollPage';
import PayrollPayPage from '../modules/payroll/PayrollPayPage';
import PayrollTaxPage from '../modules/payroll/PayrollTaxPage';
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

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

const AppRoutes = () => {
  const { role, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="insights" element={<AnalyticsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="payroll" element={<Navigate to="/payroll/payslips" replace />} />
        <Route path="payroll/payslips" element={<PayrollPage />} />
        <Route path="payroll/pay" element={<PayrollPayPage />} />
        <Route path="payroll/tax" element={<PayrollTaxPage />} />
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
        <Route path="workplace/workflows" element={<AdminWorkflowsPage />} />

        {role === 'admin' && (
          <>
            <Route path="admin/employees" element={<AdminEmployeesPage />} />
            <Route path="admin/attendance-policy" element={<AdminAttendancePolicyPage />} />
            <Route path="admin/reports" element={<AdminReportsPage />} />
            <Route path="admin/settings" element={<AdminSettingsPage />} />
            <Route path="admin/module-health" element={<ModuleHealth />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
