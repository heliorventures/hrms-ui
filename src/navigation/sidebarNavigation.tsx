import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ReceiptText,
  Settings,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarLink {
  path: string;
  label: string;
  icon?: LucideIcon;
}

export interface SidebarGroup {
  key: string;
  label: string;
  basePath: string;
  icon: LucideIcon;
  children: SidebarLink[];
}

export const SIDEBAR_PRIMARY_LINKS: SidebarLink[] = [
  { path: '/insights', label: 'Insights', icon: BarChart3 },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'Attendance', icon: Clock3 },
  { path: '/timesheet', label: 'Timesheet', icon: ClipboardList },
  { path: '/leave', label: 'Leave', icon: CalendarDays },
  { path: '/expenses', label: 'Expenses', icon: ReceiptText },
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    key: 'organization',
    label: 'Organization',
    basePath: '/organization',
    icon: Building2,
    children: [
      { path: '/organization/employees', label: 'Employees' },
      { path: '/organization/org-chart', label: 'Org chart' },
      { path: '/organization/documents', label: 'Documents' },
    ],
  },
  {
    key: 'workplace',
    label: 'Workplace',
    basePath: '/workplace',
    icon: BriefcaseBusiness,
    children: [
      { path: '/workplace/benefits', label: 'Benefits' },
      { path: '/workplace/recruitment', label: 'Recruitment' },
      { path: '/workplace/onboarding', label: 'Onboarding & exit' },
      { path: '/workplace/workflows', label: 'Workflows' },
      { path: '/workplace/performance', label: 'Performance' },
      { path: '/workplace/succession', label: 'Succession' },
      { path: '/workplace/compensation', label: 'Compensation' },
      { path: '/workplace/learning', label: 'Learning' },
      { path: '/workplace/assets', label: 'Assets' },
      { path: '/workplace/grievance', label: 'Grievance' },
    ],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    basePath: '/payroll',
    icon: WalletCards,
    children: [
      { path: '/payroll/payslips', label: 'Payslips' },
      { path: '/payroll/compensation', label: 'Compensation setup' },
      { path: '/payroll/pay', label: 'Income tax (self)' },
      { path: '/payroll/tax', label: 'Tax admin' },
    ],
  },
  {
    key: 'hr',
    label: 'HR',
    basePath: '/hr',
    icon: UsersRound,
    children: [
      { path: '/hr', label: 'Overview' },
      { path: '/hr/people', label: 'People admin' },
      { path: '/hr/leaves', label: 'Leave approvals' },
      { path: '/hr/timesheets', label: 'Timesheet approvals' },
      { path: '/hr/timesheet-assignments', label: 'Timesheet project access' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    basePath: '/admin',
    icon: Settings,
    children: [
      { path: '/admin/employees', label: 'Employees' },
      { path: '/admin/attendance-policy', label: 'Attendance policy' },
      { path: '/admin/timesheet-settings', label: 'Timesheet settings' },
      { path: '/admin/leave-settings', label: 'Leave settings' },
      { path: '/admin/expense-categories', label: 'Expense categories' },
      { path: '/admin/notifications', label: 'Notifications' },
      { path: '/admin/reports', label: 'Reports' },
      { path: '/admin/access', label: 'Roles & permissions' },
      { path: '/admin/module-health', label: 'Service health' },
      { path: '/admin/settings', label: 'Settings' },
    ],
  },
];
