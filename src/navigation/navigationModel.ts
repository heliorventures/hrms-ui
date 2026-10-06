import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  GraduationCap,
  House,
  Laptop,
  Megaphone,
  ReceiptText,
  Settings,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

import type { PermissionCode } from '../auth/permissions';
import type { ExplicitPermissionScope } from '../auth/permissionService';

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
  | 'performance'
  | 'assets'
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
  /** Sidebar workspaces contain only destinations already filtered by authorization. */
  members?: readonly NavigationDestination[];
  permission?: PermissionCode;
  anyPermissions?: readonly PermissionCode[];
  scopes?: readonly ExplicitPermissionScope[];
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
  { key: 'performance', label: 'Performance', icon: BarChart3, order: 85 },
  { key: 'talent', label: 'Talent & Development', icon: GraduationCap, order: 90 },
  { key: 'engagement', label: 'Engagement', icon: Megaphone, order: 100 },
  { key: 'assets', label: 'Assets', icon: Laptop, order: 110 },
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
  page('people', '/admin/company-locations', 'Company Locations', 26, [
    'office',
    'branch',
    'location',
    'weekly off',
    'working calendar',
  ]),
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
  page('leave', '/leave/team-calendar', 'Calendar & holidays', 53, [
    'who is off',
    'leave grid',
    'team absence',
    'month view',
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
  page('engagement', '/admin/notifications', 'Announcements & Messages', 102, [
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
  {
    ...page(
      'settings',
      '/workplace/workflows?workspace=settings&domain=leave',
      'Approval rules',
      143,
      ['workflow', 'routing']
    ),
    accessPath: '/workplace/workflows',
  },
  page('settings', '/admin/settings', 'Administration', 144, ['company', 'settings']),
  reports('people', 'people', 26),
  reports('attendance', 'attendance', 33),
  reports('timesheets', 'timesheets', 44),
  approvalRules('timesheets', 46),
  reports('leave', 'leave', 55),
  approvalRules('leave', 57),
  approvalRules('expenses', 63),
  reports('expenses', 'expenses', 64),
  reports('payroll', 'payroll', 77),
  ...WORKPLACE_DESTINATIONS,
  {
    ...page('performance', '/performance?tab=my', 'My reviews', 851),
    accessPath: '/performance',
    permission: 'performance:self',
    scopes: ['SELF'],
  },
  {
    ...page('performance', '/performance?tab=team', 'Team reviews', 852),
    accessPath: '/performance',
    permission: 'performance:evaluate',
    scopes: ['TEAM'],
  },
  ...['setup', 'process', 'review', 'administration'].map((tab, index) => ({
    ...page(
      'performance',
      `/performance?tab=${tab}`,
      tab[0].toUpperCase() + tab.slice(1),
      853 + index
    ),
    accessPath: '/performance',
    permission: 'performance:manage' as const,
    scopes: ['ALL'] as const,
  })),
  {
    ...page('assets', '/workplace/assets?tab=assignments', 'Assignments', 112),
    accessPath: '/workplace/assets',
  },
  {
    ...page('assets', '/workplace/assets?tab=history', 'History', 113),
    accessPath: '/workplace/assets',
  },
  {
    ...page('assets', '/workplace/assets?tab=categories', 'Categories', 114),
    accessPath: '/workplace/assets',
    anyPermissions: ['assets:read', 'assets:manage'],
  },
  {
    path: '/profile/settings',
    label: 'Profile & Settings',
    keywords: ['account', 'preferences', 'me', 'password', 'my profile'],
    order: 150,
  },
];
