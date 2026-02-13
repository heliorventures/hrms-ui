import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type {
  TimesheetEntry,
  LeaveApplication,
  LeaveBalance,
  Employee,
  Payslip,
  SalaryHistoryEntry,
  LeaveStatus,
  AttendanceStatus,
} from '../types';
import {
  loadData,
  saveData,
  deriveAttendanceFromTimesheet,
  type DemoData,
} from './localStorageStore';

interface DataStoreContextType {
  data: DemoData;
  refresh: () => void;

  // Timesheet
  getTimesheetEntries: (userId: string, tenantId: string) => TimesheetEntry[];
  addTimesheetEntry: (entry: Omit<TimesheetEntry, 'id'>) => void;
  updateTimesheetEntry: (id: string, updates: Partial<TimesheetEntry>) => void;
  deleteTimesheetEntry: (id: string) => void;

  // Attendance (derived + overrides)
  getAttendance: (userId: string, tenantId: string, fromDate?: string, toDate?: string) => ReturnType<typeof deriveAttendanceFromTimesheet>;
  setAttendanceOverride: (userId: string, date: string, status: AttendanceStatus) => void;

  // Leave
  getLeaveApplications: (userId: string, tenantId: string) => LeaveApplication[];
  getAllLeaveApplications: (tenantId: string) => LeaveApplication[];
  getLeaveBalances: (tenantId: string, userId?: string) => LeaveBalance[];
  addLeaveApplication: (leave: Omit<LeaveApplication, 'id' | 'appliedOn'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, approvedBy?: string) => void;
  deleteLeaveApplication: (id: string) => void;
  updateLeaveBalances: (tenantId: string, balances: LeaveBalance[]) => void;

  // Employees
  getEmployees: (tenantId: string) => Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Payroll (read for employee; admin can modify via these)
  getPayslips: (userId: string, tenantId: string) => Payslip[];
  getSalaryHistory: (userId: string, tenantId: string) => SalaryHistoryEntry[];
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(loadData);

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const getTimesheetEntries = useCallback(
    (userId: string, tenantId: string) =>
      data.timesheetEntries
        .filter((e) => e.userId === userId && e.tenantId === tenantId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.timesheetEntries]
  );

  const addTimesheetEntry = useCallback(
    (entry: Omit<TimesheetEntry, 'id'>) => {
      const newEntry: TimesheetEntry = {
        ...entry,
        id: generateId('ts'),
      };
      setData((prev) => ({
        ...prev,
        timesheetEntries: [...prev.timesheetEntries, newEntry],
      }));
    },
    []
  );

  const updateTimesheetEntry = useCallback(
    (id: string, updates: Partial<TimesheetEntry>) => {
      setData((prev) => ({
        ...prev,
        timesheetEntries: prev.timesheetEntries.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    },
    []
  );

  const deleteTimesheetEntry = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      timesheetEntries: prev.timesheetEntries.filter((e) => e.id !== id),
    }));
  }, []);

  const getAttendance = useCallback(
    (userId: string, tenantId: string, fromDate?: string, toDate?: string) =>
      deriveAttendanceFromTimesheet(data, userId, tenantId, fromDate, toDate),
    [data]
  );

  const setAttendanceOverride = useCallback(
    (userId: string, date: string, status: AttendanceStatus) => {
      const key = `${userId}-${date}`;
      setData((prev) => ({
        ...prev,
        attendanceOverrides: {
          ...prev.attendanceOverrides,
          [key]: status,
        },
      }));
    },
    []
  );

  const getLeaveApplications = useCallback(
    (userId: string, tenantId: string) =>
      data.leaveApplications
        .filter((l) => l.userId === userId && l.tenantId === tenantId)
        .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)),
    [data.leaveApplications]
  );

  const getAllLeaveApplications = useCallback(
    (tenantId: string) =>
      data.leaveApplications
        .filter((l) => l.tenantId === tenantId)
        .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)),
    [data.leaveApplications]
  );

  const getLeaveBalances = useCallback(
    (tenantId: string, userId?: string) => {
      if (userId) {
        const key = `${tenantId}-${userId}`;
        return data.leaveBalances[key] ?? data.leaveBalances[tenantId] ?? [];
      }
      return data.leaveBalances[tenantId] ?? [];
    },
    [data.leaveBalances]
  );

  const addLeaveApplication = useCallback(
    (leave: Omit<LeaveApplication, 'id' | 'appliedOn'>) => {
      const newLeave: LeaveApplication = {
        ...leave,
        id: generateId('leave'),
        appliedOn: new Date().toISOString().split('T')[0],
      };
      const balanceKey = `${leave.tenantId}-${leave.userId}`;
      setData((prev) => {
        const balances = prev.leaveBalances[balanceKey] ?? prev.leaveBalances[leave.tenantId] ?? [];
        const updated = balances.map((b) =>
          b.leaveType === leave.leaveType
            ? { ...b, used: b.used + leave.days, available: b.available - leave.days }
            : b
        );
        return {
          ...prev,
          leaveApplications: [...prev.leaveApplications, newLeave],
          leaveBalances: { ...prev.leaveBalances, [balanceKey]: updated },
        };
      });
    },
    []
  );

  const updateLeaveStatus = useCallback(
    (id: string, status: LeaveStatus, approvedBy?: string) => {
      setData((prev) => {
        const leave = prev.leaveApplications.find((l) => l.id === id);
        if (!leave) return prev;
        let newBalances = prev.leaveBalances;
        if (status === 'rejected') {
          const balanceKey = `${leave.tenantId}-${leave.userId}`;
          const balances = prev.leaveBalances[balanceKey] ?? prev.leaveBalances[leave.tenantId] ?? [];
          const updated = balances.map((b) =>
            b.leaveType === leave.leaveType
              ? { ...b, used: b.used - leave.days, available: b.available + leave.days }
              : b
          );
          newBalances = { ...prev.leaveBalances, [balanceKey]: updated };
        }
        return {
          ...prev,
          leaveApplications: prev.leaveApplications.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status,
                  approvedBy,
                  approvedOn: new Date().toISOString().split('T')[0],
                }
              : l
          ),
          leaveBalances: newBalances,
        };
      });
    },
    []
  );

  const updateLeaveBalances = useCallback(
    (tenantId: string, balances: LeaveBalance[]) => {
      setData((prev) => ({
        ...prev,
        leaveBalances: { ...prev.leaveBalances, [tenantId]: balances },
      }));
    },
    []
  );

  const deleteLeaveApplication = useCallback((id: string) => {
    setData((prev) => {
      const leave = prev.leaveApplications.find((l) => l.id === id);
      if (!leave || leave.status !== 'pending') return prev;
      const balanceKey = `${leave.tenantId}-${leave.userId}`;
      const balances = prev.leaveBalances[balanceKey] ?? prev.leaveBalances[leave.tenantId] ?? [];
      const updated = balances.map((b) =>
        b.leaveType === leave.leaveType
          ? { ...b, used: b.used - leave.days, available: b.available + leave.days }
          : b
      );
      return {
        ...prev,
        leaveApplications: prev.leaveApplications.filter((l) => l.id !== id),
        leaveBalances: { ...prev.leaveBalances, [balanceKey]: updated },
      };
    });
  }, []);

  const getEmployees = useCallback(
    (tenantId: string) =>
      data.employees
        .filter((e) => e.tenantId === tenantId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data.employees]
  );

  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...emp, id: generateId('emp') };
    setData((prev) => ({
      ...prev,
      employees: [...prev.employees, newEmp],
    }));
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setData((prev) => ({
      ...prev,
      employees: prev.employees.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
    }));
  }, []);

  const getPayslips = useCallback(
    (userId: string, tenantId: string) =>
      data.payslips
        .filter((p) => p.userId === userId && p.tenantId === tenantId)
        .sort((a, b) => b.month.localeCompare(a.month)),
    [data.payslips]
  );

  const getSalaryHistory = useCallback(
    (userId: string, tenantId: string) =>
      data.salaryHistory
        .filter((s) => s.userId === userId && s.tenantId === tenantId)
        .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom)),
    [data.salaryHistory]
  );

  const value: DataStoreContextType = {
    data,
    refresh,
    getTimesheetEntries,
    addTimesheetEntry,
    updateTimesheetEntry,
    deleteTimesheetEntry,
    getAttendance,
    setAttendanceOverride,
    getLeaveApplications,
    getAllLeaveApplications,
    getLeaveBalances,
    addLeaveApplication,
    updateLeaveStatus,
  deleteLeaveApplication,
  updateLeaveBalances,
  getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getPayslips,
    getSalaryHistory,
  };

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within DataStoreProvider');
  }
  return context;
}
