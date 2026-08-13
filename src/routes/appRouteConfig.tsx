import { Navigate } from 'react-router-dom';
import AdminAttendancePolicyPage from '../modules/admin/AdminAttendancePolicyPage';
import AdminEmployeesPage from '../modules/admin/AdminEmployeesPage';
import AdminExpenseCategoriesPage from '../modules/admin/AdminExpenseCategoriesPage';
import AdminHrTimesheetSettingsPage from '../modules/admin/AdminHrTimesheetSettingsPage';
import AdminLeaveSettingsPage from '../modules/admin/AdminLeaveSettingsPage';
import AdminNotificationsPage from '../modules/admin/AdminNotificationsPage';
import AdminReportsPage from '../modules/admin/AdminReportsPage';
import AdminSettingsPage from '../modules/admin/AdminSettingsPage';
import AdminWorkflowsPage from '../modules/admin/AdminWorkflowsPage';
import ModuleHealth from '../modules/admin/ModuleHealth';
import AttendancePage from '../modules/attendance/AttendancePage';
import Dashboard from '../modules/dashboard/Dashboard';
import ExpensesPage from '../modules/expenses/ExpensesPage';
import HrAccessManagementPage from '../modules/hr/HrAccessManagementPage';
import HrHomePage from '../modules/hr/HrHomePage';
import HrLeavesPage from '../modules/hr/HrLeavesPage';
import HrTimesheetProjectAssignmentsPage from '../modules/hr/HrTimesheetProjectAssignmentsPage';
import HrTimesheetsPage from '../modules/hr/HrTimesheetsPage';
import AnalyticsPage from '../modules/insights/AnalyticsPage';
import LeavePage from '../modules/leave/LeavePage';
import LeaveHolidaysPage from '../modules/leave/LeaveHolidaysPage';
import LeaveTeamCalendarPage from '../modules/leave/LeaveTeamCalendarPage';
import NotificationsPage from '../modules/notifications/NotificationsPage';
import EmployeeDetailPage from '../modules/organization/EmployeeDetailPage';
import OrgChartPage from '../modules/organization/OrgChartPage';
import OrganizationDocumentsPage from '../modules/organization/OrganizationDocumentsPage';
import OrganizationEmployeesPage from '../modules/organization/OrganizationEmployeesPage';
import ProfileReviewPage from '../modules/organization/ProfileReviewPage';
import PayrollCompensationPage from '../modules/payroll/PayrollCompensationPage';
import PayrollPage from '../modules/payroll/PayrollPage';
import PayrollPayPage from '../modules/payroll/PayrollPayPage';
import PayrollTaxPage from '../modules/payroll/PayrollTaxPage';
import ProfileSettingsPage from '../modules/profile/ProfileSettingsPage';
import TimesheetPage from '../modules/timesheet/TimesheetPage';
import AssetsPage from '../modules/workplace/AssetsPage';
import BenefitsPage from '../modules/workplace/BenefitsPage';
import CompensationPage from '../modules/workplace/CompensationPage';
import GrievancePage from '../modules/workplace/GrievancePage';
import LearningPage from '../modules/workplace/LearningPage';
import OnboardingPage from '../modules/workplace/OnboardingPage';
import PerformancePage from '../modules/workplace/PerformancePage';
import RecruitmentPage from '../modules/workplace/RecruitmentPage';
import SuccessionPage from '../modules/workplace/SuccessionPage';
import type { Capability } from '../auth/permissionService';

export interface AppChildRoute {
  path?: string;
  index?: boolean;
  element: JSX.Element;
  tenantPath?: string;
  payrollCapability?: Capability;
}

export const TENANT_APP_ROUTES: AppChildRoute[] = [
  { index: true, element: <Navigate to="/dashboard" replace /> },
  { path: 'dashboard', tenantPath: '/dashboard', element: <Dashboard /> },
  { path: 'insights', tenantPath: '/insights', element: <AnalyticsPage /> },
  { path: 'attendance', tenantPath: '/attendance', element: <AttendancePage /> },
  { path: 'timesheet', tenantPath: '/timesheet', element: <TimesheetPage /> },
  { path: 'leave/holidays', tenantPath: '/leave/holidays', element: <LeaveHolidaysPage /> },
  { path: 'leave/team-calendar', tenantPath: '/leave/team-calendar', element: <LeaveTeamCalendarPage /> },
  { path: 'leave', tenantPath: '/leave', element: <LeavePage /> },
  { path: 'payroll', element: <Navigate to="/payroll/pay" replace /> },
  { path: 'payroll/payslips', payrollCapability: 'route.payroll.admin', element: <PayrollPage /> },
  { path: 'payroll/pay', payrollCapability: 'route.payroll.self', element: <PayrollPayPage /> },
  { path: 'payroll/tax', payrollCapability: 'route.payroll.tax', element: <PayrollTaxPage /> },
  {
    path: 'payroll/compensation',
    payrollCapability: 'route.payroll.compensation',
    element: <PayrollCompensationPage />,
  },
  { path: 'expenses', tenantPath: '/expenses', element: <ExpensesPage /> },
  { path: 'notifications', tenantPath: '/notifications', element: <NotificationsPage /> },
  { path: 'profile/settings', tenantPath: '/profile/settings', element: <ProfileSettingsPage /> },
  { path: 'organization/employees', tenantPath: '/organization/employees', element: <OrganizationEmployeesPage /> },
  {
    path: 'organization/employees/:employeeId',
    tenantPath: '/organization/employees',
    element: <EmployeeDetailPage />,
  },
  { path: 'organization/org-chart', tenantPath: '/organization/org-chart', element: <OrgChartPage /> },
  { path: 'organization/documents', tenantPath: '/organization/documents', element: <OrganizationDocumentsPage /> },
  { path: 'organization/profile-reviews', tenantPath: '/organization/profile-reviews', element: <ProfileReviewPage /> },
  { path: 'workplace/benefits', tenantPath: '/workplace/benefits', element: <BenefitsPage /> },
  {
    path: 'workplace/recruitment',
    tenantPath: '/workplace/recruitment',
    element: <RecruitmentPage />,
  },
  {
    path: 'workplace/onboarding',
    tenantPath: '/workplace/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: 'workplace/performance',
    tenantPath: '/workplace/performance',
    element: <PerformancePage />,
  },
  {
    path: 'workplace/succession',
    tenantPath: '/workplace/succession',
    element: <SuccessionPage />,
  },
  {
    path: 'workplace/compensation',
    tenantPath: '/workplace/compensation',
    element: <CompensationPage />,
  },
  { path: 'workplace/learning', tenantPath: '/workplace/learning', element: <LearningPage /> },
  { path: 'workplace/assets', tenantPath: '/workplace/assets', element: <AssetsPage /> },
  { path: 'workplace/grievance', tenantPath: '/workplace/grievance', element: <GrievancePage /> },
  {
    path: 'workplace/workflows',
    tenantPath: '/workplace/workflows',
    element: <AdminWorkflowsPage />,
  },
  { path: 'hr', tenantPath: '/hr', element: <HrHomePage /> },
  { path: 'hr/people', tenantPath: '/hr/people', element: <AdminEmployeesPage /> },
  { path: 'hr/leaves', tenantPath: '/hr/leaves', element: <HrLeavesPage /> },
  { path: 'hr/timesheets', tenantPath: '/hr/timesheets', element: <HrTimesheetsPage /> },
  {
    path: 'hr/timesheet-assignments',
    tenantPath: '/hr/timesheet-assignments',
    element: <HrTimesheetProjectAssignmentsPage />,
  },
  {
    path: 'hr/leave-settings',
    tenantPath: '/admin/leave-settings',
    element: <Navigate to="/admin/leave-settings" replace />,
  },
  {
    path: 'hr/access',
    tenantPath: '/admin/access',
    element: <Navigate to="/admin/access" replace />,
  },
  {
    path: 'admin/leave-settings',
    tenantPath: '/admin/leave-settings',
    element: <AdminLeaveSettingsPage />,
  },
  {
    path: 'admin/expense-categories',
    tenantPath: '/admin/expense-categories',
    element: <AdminExpenseCategoriesPage />,
  },
  {
    path: 'admin/notifications',
    tenantPath: '/admin/notifications',
    element: <AdminNotificationsPage />,
  },
  { path: 'admin/employees', tenantPath: '/admin/employees', element: <AdminEmployeesPage /> },
  {
    path: 'admin/attendance-policy',
    tenantPath: '/admin/attendance-policy',
    element: <AdminAttendancePolicyPage />,
  },
  {
    path: 'admin/timesheet-settings',
    tenantPath: '/admin/timesheet-settings',
    element: <AdminHrTimesheetSettingsPage />,
  },
  { path: 'admin/reports', tenantPath: '/admin/reports', element: <AdminReportsPage /> },
  { path: 'admin/access', tenantPath: '/admin/access', element: <HrAccessManagementPage /> },
  { path: 'admin/settings', tenantPath: '/admin/settings', element: <AdminSettingsPage /> },
  { path: 'admin/module-health', tenantPath: '/admin/module-health', element: <ModuleHealth /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];
