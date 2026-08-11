import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { ClientOpsAdminReportsDataDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import AttendanceReportDetails from './components/AttendanceReportDetails';

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

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

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
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<ReportsData>(ClientOpsAdminReportsDataDocument);
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
  }, [client]);

  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
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

  const employeeLabelById = useMemo(() => {
    const labels: Record<string, string> = {};
    (data?.employees ?? []).forEach((employee) => {
      labels[employee.id] = `${employee.fullName} (${employee.employeeCode})`;
    });
    return labels;
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

    const totalPresent = filteredAttendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'present'
    ).length;
    const totalAbsent = filteredAttendance.filter(
      (a) => a.status === 'ABSENT' || a.status === 'absent'
    ).length;
    const totalHalfDay = filteredAttendance.filter(
      (a) => a.status === 'HALF_DAY' || a.status === 'half-day'
    ).length;
    const withBothTimes = filteredAttendance.filter((a) => a.checkInTime && a.checkOutTime);
    const avgTracked =
      withBothTimes.length > 0 ? withBothTimes.length / filteredAttendance.length : 0;

    return { totalPresent, totalAbsent, totalHalfDay, avgTracked };
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
    if (!data) return;
    if (reportType === 'attendance') {
      downloadCsv(`attendance-report-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`, [
        ['Employee', 'Employee Id', 'Work Date', 'Status', 'Check In', 'Check Out'],
        ...filteredAttendance.map((row) => [
          employeeLabelById[row.employeeId] ?? row.employeeId,
          row.employeeId,
          row.workDate,
          row.status ?? '',
          row.checkInTime ?? '',
          row.checkOutTime ?? '',
        ]),
      ]);
      return;
    }
    if (reportType === 'leave') {
      downloadCsv(`leave-report-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`, [
        ['Employee', 'Employee Id', 'From Date', 'To Date', 'Status'],
        ...filteredLeave.map((row) => [
          employeeLabelById[row.employeeId] ?? row.employeeId,
          row.employeeId,
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
              <div className="text-sm text-gray-500 dark:text-gray-400">Half Days</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.totalHalfDay}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Tracked Coverage</div>
              <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(stats.avgTracked * 100).toFixed(0)}%
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading report data...</p>
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

        <div className="mt-4">
          <Button disabled={loading || !data} onClick={handleGenerateReport}>
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
