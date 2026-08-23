import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { formatMinutesAsHhMm, segmentWorkedMinutes } from '../../utils/attendanceDuration';
import { formatBackendTime } from '../../utils/timeFormat';
import { titleCaseLabel } from '../../utils/uiLabel';
import AttendanceReportDetails from './components/AttendanceReportDetails';

const REPORT_EMPLOYEE_LIMIT = 1000;
const REPORT_ATTENDANCE_LIMIT = 500;
const REPORT_LEAVE_LIMIT = 200;
const REPORT_PAYROLL_CYCLE_LIMIT = 60;
const REPORT_SALARY_COMPONENT_LIMIT = 200;

const ClientOpsAdminReportsDataRangeDocument = `
  query ClientOpsAdminReportsDataRange(
    $employeeLimit: Int!
    $attendanceLimit: Int!
    $leaveLimit: Int!
    $payrollCycleLimit: Int!
    $salaryComponentLimit: Int!
    $fromDate: NaiveDate
    $toDate: NaiveDate
  ) {
    employees(limit: $employeeLimit) {
      id
      employeeCode
      fullName
    }
    attendance(limit: $attendanceLimit, fromDate: $fromDate, toDate: $toDate) {
      id
      employeeId
      workDate
      status
      checkInTime
      checkOutTime
    }
    leaveRequests(limit: $leaveLimit, fromDate: $fromDate, toDate: $toDate) {
      id
      employeeId
      fromDate
      toDate
      status
    }
    payrollCycles(limit: $payrollCycleLimit) {
      id
      name
      month
      year
      status
      paymentDate
    }
    salaryComponents(limit: $salaryComponentLimit) {
      id
      componentType
      isActive
      isTaxable
    }
  }
`;

interface EmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
}

interface AttendanceRow {
  id: string;
  employeeId: string;
  workDate: string;
  status?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
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

interface ReportsData {
  employees: EmployeeRow[];
  attendance: AttendanceRow[];
  leaveRequests: LeaveRow[];
  payrollCycles: PayrollCycleRow[];
  salaryComponents: SalaryComponentRow[];
}

const escapeCsv = (value: unknown) => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text.trimStart())) {
    text = `'${text}`;
  }
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

const AdminReportsPage = () => {
  const client = useGraphClient('client');
  const [reportType, setReportType] = useState<'attendance' | 'leave' | 'payroll'>('attendance');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: 'all',
  });
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      setError('Start date must be on or before end date.');
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<ReportsData>(ClientOpsAdminReportsDataRangeDocument, {
          employeeLimit: REPORT_EMPLOYEE_LIMIT,
          attendanceLimit: REPORT_ATTENDANCE_LIMIT,
          leaveLimit: REPORT_LEAVE_LIMIT,
          payrollCycleLimit: REPORT_PAYROLL_CYCLE_LIMIT,
          salaryComponentLimit: REPORT_SALARY_COMPONENT_LIMIT,
          fromDate: filters.startDate || null,
          toDate: filters.endDate || null,
        });
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, filters.endDate, filters.startDate]);

  const employeeOptions = [
    { value: 'all', label: titleCaseLabel('ALL employees') },
    ...((data?.employees ?? []).map((emp) => ({
      value: emp.id,
      label: `${emp.fullName} (${emp.employeeCode})`,
    })) || []),
  ];

  const reportTypeOptions = [
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'leave', label: 'Leave Report' },
    { value: 'payroll', label: 'Payroll Report' },
  ];

  const dateRangeError =
    filters.startDate && filters.endDate && filters.startDate > filters.endDate
      ? 'Start date must be on or before end date.'
      : null;

  const reportCompletenessWarning = useMemo(() => {
    if (!data) return null;
    const capped = (label: string, rows: unknown[], limit: number) =>
      rows.length >= limit ? `${label} (${limit})` : null;
    const impacted =
      reportType === 'attendance'
        ? [
            capped('employees', data.employees, REPORT_EMPLOYEE_LIMIT),
            capped('attendance rows', data.attendance, REPORT_ATTENDANCE_LIMIT),
          ]
        : reportType === 'leave'
          ? [
              capped('employees', data.employees, REPORT_EMPLOYEE_LIMIT),
              capped('leave requests', data.leaveRequests, REPORT_LEAVE_LIMIT),
            ]
          : [
              capped('payroll cycles', data.payrollCycles, REPORT_PAYROLL_CYCLE_LIMIT),
              capped('salary components', data.salaryComponents, REPORT_SALARY_COMPONENT_LIMIT),
            ];
    const labels = impacted.filter(Boolean);
    if (labels.length === 0) return null;
    return `Report data reached the load limit for ${labels.join(
      ', '
    )}. Narrow the date range before using summary numbers or exporting CSV.`;
  }, [data, reportType]);

  const employeeMetadataById = useMemo(() => {
    const metadata: Record<string, { label: string; employeeCode: string }> = {};
    (data?.employees ?? []).forEach((employee) => {
      metadata[employee.id] = {
        label: `${employee.fullName} (${employee.employeeCode})`,
        employeeCode: employee.employeeCode,
      };
    });
    return metadata;
  }, [data]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredAttendance = useMemo(() => {
    return (data?.attendance ?? []).filter((row) => {
      if (filters.employeeId !== 'all' && row.employeeId !== filters.employeeId) return false;
      if (filters.startDate && row.workDate < filters.startDate) return false;
      if (filters.endDate && row.workDate > filters.endDate) return false;
      return true;
    });
  }, [data, filters]);

  const filteredLeave = useMemo(() => {
    return (data?.leaveRequests ?? []).filter((row) => {
      if (filters.employeeId !== 'all' && row.employeeId !== filters.employeeId) return false;
      if (filters.startDate && row.toDate < filters.startDate) return false;
      if (filters.endDate && row.fromDate > filters.endDate) return false;
      return true;
    });
  }, [data, filters]);

  const filteredPayrollCycles = useMemo(() => {
    return (data?.payrollCycles ?? []).filter((row) => {
      const comparable = row.paymentDate ?? `${row.year}-${String(row.month).padStart(2, '0')}-01`;
      if (filters.startDate && comparable < filters.startDate) return false;
      if (filters.endDate && comparable > filters.endDate) return false;
      return true;
    });
  }, [data, filters]);

  const getAttendanceStats = () => {
    if (!data) return null;

    const employeeDayKey = (row: AttendanceRow) => `${row.employeeId}:${row.workDate}`;
    const employeeDays = new Set(filteredAttendance.map(employeeDayKey));
    const presentDays = new Set(
      filteredAttendance
        .filter((row) => row.status?.toLowerCase() === 'present')
        .map(employeeDayKey)
    );
    const absentDays = new Set(
      filteredAttendance.filter((row) => row.status?.toLowerCase() === 'absent').map(employeeDayKey)
    );
    const halfDays = new Set(
      filteredAttendance
        .filter((row) => ['half_day', 'half-day'].includes(row.status?.toLowerCase() ?? ''))
        .map(employeeDayKey)
    );
    const trackedDays = new Set(
      filteredAttendance
        .filter((row) => segmentWorkedMinutes(row.checkInTime, row.checkOutTime) != null)
        .map(employeeDayKey)
    );
    const totalLoggedMinutes = filteredAttendance.reduce(
      (sum, row) => sum + (segmentWorkedMinutes(row.checkInTime, row.checkOutTime) ?? 0),
      0
    );
    const trackedCoverage = employeeDays.size > 0 ? trackedDays.size / employeeDays.size : 0;

    return {
      totalPresent: presentDays.size,
      totalAbsent: absentDays.size,
      totalHalfDay: halfDays.size,
      totalLoggedMinutes,
      trackedCoverage,
    };
  };

  const getLeaveStats = () => {
    if (!data) return null;

    const totalLeaves = filteredLeave.length;
    const approved = filteredLeave.filter((l) => l.status.toLowerCase() === 'approved').length;
    const pending = filteredLeave.filter((l) => l.status.toLowerCase() === 'pending').length;
    const rejected = filteredLeave.filter((l) => l.status.toLowerCase() === 'rejected').length;

    return { totalLeaves, approved, pending, rejected };
  };

  const getPayrollStats = () => {
    if (!data) return null;

    const totalCycles = filteredPayrollCycles.length;
    const processed = filteredPayrollCycles.filter(
      (p) => p.status.toLowerCase() === 'processed'
    ).length;
    const activeComponents = (data.salaryComponents ?? []).filter((s) => s.isActive).length;
    const taxableComponents = (data.salaryComponents ?? []).filter((s) => s.isTaxable).length;

    return { totalCycles, processed, activeComponents, taxableComponents };
  };

  const handleGenerateReport = () => {
    if (!data || dateRangeError) return;
    if (reportType === 'attendance') {
      downloadCsv(`attendance-report-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`, [
        ['Employee', 'Employee Code', 'Work Date', 'Status', 'Check In', 'Check Out'],
        ...filteredAttendance.map((row) => [
          employeeMetadataById[row.employeeId]?.label ?? 'Employee not loaded',
          employeeMetadataById[row.employeeId]?.employeeCode ?? '',
          row.workDate,
          row.status ?? '',
          row.checkInTime ? formatBackendTime(row.checkInTime) : '',
          row.checkOutTime ? formatBackendTime(row.checkOutTime) : '',
        ]),
      ]);
      return;
    }
    if (reportType === 'leave') {
      downloadCsv(`leave-report-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`, [
        ['Employee', 'Employee Code', 'From Date', 'To Date', 'Status'],
        ...filteredLeave.map((row) => [
          employeeMetadataById[row.employeeId]?.label ?? 'Employee not loaded',
          employeeMetadataById[row.employeeId]?.employeeCode ?? '',
          row.fromDate,
          row.toDate,
          row.status,
        ]),
      ]);
      return;
    }
    downloadCsv(`payroll-report-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`, [
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

  const renderReportContent = () => {
    switch (reportType) {
      case 'attendance': {
        const stats = getAttendanceStats();
        if (!stats) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>;
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Present</div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalPresent}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Absent</div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.totalAbsent}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Logged Time</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatMinutesAsHhMm(stats.totalLoggedMinutes)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Tracked Coverage</div>
              <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(stats.trackedCoverage * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        );
      }
      case 'leave': {
        const stats = getLeaveStats();
        if (!stats) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>;
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Applications</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalLeaves}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </div>
            </div>
          </div>
        );
      }
      case 'payroll': {
        const stats = getPayrollStats();
        if (!stats) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>;
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Payroll Cycles</div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCycles}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Processed Cycles</div>
              <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.processed}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Components</div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.activeComponents}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Taxable Components</div>
              <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.taxableComponents}
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {loading && (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Report Data...</p>
        </Card>
      )}

      <Card title="Report Filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Select
            label="Report Type"
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as typeof reportType)}
            options={reportTypeOptions}
            fullWidth
          />

          <Select
            label="Employee"
            name="employeeId"
            value={filters.employeeId}
            onChange={handleFilterChange}
            options={employeeOptions}
            fullWidth
          />

          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            fullWidth
          />

          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            fullWidth
          />
        </div>

        {dateRangeError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{dateRangeError}</p>
        )}
        {reportCompletenessWarning && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            {reportCompletenessWarning}
          </p>
        )}

        <div className="mt-4">
          <Button
            disabled={loading || !data || Boolean(dateRangeError)}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </div>
      </Card>

      <Card title="Report Summary">{renderReportContent()}</Card>

      {reportType === 'attendance' && (
        <AttendanceReportDetails employees={data?.employees ?? []} rows={filteredAttendance} />
      )}
    </div>
  );
};

export default AdminReportsPage;
