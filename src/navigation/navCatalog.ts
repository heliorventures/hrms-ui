/**
 * Single source for “where is that feature?” search (command palette, future help).
 * keywords are matched case-insensitively; group is used for section headers in the palette.
 */
export type NavCatalogEntry = {
  path: string;
  label: string;
  group: string;
  /** Extra terms users might type (synonyms, “AI”, HR jargon). */
  keywords: string[];
  adminOnly?: boolean;
};

export const NAV_CATALOG: NavCatalogEntry[] = [
  { path: '/dashboard', label: 'Dashboard', group: 'Home', keywords: ['home', 'start', 'overview'] },
  {
    path: '/insights',
    label: 'Insights',
    group: 'Analytics',
    keywords: ['analytics', 'reports', 'workforce', 'charts', 'data', 'metrics', 'hr insights', 'ai'],
  },
  {
    path: '/attendance',
    label: 'Attendance',
    group: 'Time',
    keywords: ['time', 'punch', 'clock', 'timesheet', 'swipe', 'present'],
  },
  {
    path: '/leave',
    label: 'Leave',
    group: 'Time',
    keywords: ['holiday', 'pto', 'vacation', 'time off', 'absence', 'calendar'],
  },
  {
    path: '/payroll/payslips',
    label: 'Payslips',
    group: 'Pay',
    keywords: ['salary', 'pay', 'wage', 'slip', 'monthly', 'income', 'paysheet'],
  },
  { path: '/payroll/pay', label: 'Pay — salary & pay config', group: 'Pay', keywords: ['components', 'tax slabs', 'cycles', 'compensation', 'income'] },
  { path: '/payroll/tax', label: 'Pay — tax', group: 'Pay', keywords: ['tds', 'income tax', 'deductions', 'regime'] },
  { path: '/expenses', label: 'Expenses & travel', group: 'Money', keywords: ['reimbursement', 'claim', 'travel', 'bills', 'tickets'] },
  { path: '/notifications', label: 'Notifications', group: 'Home', keywords: ['alerts', 'inbox', 'messages', 'reminders'] },
  { path: '/profile/settings', label: 'Profile & settings', group: 'You', keywords: ['account', 'preferences', 'me', 'password', 'my profile'] },
  { path: '/organization/employees', label: 'Organization — people', group: 'People', keywords: ['directory', 'roster', 'staff', 'colleagues', 'team', 'org'] },
  { path: '/organization/org-chart', label: 'Organization — org chart', group: 'People', keywords: ['hierarchy', 'reporting', 'manager', 'tree', 'structure'] },
  { path: '/organization/documents', label: 'Organization — documents', group: 'People', keywords: ['policies', 'handbook', 'files', 'hr documents'] },
  { path: '/workplace/benefits', label: 'Benefits', group: 'Workplace', keywords: ['insurance', 'health', 'plans', 'perks'] },
  { path: '/workplace/recruitment', label: 'Recruitment', group: 'Workplace', keywords: ['hiring', 'jobs', 'candidates', 'applications', 'careers'] },
  {
    path: '/workplace/onboarding',
    label: 'Onboarding & exit',
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
  { path: '/workplace/workflows', label: 'Workflows', group: 'Workplace', keywords: ['approvals', 'routing', 'leave approval', 'process'] },
  { path: '/workplace/performance', label: 'Performance', group: 'Workplace', keywords: ['goals', 'reviews', 'okr', 'appraisal', '1:1'] },
  { path: '/workplace/succession', label: 'Succession', group: 'Workplace', keywords: ['talent', 'pipeline', 'bench', 'competency'] },
  { path: '/workplace/compensation', label: 'Compensation', group: 'Workplace', keywords: ['bands', 'grade', 'salary structure', 'review cycle'] },
  { path: '/workplace/learning', label: 'Learning', group: 'Workplace', keywords: ['lms', 'courses', 'training', 'skills', 'education'] },
  { path: '/workplace/assets', label: 'Assets', group: 'Workplace', keywords: ['laptop', 'equipment', 'inventory', 'it'] },
  {
    path: '/workplace/grievance',
    label: 'Grievance & speak up',
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
    label: 'Admin — employees',
    group: 'Admin',
    keywords: ['manage users', 'bulk', 'import', 'org admin', 'data'],
    adminOnly: true,
  },
  {
    path: '/admin/attendance-policy',
    label: 'Admin — attendance policy',
    group: 'Admin',
    keywords: ['policy', 'shifts', 'rules', 'geo'],
    adminOnly: true,
  },
  { path: '/admin/reports', label: 'Admin — reports', group: 'Admin', keywords: ['export', 'compliance', 'hr reports'], adminOnly: true },
  { path: '/admin/settings', label: 'Admin — settings', group: 'Admin', keywords: ['tenant', 'configuration', 'roles'], adminOnly: true },
  {
    path: '/admin/module-health',
    label: 'Admin — service health',
    group: 'Admin',
    keywords: ['status', 'services', 'graphql', 'devops', 'api', 'green', 'up'],
    adminOnly: true,
  },
];

export function matchesNavFilter(query: string, label: string, path: string, keywords: string[] = []): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const blob = [label, path, ...keywords].join(' ').toLowerCase();
  return q.split(/\s+/).every((w) => w.length > 0 && blob.includes(w));
}
