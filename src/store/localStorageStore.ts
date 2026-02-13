/**
 * Client-side data store with localStorage persistence for demo purposes.
 * All data is stored in a single JSON object in localStorage.
 */

import type {
  TimesheetEntry,
  AttendanceRecord,
  LeaveApplication,
  LeaveBalance,
  Employee,
  Payslip,
  SalaryHistoryEntry,
  ExpenseClaim,
  TravelRequest,
  Notification,
  Holiday,
  AttendanceStatus,
} from '../types';
import { mockAttendance } from '../mocks/attendance';
import { mockLeaveApplications, mockLeaveBalances, mockHolidays } from '../mocks/leaves';
import { mockEmployees } from '../mocks/employees';
import { mockPayslips, mockSalaryHistory } from '../mocks/payroll';
import { mockExpenses, mockTravelRequests } from '../mocks/expenses';
import { mockNotifications } from '../mocks/notifications';

const STORAGE_KEY = 'kabipay-demo-data';

// Derive attendance status from total hours for the day
const FULL_DAY_HOURS = 8;
const HALF_DAY_HOURS = 4;

export function getAttendanceStatusFromHours(hours: number): AttendanceStatus {
  if (hours >= FULL_DAY_HOURS) return 'present';
  if (hours >= HALF_DAY_HOURS) return 'half-day';
  return 'absent';
}

export interface DemoData {
  timesheetEntries: TimesheetEntry[];
  attendanceOverrides: Record<string, AttendanceStatus>; // key: userId-date
  leaveApplications: LeaveApplication[];
  leaveBalances: Record<string, LeaveBalance[]>; // key: tenantId (global) or tenantId-userId (per-user)
  employees: Employee[];
  payslips: Payslip[];
  salaryHistory: SalaryHistoryEntry[];
  expenseClaims: ExpenseClaim[];
  travelRequests: TravelRequest[];
  notifications: Notification[];
  holidays: Holiday[];
}

function getDefaultData(): DemoData {
  // Convert mock timesheet from attendance to initial timesheet entries
  const initialTimesheet: TimesheetEntry[] = mockAttendance
    .filter((a) => a.workHours !== undefined && a.workHours > 0)
    .map((a) => ({
      id: `ts-${a.id}`,
      tenantId: a.tenantId,
      userId: a.userId,
      date: a.date,
      projectId: 'proj-1',
      projectName: 'Project Alpha',
      taskDescription: 'General work',
      hours: a.workHours ?? 0,
      status: 'approved' as const,
    }));

  return {
    timesheetEntries: initialTimesheet,
    attendanceOverrides: {},
    leaveApplications: [...mockLeaveApplications],
    leaveBalances: {
      'tenant-1': [...mockLeaveBalances],
      'tenant-1-user-1': [...mockLeaveBalances],
      'tenant-1-user-2': [...mockLeaveBalances],
      'tenant-1-user-3': [...mockLeaveBalances],
      'tenant-1-user-4': [...mockLeaveBalances],
    },
    employees: [...mockEmployees],
    payslips: [...mockPayslips],
    salaryHistory: [...mockSalaryHistory],
    expenseClaims: [...mockExpenses],
    travelRequests: [...mockTravelRequests],
    notifications: [...mockNotifications],
    holidays: [...mockHolidays],
  };
}

export function loadData(): DemoData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DemoData;
      // Merge with defaults to ensure new fields exist
      const defaults = getDefaultData();
      return {
        timesheetEntries: parsed.timesheetEntries ?? defaults.timesheetEntries,
        attendanceOverrides: parsed.attendanceOverrides ?? {},
        leaveApplications: parsed.leaveApplications ?? defaults.leaveApplications,
        leaveBalances: parsed.leaveBalances ?? defaults.leaveBalances,
        employees: parsed.employees ?? defaults.employees,
        payslips: parsed.payslips ?? defaults.payslips,
        salaryHistory: parsed.salaryHistory ?? defaults.salaryHistory,
        expenseClaims: parsed.expenseClaims ?? defaults.expenseClaims,
        travelRequests: parsed.travelRequests ?? defaults.travelRequests,
        notifications: parsed.notifications ?? defaults.notifications,
        holidays: parsed.holidays ?? defaults.holidays,
      };
    }
  } catch (_e) {
    // Invalid JSON, use defaults
  }
  return getDefaultData();
}

export function saveData(data: DemoData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isHoliday(data: DemoData, tenantId: string, date: string): boolean {
  return data.holidays.some(
    (h) => h.tenantId === tenantId && h.date === date
  );
}

/** Derive attendance from timesheet entries for a user. Full hours=Present, Partial=Half-day, No entry=Absent */
export function deriveAttendanceFromTimesheet(
  data: DemoData,
  userId: string,
  tenantId: string,
  fromDate?: string,
  toDate?: string
): AttendanceRecord[] {
  const entries = data.timesheetEntries.filter(
    (e) => e.userId === userId && e.tenantId === tenantId
  );

  // Group by date
  const byDate = new Map<string, number>();
  for (const e of entries) {
    const total = (byDate.get(e.date) ?? 0) + e.hours;
    byDate.set(e.date, total);
  }

  const records: AttendanceRecord[] = [];
  const dates = new Set<string>(byDate.keys());

  // If date range provided, include all dates (for calendar - no entry = absent)
  if (fromDate && toDate) {
    const d = new Date(fromDate);
    const end = new Date(toDate);
    while (d <= end) {
      dates.add(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
  }

  const sortedDates = Array.from(dates).sort();

  for (const date of sortedDates) {
    if (fromDate && date < fromDate) continue;
    if (toDate && date > toDate) continue;

    const totalHours = byDate.get(date) ?? 0;
    const overrideKey = `${userId}-${date}`;
    const override = data.attendanceOverrides[overrideKey];

    let status: AttendanceStatus;
    if (override) {
      status = override;
    } else if (isHoliday(data, tenantId, date)) {
      status = 'holiday';
    } else {
      status = getAttendanceStatusFromHours(totalHours);
    }

    records.push({
      id: `att-${userId}-${date}`,
      tenantId,
      userId,
      date,
      workHours: totalHours || undefined,
      status,
      punchIn: totalHours > 0 ? '09:00:00' : undefined,
      punchOut: totalHours > 0 ? '17:00:00' : undefined,
    });
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}
