import { NAV_LABELS } from '../constants/uiText';

/**
 * Single source for "where is that feature?" search (command palette, future help).
 * Keywords are matched case-insensitively; group is used for section headers in the palette.
 */
export type NavCatalogEntry = {
  path: string;
  label: string;
  group: string;
  /** Extra terms users might type (synonyms, "AI", HR jargon). */
  keywords: string[];
  adminOnly?: boolean;
};

export const NAV_CATALOG: NavCatalogEntry[] = [
  {
    path: '/dashboard',
    label: NAV_LABELS.dashboard,
    group: 'Home',
    keywords: ['home', 'start', 'overview'],
  },
  {
    path: '/insights',
    label: NAV_LABELS.insights,
    group: 'Analytics',
    keywords: [
      'analytics',
      'reports',
      'workforce',
      'charts',
      'data',
      'metrics',
      'hr insights',
      'ai',
    ],
  },
  {
    path: '/attendance',
    label: NAV_LABELS.attendance,
    group: 'Time',
    keywords: ['time', 'punch', 'clock', 'swipe', 'present', 'location', 'regularize'],
  },
  {
    path: '/timesheet',
    label: NAV_LABELS.timesheet,
    group: 'Time',
    keywords: ['hours', 'project', 'weekly', 'submit', 'approve', 'csv', 'billing'],
  },
  {
    path: '/leave',
    label: NAV_LABELS.leave,
    group: 'Time',
    keywords: ['holiday', 'pto', 'vacation', 'time off', 'absence', 'calendar'],
  },
  {
    path: '/leave/holidays',
    label: NAV_LABELS.leaveCompanyHolidays,
    group: 'Time',
    keywords: ['public holiday', 'bank holiday', 'calendar year', 'all holidays'],
  },
  {
    path: '/leave/team-calendar',
    label: NAV_LABELS.leaveTeamCalendar,
    group: 'Time',
    keywords: ['who is off', 'leave grid', 'team absence', 'month view'],
  },
  {
    path: '/payroll/payslips',
    label: NAV_LABELS.payPayrollProcessing,
    group: 'Pay',
    keywords: ['salary', 'pay run', 'payroll cycle', 'statutory export', 'paysheet'],
    adminOnly: true,
  },
  {
    path: '/payroll/compensation',
    label: NAV_LABELS.payCompensationSetup,
    group: 'Pay',
    keywords: ['monthly salary', 'employment history', 'gross base', 'ctc', 'hr payroll', 'annual'],
    adminOnly: true,
  },
  {
    path: '/payroll/pay',
    label: NAV_LABELS.payIncomeTaxSelf,
    group: 'Pay',
    keywords: ['declaration', 'proof upload', 'deductions', 'regime', 'old regime', 'new regime'],
  },
  {
    path: '/payroll/tax',
    label: NAV_LABELS.payTaxAdmin,
    group: 'Pay',
    keywords: ['tax slabs', 'tax configuration', 'tds approval', 'hr tax tools'],
    adminOnly: true,
  },
  {
    path: '/expenses',
    label: NAV_LABELS.expensesTravel,
    group: 'Money',
    keywords: ['reimbursement', 'claim', 'travel', 'bills', 'tickets'],
  },
  {
    path: '/notifications',
    label: NAV_LABELS.notifications,
    group: 'Home',
    keywords: ['alerts', 'inbox', 'messages', 'reminders'],
  },
  {
    path: '/profile/settings',
    label: NAV_LABELS.profileSettings,
    group: 'You',
    keywords: ['account', 'preferences', 'me', 'password', 'my profile'],
  },
  {
    path: '/organization/employees',
    label: NAV_LABELS.organizationPeople,
    group: 'People',
    keywords: ['directory', 'roster', 'staff', 'colleagues', 'team', 'org'],
  },
  {
    path: '/organization/org-chart',
    label: NAV_LABELS.organizationOrgChart,
    group: 'People',
    keywords: ['hierarchy', 'reporting', 'manager', 'tree', 'structure'],
  },
  {
    path: '/organization/documents',
    label: NAV_LABELS.organizationDocuments,
    group: 'People',
    keywords: ['policies', 'handbook', 'files', 'hr documents'],
  },
  {
    path: '/workplace/benefits',
    label: NAV_LABELS.benefits,
    group: 'Workplace',
    keywords: ['insurance', 'health', 'plans', 'perks'],
  },
  {
    path: '/workplace/recruitment',
    label: NAV_LABELS.recruitment,
    group: 'Workplace',
    keywords: ['hiring', 'jobs', 'candidates', 'applications', 'careers'],
  },
  {
    path: '/workplace/onboarding',
    label: NAV_LABELS.onboardingExit,
    group: 'Workplace',
    keywords: [
      'joining',
      'checklist',
      'offboarding',
      'resignation',
      'separation',
      'fnf',
      'full and final',
      'clearance',
      'settlement',
      'exit',
    ],
  },
  {
    path: '/workplace/workflows',
    label: NAV_LABELS.workflows,
    group: 'Workplace',
    keywords: ['approvals', 'routing', 'leave approval', 'process'],
  },
  {
    path: '/hr',
    label: NAV_LABELS.hrWorkbench,
    group: 'HR',
    keywords: ['human resources', 'hr home', 'people ops'],
  },
  {
    path: '/hr/people',
    label: NAV_LABELS.hrPeopleAdmin,
    group: 'HR',
    keywords: ['employees', 'roster', 'directory', 'bulk import', 'hr employees'],
  },
  {
    path: '/hr/leaves',
    label: NAV_LABELS.hrLeaveApprovals,
    group: 'HR',
    keywords: ['pending leave', 'approve leave', 'reject', 'queue', 'inbox'],
  },
  {
    path: '/hr/timesheets',
    label: NAV_LABELS.hrTimesheetApprovals,
    group: 'HR',
    keywords: ['weekly hours', 'approve timesheet', 'reject timesheet', 'pending timesheet'],
  },
  {
    path: '/hr/timesheet-assignments',
    label: NAV_LABELS.hrTimesheetProjectAccess,
    group: 'HR',
    keywords: ['project whitelist', 'timesheet projects', 'assign projects', 'hours'],
  },
  {
    path: '/workplace/performance',
    label: NAV_LABELS.performance,
    group: 'Workplace',
    keywords: ['goals', 'reviews', 'okr', 'appraisal', '1:1'],
  },
  {
    path: '/workplace/succession',
    label: NAV_LABELS.succession,
    group: 'Workplace',
    keywords: ['talent', 'pipeline', 'bench', 'competency'],
  },
  {
    path: '/workplace/compensation',
    label: NAV_LABELS.compensation,
    group: 'Workplace',
    keywords: ['bands', 'grade', 'salary structure', 'review cycle'],
  },
  {
    path: '/workplace/learning',
    label: NAV_LABELS.learning,
    group: 'Workplace',
    keywords: ['lms', 'courses', 'training', 'skills', 'education'],
  },
  {
    path: '/workplace/assets',
    label: NAV_LABELS.assets,
    group: 'Workplace',
    keywords: ['laptop', 'equipment', 'inventory', 'it'],
  },
  {
    path: '/workplace/grievance',
    label: NAV_LABELS.grievanceSpeakUp,
    group: 'Support',
    keywords: [
      'complaint',
      'harassment',
      'hr case',
      'help',
      'support',
      'ethics',
      'posh',
      'concern',
      'issue',
      'report',
      'chat',
      'escalation',
    ],
  },
  {
    path: '/admin/employees',
    label: NAV_LABELS.adminEmployees,
    group: 'Admin',
    keywords: ['manage users', 'bulk', 'import', 'org admin', 'data'],
    adminOnly: true,
  },
  {
    path: '/admin/attendance-policy',
    label: NAV_LABELS.adminAttendancePolicy,
    group: 'Admin',
    keywords: ['policy', 'shifts', 'rules', 'geo'],
    adminOnly: true,
  },
  {
    path: '/admin/timesheet-settings',
    label: NAV_LABELS.adminTimesheetSettings,
    group: 'Admin',
    keywords: ['projects', 'tasks', 'lock policy', 'editable weeks', 'adjustment window'],
    adminOnly: true,
  },
  {
    path: '/admin/leave-settings',
    label: NAV_LABELS.adminLeaveSettings,
    group: 'Admin',
    keywords: [
      'leave types',
      'policies',
      'balances',
      'holidays',
      'calendar',
      'pto config',
      'hr leave',
      'leave policy',
      'provision',
    ],
    adminOnly: true,
  },
  {
    path: '/admin/expense-categories',
    label: NAV_LABELS.adminExpenseCategories,
    group: 'Admin',
    keywords: [
      'travel expense',
      'meal allowance',
      'claim types',
      'expense category',
      'expense policy',
      'caps',
      'receipt rule',
      'expense type',
      'reimbursement',
    ],
    adminOnly: true,
  },
  {
    path: '/admin/access',
    label: NAV_LABELS.adminRolesPermissions,
    group: 'Admin',
    keywords: ['rbac', 'roles', 'permissions', 'access matrix', 'security', 'scopes'],
    adminOnly: true,
  },
  {
    path: '/admin/reports',
    label: NAV_LABELS.adminReports,
    group: 'Admin',
    keywords: ['export', 'compliance', 'hr reports'],
    adminOnly: true,
  },
  {
    path: '/admin/settings',
    label: NAV_LABELS.adminSettings,
    group: 'Admin',
    keywords: ['tenant', 'configuration', 'roles'],
    adminOnly: true,
  },
  {
    path: '/admin/module-health',
    label: NAV_LABELS.adminServiceHealth,
    group: 'Admin',
    keywords: ['status', 'services', 'graphql', 'devops', 'api', 'green', 'up'],
    adminOnly: true,
  },
];

export function matchesNavFilter(
  query: string,
  label: string,
  path: string,
  keywords: string[] = []
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const blob = [label, path, ...keywords].join(' ').toLowerCase();
  return q.split(/\s+/).every((w) => w.length > 0 && blob.includes(w));
}
