import type { AdminAttendanceDailyReportQuery } from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatMinutesAsHhMm } from '../../../utils/attendanceDuration';
import { titleCaseLabel } from '../../../utils/uiLabel';

export type AttendanceDailyRow =
  AdminAttendanceDailyReportQuery['attendanceDailyReport']['edges'][number]['node'];

interface AttendanceReportDetailsProps {
  rows: AttendanceDailyRow[];
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

function formatInstant(value: unknown, timezone: string): string {
  if (typeof value !== 'string' || !value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}

const AttendanceReportDetails = ({
  rows,
  loading,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
}: AttendanceReportDetailsProps) => (
  <Card title="Attendance Details">
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading Attendance Report...</p>
    ) : rows.length ? (
      <Table
        data={rows}
        keyExtractor={(row) => `${row.employeeId}:${String(row.workDate)}`}
        columns={[
          {
            key: 'employee',
            label: 'Employee',
            render: (row: AttendanceDailyRow) => `${row.employeeName} (${row.employeeCode})`,
          },
          { key: 'workDate', label: 'Date', render: (row) => String(row.workDate) },
          {
            key: 'firstIn',
            label: 'First Punch In',
            render: (row: AttendanceDailyRow) =>
              formatInstant(row.firstCheckInAt, row.timezone),
          },
          {
            key: 'lastOut',
            label: 'Last Punch Out',
            render: (row: AttendanceDailyRow) =>
              formatInstant(row.lastCheckOutAt, row.timezone),
          },
          {
            key: 'total',
            label: 'Total Time',
            render: (row: AttendanceDailyRow) => formatMinutesAsHhMm(row.loggedMinutes),
          },
          {
            key: 'expected',
            label: 'Expected Time',
            render: (row: AttendanceDailyRow) =>
              row.expectedMinutes == null ? '-' : formatMinutesAsHhMm(row.expectedMinutes),
          },
          { key: 'segments', label: 'Punch Segments', render: (row) => row.segmentCount },
          {
            key: 'status',
            label: 'Status',
            render: (row: AttendanceDailyRow) => titleCaseLabel(row.status),
          },
        ]}
      />
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No Attendance Records Match The Selected Filters.
      </p>
    )}
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="secondary" disabled={!canGoBack || loading} onClick={onPrevious}>
        Previous
      </Button>
      <Button variant="secondary" disabled={!canGoForward || loading} onClick={onNext}>
        Next
      </Button>
    </div>
  </Card>
);

export default AttendanceReportDetails;
