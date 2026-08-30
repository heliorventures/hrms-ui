import type { ParsedClientSession } from './clientSession';
import { PERMISSIONS, type PermissionCode } from './permissions';

export type ExplicitPermissionScope = 'SELF' | 'TEAM' | 'DEPARTMENT' | 'ALL';

const ANY_EXPLICIT_SCOPE: readonly ExplicitPermissionScope[] = [
  'SELF',
  'TEAM',
  'DEPARTMENT',
  'ALL',
];
const APPROVAL_SCOPES: readonly ExplicitPermissionScope[] = ['TEAM', 'DEPARTMENT', 'ALL'];
const ALL_SCOPE: readonly ExplicitPermissionScope[] = ['ALL'];
const SELF_SCOPE: readonly ExplicitPermissionScope[] = ['SELF'];

export type Capability =
  | 'dashboard.attendance'
  | 'dashboard.leave'
  | 'dashboard.notifications'
  | 'action.attendance.punch'
  | 'action.attendance.regularize'
  | 'action.expense.approve'
  | 'action.expense.manage'
  | 'action.expense.pay'
  | 'action.expense.submit'
  | 'action.leave.approve'
  | 'action.leave.manage'
  | 'action.leave.submit'
  | 'action.notifications.manage'
  | 'action.onboarding.manage'
  | 'action.people.search'
  | 'action.payroll.manage'
  | 'action.payroll.export'
  | 'action.tax.approve'
  | 'action.tax.manage'
  | 'action.tax.submit'
  | 'action.timesheet.write'
  | 'action.timesheet.manage'
  | 'action.travel.approve'
  | 'action.travel.manage'
  | 'action.travel.submit'
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
  | 'route.payroll.pay'
  | 'route.payroll.compensation'
  | 'route.payroll.payslips'
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
  canScopedPermission: (
    permission: PermissionCode,
    allowedScopes?: readonly ExplicitPermissionScope[]
  ) => boolean;
  canCapability: (capability: Capability) => boolean;
  canRoute: (path: string) => boolean;
}

export function authorizationStateKey(session: ParsedClientSession | null): string {
  if (!session) return 'anonymous';
  const permissions = [...session.permissions].sort().join(',');
  const permissionScopes = Object.entries(session.permissionScopes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([permission, scope]) => `${permission}=${scope}`)
    .join(',');
  return `${session.employeeId ?? 'no-employee'}|${permissions}|${permissionScopes}`;
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
  'dashboard.attendance': PERMISSIONS.attendanceRead,
  'dashboard.leave': PERMISSIONS.leaveRead,
  'dashboard.notifications': PERMISSIONS.notificationRead,
  'action.attendance.regularize': PERMISSIONS.attendanceRegularize,
  'action.attendance.punch': PERMISSIONS.attendancePunchSelf,
  'action.expense.approve': PERMISSIONS.expenseApprove,
  'action.expense.manage': PERMISSIONS.expenseManage,
  'action.expense.pay': PERMISSIONS.expensePay,
  'action.expense.submit': PERMISSIONS.expenseSubmit,
  'action.leave.approve': PERMISSIONS.leaveApprove,
  'action.leave.manage': PERMISSIONS.leaveManage,
  'action.leave.submit': PERMISSIONS.leaveSubmit,
  'action.notifications.manage': PERMISSIONS.notificationManage,
  'action.payroll.manage': PERMISSIONS.payrollManage,
  'action.tax.approve': PERMISSIONS.taxApprove,
  'action.tax.manage': PERMISSIONS.taxManage,
  'action.tax.submit': PERMISSIONS.taxSubmit,
  'action.timesheet.write': PERMISSIONS.timesheetWrite,
  'action.timesheet.manage': PERMISSIONS.timesheetManage,
  'action.travel.approve': PERMISSIONS.travelApprove,
  'action.travel.manage': PERMISSIONS.travelManage,
  'action.travel.submit': PERMISSIONS.travelSubmit,
  'route.attendance': PERMISSIONS.attendanceRead,
  'route.leave': PERMISSIONS.leaveRead,
  'route.notifications': PERMISSIONS.notificationRead,
  'route.organization.employees': PERMISSIONS.employeeRead,
  'route.organization.orgChart': PERMISSIONS.employeeRead,
  'route.payroll.pay': PERMISSIONS.payrollManage,
  'route.payroll.compensation': PERMISSIONS.payrollManage,
  'route.payroll.payslips': PERMISSIONS.payrollRead,
  'route.payroll.tax': PERMISSIONS.taxRead,
  'route.profile.settings': PERMISSIONS.employeeSelf,
  'route.timesheet': PERMISSIONS.timesheetRead,
  'route.hr.attendance': PERMISSIONS.attendanceRegularize,
  'route.admin.access': PERMISSIONS.roleManage,
  'route.admin.attendancePolicy': PERMISSIONS.attendancePunchPolicy,
  'route.admin.expenseCategories': PERMISSIONS.expenseManage,
  'route.admin.leaveSettings': PERMISSIONS.leaveManage,
  'route.admin.moduleHealth': PERMISSIONS.roleManage,
  'route.admin.settings': PERMISSIONS.roleManage,
  'route.insights': PERMISSIONS.analyticsRead,
  'route.workplace.compensation': PERMISSIONS.compensationManage,
  'route.workplace.learning': PERMISSIONS.learningManage,
  'route.workplace.performance': PERMISSIONS.performanceManage,
  'route.workplace.recruitment': PERMISSIONS.recruitmentManage,
  'route.workplace.succession': PERMISSIONS.successionManage,
  'route.workplace.workflows': PERMISSIONS.workflowManage,
};

const SCOPED_CAPABILITY_PERMISSIONS: Partial<
  Record<Capability, { permission: PermissionCode; scopes: readonly ExplicitPermissionScope[] }>
> = {
  'action.expense.approve': { permission: PERMISSIONS.expenseApprove, scopes: APPROVAL_SCOPES },
  'action.expense.manage': { permission: PERMISSIONS.expenseManage, scopes: ALL_SCOPE },
  'action.expense.pay': { permission: PERMISSIONS.expensePay, scopes: ALL_SCOPE },
  'action.expense.submit': { permission: PERMISSIONS.expenseSubmit, scopes: SELF_SCOPE },
  'action.travel.approve': { permission: PERMISSIONS.travelApprove, scopes: APPROVAL_SCOPES },
  'action.travel.manage': { permission: PERMISSIONS.travelManage, scopes: ALL_SCOPE },
  'action.travel.submit': { permission: PERMISSIONS.travelSubmit, scopes: SELF_SCOPE },
  'action.payroll.manage': { permission: PERMISSIONS.payrollManage, scopes: ALL_SCOPE },
  'action.payroll.export': {
    permission: PERMISSIONS.payrollStatutoryExport,
    scopes: ALL_SCOPE,
  },
  'action.tax.approve': { permission: PERMISSIONS.taxApprove, scopes: APPROVAL_SCOPES },
  'action.tax.manage': { permission: PERMISSIONS.taxManage, scopes: ALL_SCOPE },
  'action.tax.submit': { permission: PERMISSIONS.taxSubmit, scopes: SELF_SCOPE },
  'route.payroll.pay': { permission: PERMISSIONS.payrollManage, scopes: ALL_SCOPE },
  'route.payroll.compensation': { permission: PERMISSIONS.payrollManage, scopes: ALL_SCOPE },
  'route.payroll.payslips': { permission: PERMISSIONS.payrollRead, scopes: ANY_EXPLICIT_SCOPE },
  'route.payroll.tax': { permission: PERMISSIONS.taxRead, scopes: ANY_EXPLICIT_SCOPE },
  'route.workplace.compensation': {
    permission: PERMISSIONS.compensationManage,
    scopes: ALL_SCOPE,
  },
};

export function createPermissionService(
  session: ParsedClientSession | null
): PermissionService {
  const canPermission = (permission: PermissionCode) => session?.permissions.has(permission) ?? false;

  const canScopedPermission = (
    permission: PermissionCode,
    allowedScopes: readonly ExplicitPermissionScope[] = ANY_EXPLICIT_SCOPE
  ): boolean => {
    if (!canPermission(permission)) return false;
    const rawScope = session?.permissionScopes[permission.trim().toLowerCase()];
    const scope = String(rawScope ?? '').trim().toUpperCase() as ExplicitPermissionScope;
    return ANY_EXPLICIT_SCOPE.includes(scope) && allowedScopes.includes(scope);
  };

  const canCapability = (capability: Capability): boolean => {
    const scopedPermission = SCOPED_CAPABILITY_PERMISSIONS[capability];
    if (scopedPermission) {
      return canScopedPermission(scopedPermission.permission, scopedPermission.scopes);
    }
    const directPermission = DIRECT_CAPABILITY_PERMISSIONS[capability];
    if (directPermission) return canPermission(directPermission);

    switch (capability) {
      case 'route.dashboard':
      case 'route.organization.documents':
        return session != null;
      case 'route.expenses':
        return (
          canScopedPermission(PERMISSIONS.expenseRead) ||
          canScopedPermission(PERMISSIONS.travelRead)
        );
      case 'action.onboarding.manage':
        return (
          canPermission(PERMISSIONS.onboardingManage) ||
          canPermission(PERMISSIONS.employeeManage)
        );
      case 'action.people.search':
        return (
          hasAnyPermission(session, [
            PERMISSIONS.employeeRead,
            PERMISSIONS.employeeWrite,
            PERMISSIONS.employeeManage,
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
        return canPermission(PERMISSIONS.employeeManage);
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
    canScopedPermission,
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
  '/payroll/pay': 'route.payroll.pay',
  '/payroll/payslips': 'route.payroll.payslips',
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
