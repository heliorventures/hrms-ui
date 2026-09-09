import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable';
import { formatMinutesAsHhMm, naiveTimeToMinutes } from '../../../utils/attendanceDuration';
import { formatBackendTime } from '../../../utils/timeFormat';

import {
  managedAttendanceEmployee,
  type ManagedAttendanceAddContext,
  type ManagedAttendanceRow,
} from './managedAttendanceTypes';

interface ManagedAttendanceTableProps {
  rows: readonly ManagedAttendanceRow[];
  loading: boolean;
  errorMessage: string | null;
  onAdd?: (context: ManagedAttendanceAddContext) => void;
  onAdjust?: (row: ManagedAttendanceRow) => void;
}

function statusVariant(status: string | null | undefined) {
  switch (status?.toLowerCase()) {
    case 'present':
      return 'success' as const;
    case 'absent':
      return 'danger' as const;
    case 'half-day':
    case 'half_day':
      return 'warning' as const;
    case 'leave':
      return 'info' as const;
    default:
      return 'neutral' as const;
  }
}

function completedSameDayDuration(row: ManagedAttendanceRow): string {
  const checkIn = naiveTimeToMinutes(row.checkInTime);
  const checkOut = naiveTimeToMinutes(row.checkOutTime);
  if (!Number.isFinite(checkIn) || !Number.isFinite(checkOut) || checkOut <= checkIn)
    return 'Unavailable';
  return formatMinutesAsHhMm(checkOut - checkIn);
}

const ManagedAttendanceTable = ({
  rows,
  loading,
  errorMessage,
  onAdd,
  onAdjust,
}: ManagedAttendanceTableProps) => {
  const columns: DataTableColumn<ManagedAttendanceRow>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => (
        <span className="block min-w-32">
          <span className="block font-medium">{row.employeeName}</span>
          <span className="block whitespace-nowrap text-xs text-content-secondary">
            {row.employeeCode}
          </span>
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row) => <span className="whitespace-nowrap tabular-nums">{row.workDate}</span>,
    },
    { id: 'punch-in', header: 'Punch In', cell: (row) => formatBackendTime(row.checkInTime) },
    { id: 'punch-out', header: 'Punch Out', cell: (row) => formatBackendTime(row.checkOutTime) },
    { id: 'duration', header: 'Duration', cell: completedSameDayDuration, numeric: true },
    { id: 'source', header: 'Source', cell: (row) => row.source ?? '—' },
    {
      id: 'attendance-status',
      header: 'Attendance Status',
      cell: (row) => <Badge variant={statusVariant(row.status)}>{row.status ?? '—'}</Badge>,
    },
    {
      id: 'regularization-status',
      header: 'Regularization Status',
      cell: (row) => row.regularizationStatus ?? '—',
    },
    ...(onAdd || onAdjust
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: (row: ManagedAttendanceRow) => (
              <div className="flex flex-wrap gap-1 whitespace-nowrap">
                {onAdd ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Add segment for ${row.employeeName}`}
                    onClick={() =>
                      onAdd({ ...managedAttendanceEmployee(row), workDate: row.workDate })
                    }
                  >
                    Add segment
                  </Button>
                ) : null}
                {onAdjust ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Adjust ${row.employeeName} on ${row.workDate}`}
                    onClick={() => onAdjust(row)}
                  >
                    Adjust
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
  ];
  const state = loading
    ? 'loading'
    : errorMessage
      ? 'error'
      : rows.length === 0
        ? 'empty'
        : 'ready';
  const stateMessage = loading
    ? 'Loading attendance records…'
    : (errorMessage ?? 'No attendance records match these filters.');

  return (
    <Card title="Attendance records">
      <DataTable
        ariaLabel="Managed attendance records"
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => `${row.employeeName} on ${row.workDate}`}
        renderMobileRow={(row) => (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              {columns[0].cell(row)}
              {columns[1].cell(row)}
            </div>
            {columns.find((column) => column.id === 'actions')?.cell(row)}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {columns
                .filter((column) => !['employee', 'date', 'actions'].includes(column.id))
                .map((column) => (
                  <div key={column.id} className="min-w-0 break-words">
                    <dt className="text-xs text-content-secondary">{column.header}</dt>
                    <dd className="mt-1 tabular-nums">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
        state={state}
        stateMessage={stateMessage}
      />
    </Card>
  );
};

export default ManagedAttendanceTable;
