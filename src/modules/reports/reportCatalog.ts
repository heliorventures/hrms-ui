import type { ParsedClientSession } from '../../auth/clientSession';
import type { PermissionCode } from '../../auth/permissions';
import { createPermissionService } from '../../auth/permissionService';

import type { HrReportKind } from './reportDocuments';

export type ReportKind = 'ATTENDANCE_DAILY' | HrReportKind;
export interface ReportDefinition {
  kind: ReportKind;
  label: string;
  description: string;
  permissions: PermissionCode[];
}
export const REPORTS: ReportDefinition[] = [
  {
    kind: 'ATTENDANCE_DAILY',
    label: 'Daily attendance',
    description: 'Scheduled days, absence, incomplete punches and completed hours.',
    permissions: ['attendance:read'],
  },
  {
    kind: 'ATTENDANCE_PUNCTUALITY',
    label: 'Attendance punctuality',
    description:
      'First recorded punch per employee and day; missing lateness data is shown as unknown.',
    permissions: ['attendance:read'],
  },
  {
    kind: 'LEAVE_REQUESTS',
    label: 'Leave requests',
    description: 'Requests overlapping the period, including status, unpaid leave and comp-off.',
    permissions: ['leave:read'],
  },
  {
    kind: 'LEAVE_BALANCES',
    label: 'Leave balances',
    description: 'Current balances for leave years in the period. Comp-off has a separate report.',
    permissions: ['leave:read'],
  },
  {
    kind: 'PAYROLL_REGISTER',
    label: 'Payroll register',
    description: 'Generated payslips, gross salary, deductions and net salary by payroll month.',
    permissions: ['payroll:read'],
  },
  {
    kind: 'UNPAID_LEAVE',
    label: 'Unpaid-leave calculations',
    description: 'Stored basic pay, divisor, unpaid days, deduction and calculation treatment.',
    permissions: ['payroll:read'],
  },
  {
    kind: 'EMPLOYEE_MOVEMENTS',
    label: 'Employee joiners and exits',
    description: 'Joining and completed separation dates within the selected period.',
    permissions: ['employee:read'],
  },
  {
    kind: 'TIMESHEET_HOURS',
    label: 'Timesheet and project hours',
    description: 'Employee, project, work description, hours and approval status.',
    permissions: ['timesheet:read'],
  },
  {
    kind: 'COMP_OFF_CREDITS',
    label: 'Comp-off credits',
    description: 'Credits earned in the period with current usage and original expiry dates.',
    permissions: ['leave:read'],
  },
  {
    kind: 'PENDING_REQUESTS',
    label: 'Pending requests',
    description:
      'Company workload submitted in the period for the domains you can read. Approval routing remains unchanged.',
    permissions: ['leave:read', 'timesheet:read', 'expense:read', 'travel:read'],
  },
];

export const REPORT_DOMAINS = {
  people: { title: 'People Reports', kinds: ['EMPLOYEE_MOVEMENTS'] },
  attendance: {
    title: 'Attendance Reports',
    kinds: ['ATTENDANCE_DAILY', 'ATTENDANCE_PUNCTUALITY'],
  },
  leave: {
    title: 'Leave Reports',
    kinds: ['LEAVE_REQUESTS', 'LEAVE_BALANCES', 'COMP_OFF_CREDITS'],
  },
  timesheets: { title: 'Timesheet Reports', kinds: ['TIMESHEET_HOURS'] },
  payroll: { title: 'Payroll Reports', kinds: ['PAYROLL_REGISTER', 'UNPAID_LEAVE'] },
} satisfies Record<string, { title: string; kinds: ReportKind[] }>;

export type ReportDomain = keyof typeof REPORT_DOMAINS;

export function isReportDomain(domain: string): domain is ReportDomain {
  return Object.prototype.hasOwnProperty.call(REPORT_DOMAINS, domain);
}

export function availableReports(session: ParsedClientSession | null, domain?: string | null) {
  if (domain !== null && domain !== undefined && !isReportDomain(domain)) return [];
  const service = createPermissionService(session);
  const permitted = REPORTS.filter((report) =>
    report.permissions.some((permission) => service.canScopedPermission(permission, ['ALL']))
  );
  if (domain === null || domain === undefined) return permitted;
  const { kinds }: { kinds: readonly ReportKind[] } = REPORT_DOMAINS[domain];
  return permitted.filter((report) => kinds.includes(report.kind));
}
