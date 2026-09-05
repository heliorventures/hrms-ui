import { useEffect, useMemo, useState } from 'react';
import {
  AdminAttendanceDailyReportDocument,
  AdminAttendanceExportPageDocument,
  AdminAttendanceReportSummaryDocument,
  type AdminAttendanceDailyReportQuery,
  type AdminAttendanceExportPageQuery,
  type AdminAttendanceReportSummaryQuery,
} from '../../api/graphql/graphql';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useGraphClient } from '../../hooks/useGraphClient';
import { formatMinutesAsHhMm } from '../../utils/attendanceDuration';
import { monthBoundsIso } from '../../utils/calendarRange';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { formatTenantTime } from '../../utils/tenantTime';
import { titleCaseLabel } from '../../utils/uiLabel';
import AttendanceReportDetails, {
  type AttendanceDailyRow,
} from './components/AttendanceReportDetails';

const REPORT_EMPLOYEE_LIMIT = 1000;
const REPORT_LEAVE_LIMIT = 200;
const REPORT_PAYROLL_CYCLE_LIMIT = 60;
const REPORT_SALARY_COMPONENT_LIMIT = 200;
const ATTENDANCE_PAGE_SIZE = 50;
const ATTENDANCE_EXPORT_PAGE_SIZE = 100;

const ClientOpsAdminReportsReferenceDataDocument = `
  query ClientOpsAdminReportsReferenceData(
    $employeeLimit: Int!
    $leaveLimit: Int!
    $payrollCycleLimit: Int!
    $salaryComponentLimit: Int!
    $fromDate: NaiveDate
    $toDate: NaiveDate
  ) {
    employees(limit: $employeeLimit) { id employeeCode fullName }
    leaveRequests(limit: $leaveLimit, fromDate: $fromDate, toDate: $toDate) {
      id employeeId fromDate toDate status
    }
    payrollCycles(limit: $payrollCycleLimit) {
      id name month year status paymentDate
    }
    salaryComponents(limit: $salaryComponentLimit) {
      id componentType isActive isTaxable
    }
  }
`;

interface EmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
}

interface LeaveRow {
  id: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  status: string;
}

interface PayrollCycleRow {
  id: string;
  name: string;
  month: number;
  year: number;
  status: string;
  paymentDate?: string | null;
}

interface SalaryComponentRow {
  id: string;
  componentType: string;
  isActive: boolean;
  isTaxable: boolean;
}

interface ReferenceData {
  employees: EmployeeRow[];
  leaveRequests: LeaveRow[];
  payrollCycles: PayrollCycleRow[];
  salaryComponents: SalaryComponentRow[];
}

const escapeCsv = (value: unknown) => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text.trimStart())) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename: string, rows: unknown[][]) => {
  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export function attendanceCsvRows(rows: AttendanceDailyRow[]): unknown[][] {
  return [
    [
      'Employee',
      'Employee Code',
      'Work Date',
      'Timezone',
      'First Punch In',
      'Last Punch Out',
      'Status',
      'Logged Minutes',
      'Expected Minutes',
      'Punch Segments',
    ],
    ...rows.map((row) => [
      row.employeeName,
      row.employeeCode,
      row.workDate,
      row.timezone,
      formatTenantTime(row.firstCheckInAt, row.timezone),
      formatTenantTime(row.lastCheckOutAt, row.timezone),
      row.status,
      row.loggedMinutes,
      row.expectedMinutes ?? '',
      row.segmentCount,
    ]),
  ];
}

function currentMonthRange() {
  const now = new Date();
  const range = monthBoundsIso(now.getFullYear(), now.getMonth());
  return { startDate: range.start, endDate: range.end };
}

const AdminReportsPage = () => {
  const client = useGraphClient('client');
  const month = currentMonthRange();
  const [reportType, setReportType] = useState<'attendance' | 'leave' | 'payroll'>('attendance');
  const [filters, setFilters] = useState({
    startDate: month.startDate,
    endDate: month.endDate,
    employeeId: 'all',
    employeeSearch: '',
  });
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendancePage, setAttendancePage] = useState<
    AdminAttendanceDailyReportQuery['attendanceDailyReport'] | null
  >(null);
  const [attendanceSummary, setAttendanceSummary] = useState<
    AdminAttendanceReportSummaryQuery['attendanceReportSummary'] | null
  >(null);
  const [cursorStack, setCursorStack] = useState<Array<string | undefined>>([undefined]);
  const [appliedEmployeeSearch, setAppliedEmployeeSearch] = useState('');
  const after = cursorStack[cursorStack.length - 1];
  const dateRangeError =
    filters.startDate > filters.endDate ? 'Start date must be on or before end date.' : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedEmployeeSearch(filters.employeeSearch.trim());
      setCursorStack([undefined]);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.employeeSearch]);

  useEffect(() => {
    setCursorStack([undefined]);
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    let cancelled = false;
    if (dateRangeError) return undefined;
    setMetadataLoading(true);
    void client
      .request<ReferenceData>(ClientOpsAdminReportsReferenceDataDocument, {
        employeeLimit: REPORT_EMPLOYEE_LIMIT,
        leaveLimit: REPORT_LEAVE_LIMIT,
        payrollCycleLimit: REPORT_PAYROLL_CYCLE_LIMIT,
        salaryComponentLimit: REPORT_SALARY_COMPONENT_LIMIT,
        fromDate: filters.startDate,
        toDate: filters.endDate,
      })
      .then(
        (result) => {
          if (!cancelled) setReferenceData(result);
        },
        (requestError: unknown) => {
          if (!cancelled) setError(graphQlUserMessage(requestError));
        }
      )
      .finally(() => {
        if (!cancelled) setMetadataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, dateRangeError, filters.endDate, filters.startDate]);

  useEffect(() => {
    if (reportType !== 'attendance' || dateRangeError) return undefined;
    let cancelled = false;
    setAttendanceLoading(true);
    setError(null);
    const variables = {
      fromDate: filters.startDate,
      toDate: filters.endDate,
      employeeSearch: appliedEmployeeSearch || null,
      first: ATTENDANCE_PAGE_SIZE,
      after: after ?? null,
    };
    void Promise.all([
      client.request(AdminAttendanceDailyReportDocument, variables),
      client.request(AdminAttendanceReportSummaryDocument, variables),
    ]).then(
      ([pageResult, summaryResult]) => {
        if (cancelled) return;
        setAttendancePage(pageResult.attendanceDailyReport);
        setAttendanceSummary(summaryResult.attendanceReportSummary);
        setAttendanceLoading(false);
      },
      (requestError: unknown) => {
        if (cancelled) return;
        setAttendancePage(null);
        setAttendanceSummary(null);
        setError(graphQlUserMessage(requestError));
        setAttendanceLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [
    after,
    appliedEmployeeSearch,
    client,
    dateRangeError,
    filters.endDate,
    filters.startDate,
    reportType,
  ]);

  const employeeOptions = [
    { value: 'all', label: titleCaseLabel('ALL employees') },
    ...(referenceData?.employees ?? []).map((employee) => ({
      value: employee.id,
      label: `${employee.fullName} (${employee.employeeCode})`,
    })),
  ];

  const filteredLeave = useMemo(
    () =>
      (referenceData?.leaveRequests ?? []).filter(
        (row) => filters.employeeId === 'all' || row.employeeId === filters.employeeId
      ),
    [filters.employeeId, referenceData]
  );
  const filteredPayrollCycles = useMemo(
    () =>
      (referenceData?.payrollCycles ?? []).filter((row) => {
        const comparable =
          row.paymentDate ?? `${row.year}-${String(row.month).padStart(2, '0')}-01`;
        return comparable >= filters.startDate && comparable <= filters.endDate;
      }),
    [filters.endDate, filters.startDate, referenceData]
  );

  const exportAttendance = async () => {
    setExporting(true);
    setError(null);
    try {
      const rows: AttendanceDailyRow[] = [];
      const seenCursors = new Set<string>();
      let exportAfter: string | null = null;
      do {
        const result: AdminAttendanceExportPageQuery = await client.request(
          AdminAttendanceExportPageDocument,
          {
            fromDate: filters.startDate,
            toDate: filters.endDate,
            employeeSearch: appliedEmployeeSearch || null,
            first: ATTENDANCE_EXPORT_PAGE_SIZE,
            after: exportAfter,
          }
        );
        rows.push(...result.attendanceDailyReport.edges.map((edge) => edge.node));
        const pageInfo = result.attendanceDailyReport.pageInfo;
        if (!pageInfo.hasNextPage) break;
        const next = pageInfo.endCursor;
        if (!next || seenCursors.has(next)) {
          throw new Error('Attendance export pagination did not advance. Please retry.');
        }
        seenCursors.add(next);
        exportAfter = next;
      } while (true);

      downloadCsv(
        `attendance-report-${filters.startDate}-to-${filters.endDate}.csv`,
        attendanceCsvRows(rows)
      );
    } catch (requestError) {
      setError(graphQlUserMessage(requestError));
    } finally {
      setExporting(false);
    }
  };

  const generateReport = () => {
    if (reportType === 'attendance') {
      void exportAttendance();
      return;
    }
    if (reportType === 'leave') {
      const labels = new Map(
        (referenceData?.employees ?? []).map((employee) => [employee.id, employee])
      );
      downloadCsv(`leave-report-${filters.startDate}-to-${filters.endDate}.csv`, [
        ['Employee', 'Employee Code', 'From Date', 'To Date', 'Status'],
        ...filteredLeave.map((row) => {
          const employee = labels.get(row.employeeId);
          return [
            employee?.fullName ?? 'Employee unavailable',
            employee?.employeeCode ?? '',
            row.fromDate,
            row.toDate,
            row.status,
          ];
        }),
      ]);
      return;
    }
    downloadCsv(`payroll-report-${filters.startDate}-to-${filters.endDate}.csv`, [
      ['Cycle', 'Month', 'Year', 'Status', 'Payment Date'],
      ...filteredPayrollCycles.map((row) => [
        row.name,
        row.month,
        row.year,
        row.status,
        row.paymentDate ?? '',
      ]),
    ]);
  };

  const renderSummary = () => {
    if (reportType === 'attendance') {
      if (!attendanceSummary) return <p className="text-sm text-gray-500">Loading...</p>;
      const cards = [
        ['Present', attendanceSummary.presentDays],
        ['Absent', attendanceSummary.absentDays],
        ['Half Days', attendanceSummary.halfDays],
        ['On Leave', attendanceSummary.onLeaveDays],
        ['Incomplete', attendanceSummary.incompleteDays],
        ['Unscheduled', attendanceSummary.unscheduledDays],
        ['Total Logged', formatMinutesAsHhMm(attendanceSummary.totalLoggedMinutes)],
      ];
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-7">
          {cards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            </div>
          ))}
        </div>
      );
    }
    if (reportType === 'leave') {
      const statusCount = (status: string) =>
        filteredLeave.filter((row) => row.status.toLowerCase() === status).length;
      return (
        <p className="text-sm text-gray-700 dark:text-gray-200">
          Total: {filteredLeave.length} · Approved: {statusCount('approved')} · Pending:{' '}
          {statusCount('pending')} · Rejected: {statusCount('rejected')}
        </p>
      );
    }
    const activeComponents = (referenceData?.salaryComponents ?? []).filter(
      (row) => row.isActive
    ).length;
    const taxableComponents = (referenceData?.salaryComponents ?? []).filter(
      (row) => row.isTaxable
    ).length;
    return (
      <p className="text-sm text-gray-700 dark:text-gray-200">
        Cycles: {filteredPayrollCycles.length} · Active components: {activeComponents} · Taxable
        components: {taxableComponents}
      </p>
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Report Filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Select
            label="Report Type"
            name="reportType"
            value={reportType}
            onChange={(event) => setReportType(event.target.value as typeof reportType)}
            options={[
              { value: 'attendance', label: 'Attendance Report' },
              { value: 'leave', label: 'Leave Report' },
              { value: 'payroll', label: 'Payroll Report' },
            ]}
            fullWidth
          />
          {reportType === 'attendance' ? (
            <Input
              label="Employee Search"
              name="employeeSearch"
              value={filters.employeeSearch}
              onChange={(event) =>
                setFilters((current) => ({ ...current, employeeSearch: event.target.value }))
              }
              placeholder="Name or employee code"
              fullWidth
            />
          ) : (
            <Select
              label="Employee"
              name="employeeId"
              value={filters.employeeId}
              onChange={(event) =>
                setFilters((current) => ({ ...current, employeeId: event.target.value }))
              }
              options={employeeOptions}
              fullWidth
            />
          )}
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={(event) =>
              setFilters((current) => ({ ...current, startDate: event.target.value }))
            }
            fullWidth
            required
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={(event) =>
              setFilters((current) => ({ ...current, endDate: event.target.value }))
            }
            fullWidth
            required
          />
        </div>
        {dateRangeError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{dateRangeError}</p>
        )}
        <div className="mt-4">
          <Button
            disabled={Boolean(dateRangeError) || metadataLoading || attendanceLoading || exporting}
            onClick={generateReport}
          >
            {exporting ? 'Preparing Complete Export...' : 'Generate Report'}
          </Button>
        </div>
      </Card>
      <Card title="Report Summary">{renderSummary()}</Card>
      {reportType === 'attendance' && (
        <AttendanceReportDetails
          rows={attendancePage?.edges.map((edge) => edge.node) ?? []}
          loading={attendanceLoading}
          canGoBack={cursorStack.length > 1}
          canGoForward={attendancePage?.pageInfo.hasNextPage ?? false}
          onPrevious={() => setCursorStack((current) => current.slice(0, -1))}
          onNext={() => {
            const next = attendancePage?.pageInfo.endCursor;
            if (next) setCursorStack((current) => [...current, next]);
          }}
        />
      )}
    </div>
  );
};

export default AdminReportsPage;
