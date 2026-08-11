import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatMinutesAsHhMm, segmentWorkedMinutes } from '../../../utils/attendanceDuration';
import { formatBackendTime } from '../../../utils/timeFormat';

export interface AttendanceReportEmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
}

export interface AttendanceReportRow {
  id: string;
  employeeId: string;
  workDate: string;
  status?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

interface AttendanceDailyReportRow {
  key: string;
  employeeId: string;
  workDate: string;
  totalMinutes: number;
  segmentCount: number;
  status: string;
}

interface AttendanceReportDetailsProps {
  employees: AttendanceReportEmployeeRow[];
  rows: AttendanceReportRow[];
}

function buildDailyRows(rows: AttendanceReportRow[]) {
  const grouped = new Map<string, AttendanceDailyReportRow>();
  for (const row of rows) {
    const key = `${row.employeeId}:${row.workDate}`;
    const current =
      grouped.get(key) ??
      ({
        key,
        employeeId: row.employeeId,
        workDate: row.workDate,
        totalMinutes: 0,
        segmentCount: 0,
        status: row.status ?? '-',
      } satisfies AttendanceDailyReportRow);
    const workedMinutes = segmentWorkedMinutes(row.checkInTime, row.checkOutTime);
    grouped.set(key, {
      ...current,
      totalMinutes: current.totalMinutes + (workedMinutes ?? 0),
      segmentCount: current.segmentCount + 1,
      status: row.status ?? current.status,
    });
  }
  return [...grouped.values()].sort((first, second) => {
    const dateOrder = second.workDate.localeCompare(first.workDate);
    return dateOrder !== 0 ? dateOrder : first.employeeId.localeCompare(second.employeeId);
  });
}

const AttendanceReportDetails = ({ employees, rows }: AttendanceReportDetailsProps) => {
  const employeeNameById = new Map(employees.map((employee) => [employee.id, employee]));
  const employeeLabel = (employeeId: string) => {
    const employee = employeeNameById.get(employeeId);
    return employee ? `${employee.fullName} (${employee.employeeCode})` : employeeId.slice(0, 8);
  };
  const dailyRows = buildDailyRows(rows);

  return (
    <Card title="Attendance Details">
      {dailyRows.length ? (
        <Table
          data={dailyRows}
          keyExtractor={(row) => row.key}
          columns={[
            {
              key: 'employee',
              label: 'Employee',
              render: (row: AttendanceDailyReportRow) => employeeLabel(row.employeeId),
            },
            { key: 'workDate', label: 'Date', render: (row) => row.workDate },
            {
              key: 'total',
              label: 'Total Time',
              render: (row: AttendanceDailyReportRow) =>
                row.totalMinutes > 0 ? formatMinutesAsHhMm(row.totalMinutes) : '-',
            },
            {
              key: 'segments',
              label: 'Punch Segments',
              render: (row: AttendanceDailyReportRow) => row.segmentCount,
            },
            { key: 'status', label: 'Status', render: (row) => row.status },
          ]}
        />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No Attendance Records Match The Selected Filters.
        </p>
      )}
      <div className="mt-4">
        <Table
          data={rows}
          keyExtractor={(row) => row.id}
          columns={[
            {
              key: 'employee',
              label: 'Employee',
              render: (row: AttendanceReportRow) => employeeLabel(row.employeeId),
            },
            { key: 'workDate', label: 'Date', render: (row) => row.workDate },
            {
              key: 'in',
              label: 'Punch In',
              render: (row: AttendanceReportRow) => formatBackendTime(row.checkInTime),
            },
            {
              key: 'out',
              label: 'Punch Out',
              render: (row: AttendanceReportRow) => formatBackendTime(row.checkOutTime),
            },
            { key: 'status', label: 'Status', render: (row) => row.status ?? '-' },
          ]}
        />
      </div>
    </Card>
  );
};

export default AttendanceReportDetails;
