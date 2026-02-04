import { LeaveApplication, LeaveBalance, Holiday } from '../types';

export const mockLeaveBalances: LeaveBalance[] = [
  { leaveType: 'casual', total: 12, used: 3, available: 9 },
  { leaveType: 'sick', total: 12, used: 2, available: 10 },
  { leaveType: 'earned', total: 15, used: 5, available: 10 },
  { leaveType: 'comp-off', total: 0, used: 0, available: 0 },
];

export const mockLeaveApplications: LeaveApplication[] = [
  {
    id: 'leave-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    leaveType: 'casual',
    fromDate: '2026-02-10',
    toDate: '2026-02-12',
    days: 3,
    reason: 'Family function',
    status: 'pending',
    appliedOn: '2026-02-03',
  },
  {
    id: 'leave-2',
    tenantId: 'tenant-1',
    userId: 'user-1',
    leaveType: 'sick',
    fromDate: '2026-01-20',
    toDate: '2026-01-21',
    days: 2,
    reason: 'Flu',
    status: 'approved',
    appliedOn: '2026-01-19',
    approvedBy: 'user-2',
    approvedOn: '2026-01-19',
  },
  {
    id: 'leave-3',
    tenantId: 'tenant-1',
    userId: 'user-1',
    leaveType: 'earned',
    fromDate: '2025-12-24',
    toDate: '2025-12-31',
    days: 5,
    reason: 'Year-end vacation',
    status: 'approved',
    appliedOn: '2025-12-10',
    approvedBy: 'user-2',
    approvedOn: '2025-12-11',
  },
];

export const mockHolidays: Holiday[] = [
  {
    id: 'hol-1',
    tenantId: 'tenant-1',
    date: '2026-01-26',
    name: 'Republic Day',
    type: 'national',
  },
  {
    id: 'hol-2',
    tenantId: 'tenant-1',
    date: '2026-03-08',
    name: 'Holi',
    type: 'national',
  },
  {
    id: 'hol-3',
    tenantId: 'tenant-1',
    date: '2026-08-15',
    name: 'Independence Day',
    type: 'national',
  },
  {
    id: 'hol-4',
    tenantId: 'tenant-1',
    date: '2026-10-02',
    name: 'Gandhi Jayanti',
    type: 'national',
  },
  {
    id: 'hol-5',
    tenantId: 'tenant-1',
    date: '2026-12-25',
    name: 'Christmas',
    type: 'national',
  },
];
