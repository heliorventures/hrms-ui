import type { ParsedClientSession } from './clientSession';
import { PERMISSIONS, type PermissionCode } from './permissions';

export type Capability =
  | 'action.attendance.punch'
  | 'action.attendance.regularize'
  | 'action.expense.approve'
  | 'action.expense.manage'
  | 'action.expense.pay'
  | 'action.leave.approve'
  | 'action.leave.manage'
  | 'action.notifications.manage'
  | 'action.onboarding.manage'
  | 'action.people.search'
  | 'action.timesheet.manage'
  | 'route.attendance'
  | 'route.dashboard'
  | 'route.expenses'
  | 'route.admin.access'
  | 'route.admin.attendancePolicy'
  | 'route.admin.employees'
  | 'route.admin.expenseCategories'
  | 'route.admin.leaveSettings'
  | 'route.admin.moduleHealth'
  | 'route.admin.notifications'
  | 'route.admin.reports'
  | 'route.admin.settings'
  | 'route.admin.timesheetSettings'
  | 'route.hr.attendance'
  | 'route.hr.home'
  | 'route.hr.leaves'
  | 'route.hr.people'
  | 'route.hr.timesheetAssignments'
  | 'route.hr.timesheets'
  | 'route.insights'
  | 'route.leave'
  | 'route.notifications'
  | 'route.organization.documents'
  | 'route.organization.employees'
  | 'route.organization.orgChart'
  | 'route.organization.profileReviews'
  | 'route.payroll.admin'
  | 'route.payroll.compensation'
  | 'route.payroll.self'
  | 'route.payroll.tax'
  | 'route.profile.settings'
  | 'route.timesheet'
  | 'route.workplace.assets'
  | 'route.workplace.benefits'
  | 'route.workplace.compensation'
  | 'route.workplace.grievance'
  | 'route.workplace.learning'
  | 'route.workplace.onboarding'
  | 'route.workplace.performance'
  | 'route.workplace.recruitment'
  | 'route.workplace.succession'
  | 'route.workplace.workflows';

export interface PermissionService {
  canPermission: (permission: PermissionCode) => boolean;
  canCapability: (capability: Capability) => boolean;
  canRoute: (path: string) => boolean;
}

function hasAnyPermission(
  session: ParsedClientSession | null,
  permissions: readonly PermissionCode[]
): boolean {
  return permissions.some((permission) => session?.permissions.has(permission) ?? false);
}

function canApproveLeave(session: ParsedClientSession | null): boolean {
  return hasAnyPermission(session, [PERMISSIONS.leaveApprove]);
}

function canApproveTimesheet(session: ParsedClientSession | null): boolean {
  return hasAnyPermission(session, [PERMISSIONS.timesheetApprove]);
}

function canUseHrWorkbench(session: ParsedClientSession | null): boolean {
  return (
    hasAnyPermission(session, [
      PERMISSIONS.employeeWrite,
      PERMISSIONS.leaveManage,
      PERMISSIONS.timesheetManage,
    ]) ||
    canApproveLeave(session) ||
    canApproveTimesheet(session)
  );
}

const DIRECT_CAPABILITY_PERMISSIONS: Partial<Record<Capability, PermissionCode>> = {
  'action.attendance.regularize': PERMISSIONS.attendanceRegularize,
  'action.attendance.punch': PERMISSIONS.attendancePunchSelf,
  'action.expense.manage': PERMISSIONS.expenseManage,
  'action.leave.manage': PERMISSIONS.leaveManage,
  'action.timesheet.manage': PERMISSIONS.timesheetManage,
  'route.hr.attendance': PERMISSIONS.attendanceRegularize,
  'route.admin.access': PERMISSIONS.roleManage,
  'route.admin.attendancePolicy': PERMISSIONS.attendancePunchPolicy,
  'route.admin.expenseCategories': PERMISSIONS.expenseManage,
  'route.admin.leaveSettings': PERMISSIONS.leaveManage,
  'route.admin.moduleHealth': PERMISSIONS.roleManage,
  'route.admin.settings': PERMISSIONS.roleManage,
  'route.insights': PERMISSIONS.analyticsRead,
  'route.payroll.tax': PERMISSIONS.taxApprove,
  'route.workplace.compensation': PERMISSIONS.compensationManage,
  'route.workplace.learning': PERMISSIONS.learningManage,
  'route.workplace.performance': PERMISSIONS.performanceManage,
  'route.workplace.recruitment': PERMISSIONS.recruitmentManage,
  'route.workplace.succession': PERMISSIONS.successionManage,
  'route.workplace.workflows': PERMISSIONS.workflowManage,
};

export function createPermissionService(
  session: ParsedClientSession | null
): PermissionService {
  const canPermission = (permission: PermissionCode) => session?.permissions.has(permission) ?? false;

  const canCapability = (capability: Capability): boolean => {
    const directPermission = DIRECT_CAPABILITY_PERMISSIONS[capability];
    if (directPermission) return canPermission(directPermission);

    switch (capability) {
      case 'route.attendance':
      case 'route.dashboard':
      case 'route.expenses':
      case 'route.leave':
      case 'route.notifications':
      case 'route.organization.documents':
      case 'route.organization.employees':
      case 'route.organization.orgChart':
      case 'route.payroll.self':
      case 'route.profile.settings':
      case 'route.timesheet':
        return session != null;
      case 'action.expense.approve':
        return canPermission(PERMISSIONS.expenseApprove);
      case 'action.expense.pay':
        return canPermission(PERMISSIONS.expensePay);
      case 'action.leave.approve':
        return canApproveLeave(session);
      case 'action.notifications.manage':
        return canPermission(PERMISSIONS.notificationManage);
      case 'action.onboarding.manage':
        return canPermission(PERMISSIONS.onboardingManage) || canPermission(PERMISSIONS.employeeWrite);
      case 'action.people.search':
        return (
          hasAnyPermission(session, [
            PERMISSIONS.employeeWrite,
            PERMISSIONS.roleManage,
            PERMISSIONS.leaveManage,
            PERMISSIONS.expenseManage,
          ]) ||
          canApproveLeave(session)
        );
      case 'route.hr.home':
        return canUseHrWorkbench(session);
      case 'route.hr.people':
      case 'route.organization.profileReviews':
      case 'route.admin.employees':
        return canPermission(PERMISSIONS.employeeWrite);
      case 'route.payroll.compensation':
        return (
          canPermission(PERMISSIONS.compensationManage) ||
          canPermission(PERMISSIONS.payrollStatutoryExport)
        );
      case 'route.payroll.admin':
        return (
          canPermission(PERMISSIONS.payrollStatutoryExport) ||
          canPermission(PERMISSIONS.employeeWrite)
        );
      case 'route.hr.leaves':
        return canApproveLeave(session) || canPermission(PERMISSIONS.leaveManage);
      case 'route.hr.timesheets':
        return canApproveTimesheet(session);
      case 'route.hr.timesheetAssignments':
        return canPermission(PERMISSIONS.timesheetManage) || canApproveTimesheet(session);
      case 'route.admin.attendancePolicy':
        return canPermission(PERMISSIONS.attendancePunchPolicy);
      case 'route.admin.timesheetSettings':
        return (
          canPermission(PERMISSIONS.timesheetManage) ||
          canPermission(PERMISSIONS.attendancePunchPolicy)
        );
      case 'route.admin.notifications':
        return canCapability('action.notifications.manage');
      case 'route.admin.reports':
        return canPermission(PERMISSIONS.attendanceRead);
      case 'route.workplace.benefits':
        return canPermission(PERMISSIONS.benefitsManage) || canPermission(PERMISSIONS.benefitsSelf);
      case 'route.workplace.assets':
        return (
          canPermission(PERMISSIONS.assetsManage) ||
          canPermission(PERMISSIONS.assetsRead) ||
          canPermission(PERMISSIONS.assetsSelf)
        );
      case 'route.workplace.onboarding':
        return canPermission(PERMISSIONS.onboardingManage) || canPermission(PERMISSIONS.onboardingSelf);
      case 'route.workplace.grievance':
        return canPermission(PERMISSIONS.grievanceManage) || canPermission(PERMISSIONS.grievanceSelf);
      default:
        return false;
    }
  };

  const canRoute = (path: string): boolean => {
    const capability = ROUTE_CAPABILITIES[path];
    return capability ? canCapability(capability) : false;
  };

  return {
    canPermission,
    canCapability,
    canRoute,
  };
}

export const ROUTE_CAPABILITIES: Partial<Record<string, Capability>> = {
  '/attendance': 'route.attendance',
  '/dashboard': 'route.dashboard',
  '/expenses': 'route.expenses',
  '/leave': 'route.leave',
  '/leave/holidays': 'route.leave',
  '/leave/team-calendar': 'route.leave',
  '/notifications': 'route.notifications',
  '/organization/documents': 'route.organization.documents',
  '/organization/employees': 'route.organization.employees',
  '/organization/org-chart': 'route.organization.orgChart',
  '/organization/profile-reviews': 'route.organization.profileReviews',
  '/profile/settings': 'route.profile.settings',
  '/timesheet': 'route.timesheet',
  '/admin/access': 'route.admin.access',
  '/admin/attendance-policy': 'route.admin.attendancePolicy',
  '/admin/employees': 'route.admin.employees',
  '/admin/expense-categories': 'route.admin.expenseCategories',
  '/admin/leave-settings': 'route.admin.leaveSettings',
  '/admin/module-health': 'route.admin.moduleHealth',
  '/admin/notifications': 'route.admin.notifications',
  '/admin/reports': 'route.admin.reports',
  '/admin/settings': 'route.admin.settings',
  '/admin/timesheet-settings': 'route.admin.timesheetSettings',
  '/hr': 'route.hr.home',
  '/hr/access': 'route.admin.access',
  '/hr/attendance': 'route.hr.attendance',
  '/hr/leave-settings': 'route.admin.leaveSettings',
  '/hr/leaves': 'route.hr.leaves',
  '/hr/people': 'route.hr.people',
  '/hr/timesheet-assignments': 'route.hr.timesheetAssignments',
  '/hr/timesheets': 'route.hr.timesheets',
  '/insights': 'route.insights',
  '/payroll/pay': 'route.payroll.self',
  '/payroll/payslips': 'route.payroll.admin',
  '/payroll/compensation': 'route.payroll.compensation',
  '/payroll/tax': 'route.payroll.tax',
  '/workplace/assets': 'route.workplace.assets',
  '/workplace/benefits': 'route.workplace.benefits',
  '/workplace/compensation': 'route.workplace.compensation',
  '/workplace/grievance': 'route.workplace.grievance',
  '/workplace/learning': 'route.workplace.learning',
  '/workplace/onboarding': 'route.workplace.onboarding',
  '/workplace/performance': 'route.workplace.performance',
  '/workplace/recruitment': 'route.workplace.recruitment',
  '/workplace/succession': 'route.workplace.succession',
  '/workplace/workflows': 'route.workplace.workflows',
};
