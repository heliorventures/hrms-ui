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
import { NAV_LABELS } from '../constants/uiText';

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
  { path: '/insights', label: NAV_LABELS.insights, icon: BarChart3 },
  { path: '/dashboard', label: NAV_LABELS.dashboard, icon: LayoutDashboard },
  { path: '/attendance', label: NAV_LABELS.attendance, icon: Clock3 },
  { path: '/timesheet', label: NAV_LABELS.timesheet, icon: ClipboardList },
  { path: '/leave', label: NAV_LABELS.leave, icon: CalendarDays },
  { path: '/expenses', label: NAV_LABELS.expenses, icon: ReceiptText },
  { path: '/notifications', label: NAV_LABELS.notifications, icon: Bell },
];

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    key: 'organization',
    label: NAV_LABELS.organization,
    basePath: '/organization',
    icon: Building2,
    children: [
      { path: '/organization/employees', label: NAV_LABELS.employees },
      { path: '/organization/org-chart', label: NAV_LABELS.orgChart },
      { path: '/organization/documents', label: NAV_LABELS.documents },
    ],
  },
  {
    key: 'workplace',
    label: NAV_LABELS.workplace,
    basePath: '/workplace',
    icon: BriefcaseBusiness,
    children: [
      { path: '/workplace/benefits', label: NAV_LABELS.benefits },
      { path: '/workplace/recruitment', label: NAV_LABELS.recruitment },
      { path: '/workplace/onboarding', label: NAV_LABELS.onboardingExit },
      { path: '/workplace/workflows', label: NAV_LABELS.workflows },
      { path: '/workplace/performance', label: NAV_LABELS.performance },
      { path: '/workplace/succession', label: NAV_LABELS.succession },
      { path: '/workplace/compensation', label: NAV_LABELS.compensation },
      { path: '/workplace/learning', label: NAV_LABELS.learning },
      { path: '/workplace/assets', label: NAV_LABELS.assets },
      { path: '/workplace/grievance', label: NAV_LABELS.grievance },
    ],
  },
  {
    key: 'payroll',
    label: NAV_LABELS.payroll,
    basePath: '/payroll',
    icon: WalletCards,
    children: [
      { path: '/payroll/payslips', label: NAV_LABELS.payrollProcessing },
      { path: '/payroll/compensation', label: NAV_LABELS.compensationSetup },
      { path: '/payroll/pay', label: NAV_LABELS.incomeTaxSelf },
      { path: '/payroll/tax', label: NAV_LABELS.taxAdmin },
    ],
  },
  {
    key: 'hr',
    label: NAV_LABELS.hr,
    basePath: '/hr',
    icon: UsersRound,
    children: [
      { path: '/hr', label: NAV_LABELS.overview },
      { path: '/hr/people', label: NAV_LABELS.peopleAdmin },
      { path: '/hr/leaves', label: NAV_LABELS.leaveApprovals },
      { path: '/hr/timesheets', label: NAV_LABELS.timesheetApprovals },
      { path: '/hr/timesheet-assignments', label: NAV_LABELS.timesheetProjectAccess },
    ],
  },
  {
    key: 'admin',
    label: NAV_LABELS.admin,
    basePath: '/admin',
    icon: Settings,
    children: [
      { path: '/admin/employees', label: NAV_LABELS.employees },
      { path: '/admin/attendance-policy', label: NAV_LABELS.attendancePolicy },
      { path: '/admin/timesheet-settings', label: NAV_LABELS.timesheetSettings },
      { path: '/admin/leave-settings', label: NAV_LABELS.leaveSettings },
      { path: '/admin/expense-categories', label: NAV_LABELS.expenseCategories },
      { path: '/admin/notifications', label: NAV_LABELS.notifications },
      { path: '/admin/reports', label: NAV_LABELS.reports },
      { path: '/admin/access', label: NAV_LABELS.rolesPermissions },
      { path: '/admin/module-health', label: NAV_LABELS.serviceHealth },
      { path: '/admin/settings', label: NAV_LABELS.settings },
    ],
  },
];
