import { recordLogin } from './login.mjs';
import { recordAttendance, recordPunch } from './attendance.mjs';
import { recordLeaveApply, recordLeaveApprove } from './leave.mjs';
import { recordPayroll } from './payroll.mjs';
import { recordExpense, recordTravel, recordExpenseTravelApprove } from './expenses.mjs';

export const stories = [
  { id: 'login', file: '01-sign-in', title: 'How to sign in', role: 'anonymous', run: recordLogin },
  { id: 'punch', file: '02-punch-in-out', title: 'Punch in and punch out', role: 'employee', run: recordPunch },
  { id: 'attendance', file: '03-my-attendance', title: 'View your attendance', role: 'employee', run: recordAttendance },
  { id: 'leave-apply', file: '04-apply-for-leave', title: 'Apply for leave', role: 'employee', run: recordLeaveApply },
  { id: 'leave-approve', file: '05-approve-leave', title: 'Approve a leave request', role: 'approver', requires: ['leave'], run: recordLeaveApprove },
  { id: 'payroll', file: '06-payslip-ctc-tax', title: 'Your payslip, CTC and income tax', role: 'employee', run: recordPayroll },
  { id: 'expense-submit', file: '07-submit-expense', title: 'Submit an expense claim', role: 'employee', run: recordExpense },
  { id: 'travel-submit', file: '08-request-travel', title: 'Request travel', role: 'employee', run: recordTravel },
  { id: 'expense-travel-approve', file: '09-approve-expense-travel', title: 'Approve expenses and travel', role: 'approver', requires: ['expense', 'travel'], run: recordExpenseTravelApprove },
];
