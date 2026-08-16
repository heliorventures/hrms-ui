import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatMinutesAsHhMm, formatLatLng } from '../../../utils/attendanceDuration';
import { formatBackendTime } from '../../../utils/timeFormat';
import type { FlatSegmentRow } from '../types';

interface AttendanceSegmentsTableProps {
  title: string;
  rows: FlatSegmentRow[];
  adjustPolicyDays: number;
  canAdjust: boolean;
  canRegularize: boolean;
  loading: boolean;
  selfAdjustAllowedForDate: (workIso: string) => boolean;
  onAdjust: (row: FlatSegmentRow) => void;
}

function statusVariant(status?: string | null) {
  switch ((status ?? '').toLowerCase()) {
    case 'present':
      return 'success';
    case 'absent':
      return 'danger';
    case 'half-day':
      return 'warning';
    case 'leave':
      return 'info';
    default:
      return 'neutral';
  }
}

const AttendanceSegmentsTable = ({
  title,
  rows,
  adjustPolicyDays,
  canAdjust,
  canRegularize,
  loading,
  selfAdjustAllowedForDate,
  onAdjust,
}: AttendanceSegmentsTableProps) => (
  <Card title={title}>
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading Attendance...</p>
    ) : rows.length ? (
      <Table
        data={rows}
        keyExtractor={(row) => row.id}
        columns={[
          {
            key: 'workDate',
            label: 'Date',
            render: (row: FlatSegmentRow) =>
              new Date(row.workDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }),
          },
          {
            key: 'in',
            label: 'Punch In',
            render: (row: FlatSegmentRow) => formatBackendTime(row.checkInTime ?? null),
          },
          {
            key: 'out',
            label: 'Punch Out',
            render: (row: FlatSegmentRow) => formatBackendTime(row.checkOutTime ?? null),
          },
          {
            key: 'dur',
            label: 'Duration',
            render: (row: FlatSegmentRow) =>
              row.segmentMinutes != null && row.segmentMinutes > 0
                ? formatMinutesAsHhMm(row.segmentMinutes)
                : row.checkInTime && !row.checkOutTime
                  ? 'Open'
                  : '-',
          },
          {
            key: 'loc',
            label: 'Location (In -> Out)',
            render: (row: FlatSegmentRow) => (
              <span className="max-w-xs text-xs text-gray-600 dark:text-gray-300">
                {formatLatLng(row.checkInLat, row.checkInLng)}
                {' -> '}
                {formatLatLng(row.checkOutLat, row.checkOutLng)}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row: FlatSegmentRow) => (
              <Badge variant={statusVariant(row.status)}>{row.status ?? '-'}</Badge>
            ),
          },
          ...(canAdjust
            ? [
                {
                  key: 'adj',
                  label: '',
                  render: (row: FlatSegmentRow) => {
                    const allow = selfAdjustAllowedForDate(row.workDate) || canRegularize;
                    return (
                      <Button
                        type="button"
                        variant="outline"
                        className="!py-1 !text-xs"
                        disabled={!allow}
                        title={
                          !allow
                            ? `Self-service locked after ${adjustPolicyDays} days - contact HR`
                            : undefined
                        }
                        onClick={() => onAdjust(row)}
                      >
                        Adjust day
                      </Button>
                    );
                  },
                },
              ]
            : []),
        ]}
      />
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No Punch Segments In This Month (Raise Limit Or Choose Another Month).
      </p>
    )}
  </Card>
);

export default AttendanceSegmentsTable;
