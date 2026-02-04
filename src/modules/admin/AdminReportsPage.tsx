import { useState } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useTenant } from '../../contexts/TenantContext';
import { mockAttendance } from '../../mocks/attendance';
import { mockLeaveApplications } from '../../mocks/leaves';
import { mockPayslips } from '../../mocks/payroll';
import { mockUsers } from '../../mocks/users';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReportsPage = () => {
  const { currentTenant } = useTenant();
  const [reportType, setReportType] = useState<'attendance' | 'leave' | 'payroll'>(
    'attendance'
  );
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: 'all',
  });

  const { data: attendanceData } = useMockApi(
    () => mockAttendance.filter((a) => a.tenantId === currentTenant.id),
    { delay: 300 }
  );

  const { data: leaveData } = useMockApi(
    () => mockLeaveApplications.filter((l) => l.tenantId === currentTenant.id),
    { delay: 300 }
  );

  const { data: payrollData } = useMockApi(
    () => mockPayslips.filter((p) => p.tenantId === currentTenant.id),
    { delay: 300 }
  );

  const { data: employees } = useMockApi(
    () => mockUsers.filter((u) => u.tenantId === currentTenant.id),
    { delay: 300 }
  );

  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
    ...(employees?.map((emp) => ({
      value: emp.id,
      label: `${emp.name} (${emp.employeeId})`,
    })) || []),
  ];

  const reportTypeOptions = [
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'leave', label: 'Leave Report' },
    { value: 'payroll', label: 'Payroll Report' },
  ];

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = () => {
    alert(`Generating ${reportType} report with filters...`);
  };

  const getAttendanceStats = () => {
    if (!attendanceData) return null;

    const totalPresent = attendanceData.filter((a) => a.status === 'present').length;
    const totalAbsent = attendanceData.filter((a) => a.status === 'absent').length;
    const totalHalfDay = attendanceData.filter((a) => a.status === 'half-day').length;
    const avgWorkHours =
      attendanceData.reduce((sum, a) => sum + (a.workHours || 0), 0) /
      (totalPresent + totalHalfDay || 1);

    return { totalPresent, totalAbsent, totalHalfDay, avgWorkHours };
  };

  const getLeaveStats = () => {
    if (!leaveData) return null;

    const totalLeaves = leaveData.length;
    const approved = leaveData.filter((l) => l.status === 'approved').length;
    const pending = leaveData.filter((l) => l.status === 'pending').length;
    const rejected = leaveData.filter((l) => l.status === 'rejected').length;

    return { totalLeaves, approved, pending, rejected };
  };

  const getPayrollStats = () => {
    if (!payrollData) return null;

    const totalGross = payrollData.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalNet = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
    const totalDeductions = payrollData.reduce(
      (sum, p) => sum + p.totalDeductions,
      0
    );
    const avgSalary = totalNet / (payrollData.length || 1);

    return { totalGross, totalNet, totalDeductions, avgSalary };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'attendance': {
        const stats = getAttendanceStats();
        if (!stats) return <LoadingSpinner />;
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Present
              </div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalPresent}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Absent
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.totalAbsent}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Half Days
              </div>
              <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.totalHalfDay}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Avg Work Hours
              </div>
              <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.avgWorkHours.toFixed(1)}h
              </div>
            </div>
          </div>
        );
      }
      case 'leave': {
        const stats = getLeaveStats();
        if (!stats) return <LoadingSpinner />;
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Applications
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalLeaves}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Approved
              </div>
              <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pending
              </div>
              <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Rejected
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </div>
            </div>
          </div>
        );
      }
      case 'payroll': {
        const stats = getPayrollStats();
        if (!stats) return <LoadingSpinner />;
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Gross
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalGross)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Net
              </div>
              <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalNet)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Deductions
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.totalDeductions)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Avg Salary
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.avgSalary)}
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Reports & Analytics
      </h1>

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
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </Card>

      <Card title="Report Summary">{renderReportContent()}</Card>
    </div>
  );
};

export default AdminReportsPage;
