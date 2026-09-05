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
  | 'action.timesheet.approve'
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

const SCOPED_CAPABILITY_PERMISSIONS: Partial<
  Record<Capability, { permission: PermissionCode; scopes: readonly ExplicitPermissionScope[] }>
> = {
  'dashboard.attendance': { permission: PERMISSIONS.attendanceRead, scopes: ANY_EXPLICIT_SCOPE },
  'dashboard.leave': { permission: PERMISSIONS.leaveRead, scopes: ANY_EXPLICIT_SCOPE },
  'dashboard.notifications': {
    permission: PERMISSIONS.notificationRead,
    scopes: ANY_EXPLICIT_SCOPE,
  },
  'action.attendance.punch': {
    permission: PERMISSIONS.attendancePunchSelf,
    scopes: SELF_SCOPE,
  },
  'action.attendance.regularize': {
    permission: PERMISSIONS.attendanceRegularize,
    scopes: APPROVAL_SCOPES,
  },
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
  'action.notifications.manage': {
    permission: PERMISSIONS.notificationManage,
    scopes: ALL_SCOPE,
  },
  'action.leave.approve': { permission: PERMISSIONS.leaveApprove, scopes: APPROVAL_SCOPES },
  'action.leave.manage': { permission: PERMISSIONS.leaveManage, scopes: ALL_SCOPE },
  'action.leave.submit': { permission: PERMISSIONS.leaveSubmit, scopes: SELF_SCOPE },
  'action.tax.approve': { permission: PERMISSIONS.taxApprove, scopes: APPROVAL_SCOPES },
  'action.tax.manage': { permission: PERMISSIONS.taxManage, scopes: ALL_SCOPE },
  'action.tax.submit': { permission: PERMISSIONS.taxSubmit, scopes: SELF_SCOPE },
  'action.timesheet.approve': {
    permission: PERMISSIONS.timesheetApprove,
    scopes: APPROVAL_SCOPES,
  },
  'action.timesheet.write': { permission: PERMISSIONS.timesheetWrite, scopes: SELF_SCOPE },
  'action.timesheet.manage': { permission: PERMISSIONS.timesheetManage, scopes: ALL_SCOPE },
  'route.attendance': { permission: PERMISSIONS.attendanceRead, scopes: ANY_EXPLICIT_SCOPE },
  'route.leave': { permission: PERMISSIONS.leaveRead, scopes: ANY_EXPLICIT_SCOPE },
  'route.notifications': {
    permission: PERMISSIONS.notificationRead,
    scopes: ANY_EXPLICIT_SCOPE,
  },
  'route.timesheet': { permission: PERMISSIONS.timesheetRead, scopes: ANY_EXPLICIT_SCOPE },
  'route.hr.attendance': {
    permission: PERMISSIONS.attendanceRegularize,
    scopes: APPROVAL_SCOPES,
  },
  'route.payroll.pay': { permission: PERMISSIONS.payrollManage, scopes: ALL_SCOPE },
  'route.payroll.compensation': { permission: PERMISSIONS.payrollManage, scopes: ALL_SCOPE },
  'route.payroll.payslips': { permission: PERMISSIONS.payrollRead, scopes: ANY_EXPLICIT_SCOPE },
  'route.payroll.tax': { permission: PERMISSIONS.taxManage, scopes: ALL_SCOPE },
  'route.organization.employees': {
    permission: PERMISSIONS.employeeDirectoryRead,
    scopes: ALL_SCOPE,
  },
  'route.organization.orgChart': {
    permission: PERMISSIONS.employeeDirectoryRead,
    scopes: ALL_SCOPE,
  },
  'route.profile.settings': {
    permission: PERMISSIONS.employeeRead,
    scopes: ANY_EXPLICIT_SCOPE,
  },
  'route.admin.access': { permission: PERMISSIONS.roleManage, scopes: ALL_SCOPE },
  'route.admin.attendancePolicy': {
    permission: PERMISSIONS.attendancePunchPolicy,
    scopes: ALL_SCOPE,
  },
  'route.admin.employees': { permission: PERMISSIONS.employeeManage, scopes: ALL_SCOPE },
  'route.admin.expenseCategories': { permission: PERMISSIONS.expenseManage, scopes: ALL_SCOPE },
  'route.admin.leaveSettings': { permission: PERMISSIONS.leaveManage, scopes: ALL_SCOPE },
  'route.admin.moduleHealth': { permission: PERMISSIONS.roleManage, scopes: ALL_SCOPE },
  'route.admin.settings': { permission: PERMISSIONS.roleManage, scopes: ALL_SCOPE },
  'route.insights': { permission: PERMISSIONS.analyticsRead, scopes: ALL_SCOPE },
  'route.workplace.compensation': {
    permission: PERMISSIONS.compensationManage,
    scopes: ALL_SCOPE,
  },
  'route.workplace.learning': { permission: PERMISSIONS.learningManage, scopes: ALL_SCOPE },
  'route.workplace.performance': {
    permission: PERMISSIONS.performanceManage,
    scopes: ALL_SCOPE,
  },
  'route.workplace.recruitment': {
    permission: PERMISSIONS.recruitmentManage,
    scopes: ALL_SCOPE,
  },
  'route.workplace.succession': {
    permission: PERMISSIONS.successionManage,
    scopes: ALL_SCOPE,
  },
  'route.workplace.workflows': { permission: PERMISSIONS.workflowManage, scopes: ALL_SCOPE },
};

export function createPermissionService(session: ParsedClientSession | null): PermissionService {
  const canPermission = (permission: PermissionCode) =>
    session?.permissions.has(permission) ?? false;

  const canScopedPermission = (
    permission: PermissionCode,
    allowedScopes: readonly ExplicitPermissionScope[] = ANY_EXPLICIT_SCOPE
  ): boolean => {
    if (!canPermission(permission)) return false;
    const rawScope = session?.permissionScopes[permission.trim().toLowerCase()];
    const scope = String(rawScope ?? '')
      .trim()
      .toUpperCase() as ExplicitPermissionScope;
    return ANY_EXPLICIT_SCOPE.includes(scope) && allowedScopes.includes(scope);
  };

  const canCapability = (capability: Capability): boolean => {
    const scopedPermission = SCOPED_CAPABILITY_PERMISSIONS[capability];
    if (scopedPermission) {
      return canScopedPermission(scopedPermission.permission, scopedPermission.scopes);
    }
    switch (capability) {
      case 'route.dashboard':
      case 'route.organization.documents':
        return session != null;
      case 'route.expenses':
        return (
          canScopedPermission(PERMISSIONS.expenseRead) ||
          canScopedPermission(PERMISSIONS.expenseSubmit, SELF_SCOPE) ||
          canScopedPermission(PERMISSIONS.expenseApprove, APPROVAL_SCOPES) ||
          canScopedPermission(PERMISSIONS.expenseManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.expensePay, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.travelRead) ||
          canScopedPermission(PERMISSIONS.travelSubmit, SELF_SCOPE) ||
          canScopedPermission(PERMISSIONS.travelApprove, APPROVAL_SCOPES) ||
          canScopedPermission(PERMISSIONS.travelManage, ALL_SCOPE)
        );
      case 'action.onboarding.manage':
        return (
          canScopedPermission(PERMISSIONS.onboardingManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.employeeManage, ALL_SCOPE)
        );
      case 'action.people.search':
        return canScopedPermission(PERMISSIONS.employeeDirectoryRead, ALL_SCOPE);
      case 'route.hr.home':
        return (
          canScopedPermission(PERMISSIONS.employeeWrite, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.leaveManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.timesheetManage, ALL_SCOPE) ||
          canCapability('action.leave.approve') ||
          canCapability('action.timesheet.approve')
        );
      case 'route.hr.people':
      case 'route.organization.profileReviews':
      case 'route.admin.employees':
        return canScopedPermission(PERMISSIONS.employeeManage, ALL_SCOPE);
      case 'route.hr.leaves':
        return (
          canCapability('action.leave.approve') ||
          canScopedPermission(PERMISSIONS.leaveManage, ALL_SCOPE)
        );
      case 'route.hr.timesheets':
        return canCapability('action.timesheet.approve');
      case 'route.hr.timesheetAssignments':
        return canScopedPermission(PERMISSIONS.timesheetManage, ALL_SCOPE);
      case 'route.admin.reports':
        return (
          canScopedPermission(PERMISSIONS.attendanceRead, ALL_SCOPE) &&
          canScopedPermission(PERMISSIONS.employeeRead, ALL_SCOPE) &&
          canScopedPermission(PERMISSIONS.leaveRead, ALL_SCOPE) &&
          canScopedPermission(PERMISSIONS.payrollManage, ALL_SCOPE)
        );
      case 'route.admin.timesheetSettings':
        return (
          canScopedPermission(PERMISSIONS.timesheetManage, ALL_SCOPE) &&
          canScopedPermission(PERMISSIONS.attendancePunchPolicy, ALL_SCOPE)
        );
      case 'route.admin.notifications':
        return canCapability('action.notifications.manage');
      case 'route.workplace.benefits':
        return (
          canScopedPermission(PERMISSIONS.benefitsManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.benefitsSelf, SELF_SCOPE)
        );
      case 'route.workplace.assets':
        return (
          canScopedPermission(PERMISSIONS.assetsManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.assetsRead, ANY_EXPLICIT_SCOPE) ||
          canScopedPermission(PERMISSIONS.assetsSelf, SELF_SCOPE)
        );
      case 'route.workplace.onboarding':
        return (
          canScopedPermission(PERMISSIONS.onboardingManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.onboardingSelf, SELF_SCOPE)
        );
      case 'route.workplace.grievance':
        return (
          canScopedPermission(PERMISSIONS.grievanceManage, ALL_SCOPE) ||
          canScopedPermission(PERMISSIONS.grievanceSelf, SELF_SCOPE)
        );
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
