import { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import type { LeaveBalance } from '../../types';
import { mockUsers } from '../../mocks/users';

const AdminSettingsPage = () => {
  const { currentTenant } = useTenant();
  const {
    getLeaveBalances,
    updateLeaveBalances,
    setAttendanceOverride,
    getEmployees,
  } = useDataStore();

  const [activeSection, setActiveSection] = useState<'leave' | 'attendance'>(
    'leave'
  );

  const employees = getEmployees(currentTenant.id);

  const [editedBalances, setEditedBalances] = useState<LeaveBalance[]>([]);

  useEffect(() => {
    const balances = getLeaveBalances(currentTenant.id) || [];
    setEditedBalances([...balances]);
  }, [currentTenant.id]);
  const [attendanceUserId, setAttendanceUserId] = useState(employees[0]?.id ?? '');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceStatus, setAttendanceStatus] = useState<
    'present' | 'absent' | 'half-day' | 'leave' | 'holiday'
  >('present');

  const handleSaveLeaveTypes = () => {
    updateLeaveBalances(currentTenant.id, editedBalances);
    alert('Leave types updated!');
  };

  const handleOverrideAttendance = () => {
    if (!attendanceUserId) return;
    setAttendanceOverride(attendanceUserId, attendanceDate, attendanceStatus);
    alert('Attendance override applied!');
  };

  const usersWithRoles = mockUsers.filter((u) => u.tenantId === currentTenant.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Admin Settings
      </h1>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveSection('leave')}
            className={`border-b-2 py-4 text-sm font-medium ${
              activeSection === 'leave'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Leave Types & Balances
          </button>
          <button
            onClick={() => setActiveSection('attendance')}
            className={`border-b-2 py-4 text-sm font-medium ${
              activeSection === 'attendance'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Attendance Override
          </button>
        </nav>
      </div>

      {activeSection === 'leave' && (
        <Card title="Configure Leave Types">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Set total and available days per leave type. These apply as defaults
            for new employees.
          </p>
          <div className="space-y-4">
            {editedBalances.map((lb, idx) => (
              <div
                key={lb.leaveType}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <span className="w-24 font-medium capitalize">
                  {lb.leaveType}
                </span>
                <Input
                  label="Total"
                  type="number"
                  min="0"
                  value={lb.total}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 0;
                    const updated = [...editedBalances];
                    updated[idx] = {
                      ...lb,
                      total: v,
                      available: v - lb.used,
                    };
                    setEditedBalances(updated);
                  }}
                  className="w-20"
                />
                <Input
                  label="Used"
                  type="number"
                  min="0"
                  value={lb.used}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 0;
                    const updated = [...editedBalances];
                    updated[idx] = {
                      ...lb,
                      used: v,
                      available: lb.total - v,
                    };
                    setEditedBalances(updated);
                  }}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">
                  Available: {lb.available}
                </span>
              </div>
            ))}
            <Button onClick={handleSaveLeaveTypes}>Save Changes</Button>
          </div>
        </Card>
      )}

      {activeSection === 'attendance' && (
        <Card title="Override Attendance">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Override attendance status for an employee on a specific date. Use
            when timesheet-derived attendance needs correction.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employee
              </label>
              <select
                value={attendanceUserId}
                onChange={(e) => setAttendanceUserId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={attendanceStatus}
                onChange={(e) =>
                  setAttendanceStatus(
                    e.target.value as
                      | 'present'
                      | 'absent'
                      | 'half-day'
                      | 'leave'
                      | 'holiday'
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleOverrideAttendance}>
                Apply Override
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card title="User Roles">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Current user roles. Switch role from the header dropdown to test
          different access levels.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {usersWithRoles.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 dark:border-gray-700/50"
                >
                  <td className="py-2 text-gray-900 dark:text-white">
                    {u.name}
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">
                    {u.email}
                  </td>
                  <td className="py-2">
                    <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
