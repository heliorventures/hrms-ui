import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  GraduationCap,
  House,
  Megaphone,
  ReceiptText,
  Settings,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

import { WORKPLACE_DESTINATIONS } from './workplaceDestinations';

export type NavigationSectionKey =
  | 'myWork'
  | 'people'
  | 'attendance'
  | 'timesheets'
  | 'leave'
  | 'expenses'
  | 'payroll'
  | 'hiring'
  | 'talent'
  | 'engagement'
  | 'reports'
  | 'settings';
export type SidebarPlacement = 'primary' | 'section';

export interface NavigationDestination {
  /** Unique navigable URL, including contextual query parameters. */
  path: string;
  label: string;
  keywords: readonly string[];
  icon?: LucideIcon;
  section?: NavigationSectionKey;
  sidebar?: SidebarPlacement;
  order: number;
  /** Exact registered route whose permission protects a contextual URL. */
  accessPath?: string;
  /** Contextual reports also require a permitted report in this domain. */
  reportDomain?: string;
}

export interface NavigationSection {
  key: NavigationSectionKey;
  label: string;
  icon: LucideIcon;
  order: number;
}

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  { key: 'myWork', label: 'My Work', icon: ClipboardList, order: 10 },
  { key: 'people', label: 'People', icon: Building2, order: 20 },
  { key: 'attendance', label: 'Attendance', icon: Clock3, order: 30 },
  { key: 'timesheets', label: 'Timesheets', icon: ClipboardList, order: 40 },
  { key: 'leave', label: 'Leave', icon: CalendarDays, order: 50 },
  { key: 'expenses', label: 'Expenses & Travel', icon: ReceiptText, order: 60 },
  { key: 'payroll', label: 'Pay & Benefits', icon: WalletCards, order: 70 },
  { key: 'hiring', label: 'Hiring & Exit', icon: BriefcaseBusiness, order: 80 },
  { key: 'talent', label: 'Talent & Development', icon: GraduationCap, order: 90 },
  { key: 'engagement', label: 'Engagement', icon: Megaphone, order: 100 },
  { key: 'reports', label: 'Reports & Insights', icon: BarChart3, order: 130 },
  { key: 'settings', label: 'Settings', icon: Settings, order: 140 },
];

function page(
  section: NavigationSectionKey,
  path: string,
  label: string,
  order: number,
  keywords: readonly string[] = []
): NavigationDestination {
  return { section, path, label, order, keywords, sidebar: 'section' };
}

function reports(
  section: NavigationSectionKey,
  domain: string,
  order: number
): NavigationDestination {
  return {
    ...page(section, `/admin/reports?domain=${domain}`, 'Reports', order, ['export', 'csv']),
    accessPath: '/admin/reports',
    reportDomain: domain,
  };
}

function approvalRules(
  section: 'leave' | 'timesheets' | 'expenses',
  order: number
): NavigationDestination {
  return {
    ...page(section, `/workplace/workflows?domain=${section}`, 'Approval Rules', order, [
      'workflow',
      'routing',
      'approvers',
      'settings',
    ]),
    accessPath: '/workplace/workflows',
  };
}

export const NAVIGATION_DESTINATIONS: readonly NavigationDestination[] = [
  {
    path: '/dashboard',
    label: 'Home',
    keywords: ['home', 'dashboard', 'start', 'overview'],
    icon: House,
    sidebar: 'primary',
    order: 1,
  },
  page('myWork', '/my-work/tasks', 'My Tasks', 11, ['pending', 'survey', 'feedback', 'appraisal']),
  page('myWork', '/notifications', 'Notifications', 12, [
    'alerts',
    'inbox',
    'messages',
    'reminders',
  ]),
  page('myWork', '/my-work/completed', 'Completed / Archive', 13, [
    'submitted',
    'history',
    'forms',
  ]),
  page('people', '/organization/employees', 'Employee Directory', 21, [
    'employees',
    'staff',
    'colleagues',
    'roster',
  ]),
  page('people', '/admin/employees', 'Manage Employees', 22, [
    'employees',
    'create',
    'update',
    'bulk import',
    'people admin',
  ]),
  page('people', '/organization/org-chart', 'Org Chart', 23, [
    'hierarchy',
    'reporting',
    'manager',
    'structure',
  ]),
  page('people', '/organization/profile-reviews', 'Profile Reviews', 24, [
    'approval',
    'profile change',
    'identity',
    'bank',
  ]),
  page('people', '/organization/documents', 'Documents', 25, ['policies', 'handbook', 'files']),
  page('attendance', '/attendance', 'My Attendance', 31, [
    'punch',
    'clock',
    'swipe',
    'present',
    'location',
  ]),
  page('attendance', '/hr/attendance', 'Attendance Management', 32, [
    'regularize',
    'punch adjustments',
    'team',
  ]),
  page('attendance', '/admin/attendance-policy', 'Attendance Policy', 34, [
    'shifts',
    'rules',
    'geo',
    'settings',
  ]),
  page('timesheets', '/timesheet', 'My Timesheets', 41, [
    'hours',
    'project',
    'weekly',
    'submit',
    'billing',
  ]),
  page('timesheets', '/hr/timesheets', 'Approvals', 42, [
    'approve timesheet',
    'reject timesheet',
    'pending',
  ]),
  page('timesheets', '/hr/timesheet-assignments', 'Project Access', 43, [
    'project whitelist',
    'assign projects',
  ]),
  page('timesheets', '/admin/timesheet-settings', 'Settings', 45, [
    'projects',
    'tasks',
    'lock policy',
    'editable weeks',
    'adjustment window',
  ]),
  page('leave', '/leave', 'My Leave', 51, [
    'pto',
    'vacation',
    'time off',
    'absence',
    'balances',
    'apply',
  ]),
  page('leave', '/hr/leaves', 'Approvals', 52, [
    'pending leave',
    'approve leave',
    'reject',
    'queue',
  ]),
  page('leave', '/leave/team-calendar', 'Team Calendar', 53, [
    'who is off',
    'leave grid',
    'team absence',
    'month view',
  ]),
  page('leave', '/leave/holidays', 'Company Holidays', 54, [
    'public holiday',
    'bank holiday',
    'calendar year',
  ]),
  page('leave', '/admin/leave-settings', 'Settings', 56, [
    'leave types',
    'policies',
    'balances',
    'holidays',
    'provision',
    'comp off',
  ]),
  page('expenses', '/expenses', 'Claims & Travel', 61, [
    'reimbursement',
    'claim',
    'travel',
    'bills',
    'tickets',
    'approve',
    'payment',
  ]),
  page('expenses', '/admin/expense-categories', 'Categories & Policies', 62, [
    'meal allowance',
    'claim types',
    'caps',
    'receipt rule',
    'settings',
  ]),
  page('payroll', '/payroll/payslips', 'Payslips & Tax', 71, [
    'my salary',
    'declaration',
    'proof upload',
    'deductions',
    'regime',
  ]),
  page('payroll', '/payroll/pay', 'Payroll Processing', 72, [
    'pay run',
    'payroll cycle',
    'statutory export',
    'paysheet',
  ]),
  page('payroll', '/payroll/compensation', 'Salary Setup', 73, [
    'components',
    'structures',
    'employee ctc',
    'salary assignment',
    'compensation setup',
  ]),
  page('payroll', '/payroll/tax', 'Tax Settings', 76, [
    'tax slabs',
    'tax configuration',
    'tds approval',
  ]),
  page('engagement', '/admin/notifications', 'Announcements', 102, [
    'direct notifications',
    'employee messages',
    'publish',
  ]),
  page('reports', '/insights', 'Insights', 131, [
    'analytics',
    'workforce',
    'charts',
    'data',
    'metrics',
    'ai',
  ]),
  page('reports', '/admin/reports', 'All Reports', 132, [
    'export',
    'compliance',
    'pending requests',
  ]),
  page('settings', '/admin/access', 'Roles & Permissions', 141, [
    'rbac',
    'roles',
    'permissions',
    'access matrix',
    'security',
    'scopes',
  ]),
  page('settings', '/admin/module-health', 'Service Health', 142, [
    'status',
    'services',
    'graphql',
    'api',
    'availability',
  ]),
  reports('people', 'people', 26),
  reports('attendance', 'attendance', 33),
  reports('timesheets', 'timesheets', 44),
  approvalRules('timesheets', 46),
  reports('leave', 'leave', 55),
  approvalRules('leave', 57),
  approvalRules('expenses', 63),
  reports('payroll', 'payroll', 77),
  ...WORKPLACE_DESTINATIONS,
  {
    path: '/performance',
    label: 'Performance',
    keywords: ['goals', 'appraisal', 'setup', 'process', 'review'],
    icon: BarChart3,
    sidebar: 'primary',
    order: 85,
  },
  {
    path: '/profile/settings',
    label: 'Profile & Settings',
    keywords: ['account', 'preferences', 'me', 'password', 'my profile'],
    order: 150,
  },
];
