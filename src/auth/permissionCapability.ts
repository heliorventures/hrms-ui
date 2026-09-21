import type { ParsedClientSession } from './clientSession';
import { PERMISSIONS, type PermissionCode } from './permissions';
import type { Capability, ExplicitPermissionScope } from './permissionService';

type PermissionCheck = {
  kind: 'permission';
  permission: PermissionCode;
  scopes: readonly ExplicitPermissionScope[];
};
type CapabilityCheck = { kind: 'capability'; capability: Capability };
type Check = PermissionCheck | CapabilityCheck;

const check = (
  permission: PermissionCode,
  scopes: readonly ExplicitPermissionScope[]
): PermissionCheck => ({ kind: 'permission', permission, scopes });
const capability = (name: Capability): CapabilityCheck => ({
  kind: 'capability',
  capability: name,
});

const ANY_SCOPE: readonly ExplicitPermissionScope[] = ['SELF', 'TEAM', 'DEPARTMENT', 'ALL'];
const APPROVAL_SCOPE: readonly ExplicitPermissionScope[] = ['TEAM', 'DEPARTMENT', 'ALL'];
const ALL_SCOPE: readonly ExplicitPermissionScope[] = ['ALL'];
const SELF_SCOPE: readonly ExplicitPermissionScope[] = ['SELF'];

const CAPABILITY_ANY_RULES: Partial<Record<Capability, readonly Check[]>> = {
  'action.people.search': [check(PERMISSIONS.employeeDirectoryRead, ALL_SCOPE)],
  'route.hr.people': [check(PERMISSIONS.employeeManage, ALL_SCOPE)],
  'route.organization.profileReviews': [check(PERMISSIONS.employeeManage, ALL_SCOPE)],
  'route.hr.timesheetAssignments': [check(PERMISSIONS.timesheetManage, ALL_SCOPE)],
  'route.admin.notifications': [capability('action.notifications.manage')],
  'route.expenses': [
    check(PERMISSIONS.expenseRead, ANY_SCOPE),
    check(PERMISSIONS.expenseSubmit, SELF_SCOPE),
    check(PERMISSIONS.expenseApprove, APPROVAL_SCOPE),
    check(PERMISSIONS.expenseManage, ALL_SCOPE),
    check(PERMISSIONS.expensePay, ALL_SCOPE),
    check(PERMISSIONS.travelRead, ANY_SCOPE),
    check(PERMISSIONS.travelSubmit, SELF_SCOPE),
    check(PERMISSIONS.travelApprove, APPROVAL_SCOPE),
    check(PERMISSIONS.travelManage, ALL_SCOPE),
  ],
  'action.onboarding.manage': [
    check(PERMISSIONS.onboardingManage, ALL_SCOPE),
    check(PERMISSIONS.employeeManage, ALL_SCOPE),
  ],
  'route.hr.home': [
    check(PERMISSIONS.employeeWrite, ALL_SCOPE),
    check(PERMISSIONS.leaveManage, ALL_SCOPE),
    check(PERMISSIONS.timesheetManage, ALL_SCOPE),
    capability('action.leave.approve'),
    capability('action.timesheet.approve'),
  ],
  'route.hr.leaves': [
    capability('action.leave.approve'),
    check(PERMISSIONS.leaveManage, ALL_SCOPE),
  ],
  'route.hr.timesheets': [capability('action.timesheet.approve')],
  'route.admin.reports': [
    check(PERMISSIONS.attendanceRead, ALL_SCOPE),
    check(PERMISSIONS.employeeRead, ALL_SCOPE),
    check(PERMISSIONS.leaveRead, ALL_SCOPE),
    check(PERMISSIONS.payrollRead, ALL_SCOPE),
    check(PERMISSIONS.timesheetRead, ALL_SCOPE),
    check(PERMISSIONS.expenseRead, ALL_SCOPE),
    check(PERMISSIONS.travelRead, ALL_SCOPE),
  ],
  'route.workplace.benefits': [
    check(PERMISSIONS.benefitsManage, ALL_SCOPE),
    check(PERMISSIONS.benefitsSelf, SELF_SCOPE),
  ],
  'route.workplace.assets': [
    check(PERMISSIONS.assetsManage, ALL_SCOPE),
    check(PERMISSIONS.assetsRead, ANY_SCOPE),
    check(PERMISSIONS.assetsSelf, SELF_SCOPE),
  ],
  'route.workplace.onboarding': [
    check(PERMISSIONS.onboardingManage, ALL_SCOPE),
    check(PERMISSIONS.onboardingSelf, SELF_SCOPE),
  ],
  'route.workplace.prejoining': [
    check(PERMISSIONS.prejoiningManage, ALL_SCOPE),
    check(PERMISSIONS.prejoiningReview, ALL_SCOPE),
  ],
  'route.workplace.grievance': [
    check(PERMISSIONS.grievanceManage, ALL_SCOPE),
    check(PERMISSIONS.grievanceSelf, SELF_SCOPE),
  ],
  'route.workplace.performance': [
    check(PERMISSIONS.performanceManage, ALL_SCOPE),
    check(PERMISSIONS.performanceEvaluate, ['TEAM']),
    check(PERMISSIONS.performanceSelf, SELF_SCOPE),
  ],
  'route.workplace.surveys': [
    check(PERMISSIONS.surveyManage, ALL_SCOPE),
    check(PERMISSIONS.surveyRespond, SELF_SCOPE),
    check(PERMISSIONS.surveyResults, ['TEAM', 'DEPARTMENT', 'ALL']),
  ],
};

const CAPABILITY_ALL_RULES: Partial<Record<Capability, readonly PermissionCheck[]>> = {
  'route.admin.timesheetSettings': [
    check(PERMISSIONS.timesheetManage, ALL_SCOPE),
    check(PERMISSIONS.attendancePunchPolicy, ALL_SCOPE),
  ],
};

const SESSION_CAPABILITIES = new Set<Capability>([
  'route.dashboard',
  'route.organization.documents',
]);
const EMPLOYEE_CAPABILITIES = new Set<Capability>(['route.myWork']);

export type ScopedPermissionEvaluator = (
  permission: PermissionCode,
  allowedScopes: readonly ExplicitPermissionScope[]
) => boolean;

function evaluateCheck(
  current: Check,
  canScopedPermission: ScopedPermissionEvaluator,
  evaluate: (capability: Capability) => boolean
): boolean {
  return current.kind === 'permission'
    ? canScopedPermission(current.permission, current.scopes)
    : evaluate(current.capability);
}

export function evaluateCapability(
  capabilityName: Capability,
  session: ParsedClientSession | null | undefined,
  canScopedPermission: ScopedPermissionEvaluator,
  scopedCapabilities: Partial<
    Record<Capability, { permission: PermissionCode; scopes: readonly ExplicitPermissionScope[] }>
  >
): boolean {
  const scoped = scopedCapabilities[capabilityName];
  if (scoped) return canScopedPermission(scoped.permission, scoped.scopes);
  if (SESSION_CAPABILITIES.has(capabilityName)) return session !== null && session !== undefined;
  if (EMPLOYEE_CAPABILITIES.has(capabilityName)) return Boolean(session?.employeeId);

  const anyRules = CAPABILITY_ANY_RULES[capabilityName];
  if (anyRules) {
    return anyRules.some((current) =>
      evaluateCheck(current, canScopedPermission, (nested) =>
        evaluateCapability(nested, session, canScopedPermission, scopedCapabilities)
      )
    );
  }

  const allRules = CAPABILITY_ALL_RULES[capabilityName];
  return (
    allRules?.every((current) =>
      evaluateCheck(current, canScopedPermission, (nested) =>
        evaluateCapability(nested, session, canScopedPermission, scopedCapabilities)
      )
    ) ?? false
  );
}
