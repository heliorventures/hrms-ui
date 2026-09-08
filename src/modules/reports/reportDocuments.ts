export type HrReportKind =
  | 'ATTENDANCE_PUNCTUALITY'
  | 'LEAVE_REQUESTS'
  | 'LEAVE_BALANCES'
  | 'PAYROLL_REGISTER'
  | 'UNPAID_LEAVE'
  | 'EMPLOYEE_MOVEMENTS'
  | 'TIMESHEET_HOURS'
  | 'COMP_OFF_CREDITS'
  | 'PENDING_REQUESTS';
export interface ReportFilter {
  kind: HrReportKind;
  fromDate: string;
  toDate: string;
  employeeSearch?: string | null;
}
export interface ReportRows {
  columns: string[];
  rows: string[][];
  totalRows: number;
}
export interface ReportCsv {
  fileName: string;
  csv: string;
  rowCount: number;
}
export const HrReportRowsDocument = `
  query HrReportRows($kind: HrReportKind!, $fromDate: NaiveDate!, $toDate: NaiveDate!, $employeeSearch: String, $offset: Int! = 0) {
    hrReportRows(kind: $kind, fromDate: $fromDate, toDate: $toDate, employeeSearch: $employeeSearch, offset: $offset, limit: 50) { columns rows totalRows }
  }
`;
export const HrReportCsvDocument = `
  query HrReportCsv($kind: HrReportKind!, $fromDate: NaiveDate!, $toDate: NaiveDate!, $employeeSearch: String) {
    hrReportCsv(kind: $kind, fromDate: $fromDate, toDate: $toDate, employeeSearch: $employeeSearch) { fileName csv rowCount }
  }
`;
export const HrInsightsDocument = `
  query HrInsights($fromDate: NaiveDate!, $toDate: NaiveDate!) {
    hrInsights(fromDate: $fromDate, toDate: $toDate) {
      onTimeDays lateDays unknownPunctualityDays incompleteDays
      joiners exits activeHeadcount netSalaryGenerated generatedPayslips pendingRequests includedPendingDomains
      monthlyPayroll { month netSalaryGenerated payslips }
    }
  }
`;
export interface HrInsights {
  onTimeDays: number | null;
  lateDays: number | null;
  unknownPunctualityDays: number | null;
  incompleteDays: number | null;
  joiners: number | null;
  exits: number | null;
  activeHeadcount: number | null;
  netSalaryGenerated: string | null;
  generatedPayslips: number | null;
  pendingRequests: number | null;
  includedPendingDomains: string[];
  monthlyPayroll: { month: string; netSalaryGenerated: string; payslips: number }[] | null;
}
