import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useGraphClient } from '../../hooks/useGraphClient';
import TimesheetEntryForm from './components/TimesheetEntryForm';
import { AttendanceBoardDocument, TimesheetRowsDocument } from '../../api/graphql/graphql';

interface ShiftRow {
  id: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  workHours?: number | null;
  isNightShift: boolean;
}

interface AttendanceRow {
  id: string;
  employeeId: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status?: string | null;
  source?: string | null;
  lateMinutes?: number | null;
}

interface TimesheetEntryRow {
  id: string;
  workDate: string;
  hoursWorked: string;
  projectCode?: string | null;
  description?: string | null;
  status: string;
}

interface AttendanceBoardData {
  shifts: ShiftRow[];
  attendance: AttendanceRow[];
}

interface TimesheetData {
  timesheetEntries: TimesheetEntryRow[];
}

const AttendancePage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<AttendanceBoardData | null>(null);
  const [timesheet, setTimesheet] = useState<TimesheetEntryRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timesheetError, setTimesheetError] = useState<string | null>(null);
  const [timesheetOpen, setTimesheetOpen] = useState(false);

  const loadBoard = useCallback(async () => {
    return client.request<AttendanceBoardData>(AttendanceBoardDocument, { limit: 20 });
  }, [client]);

  const loadTimesheet = useCallback(async () => {
    const result = await client.request<TimesheetData>(TimesheetRowsDocument, { limit: 50 });
    return result.timesheetEntries;
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setTimesheetError(null);
        const [board, tsResult] = await Promise.all([
          loadBoard(),
          loadTimesheet()
            .then((rows) => ({ ok: true as const, rows }))
            .catch((e) => {
              if (!cancelled) {
                setTimesheetError(
                  e instanceof Error ? e.message : 'Timesheet needs a signed-in employee session'
                );
              }
              return { ok: false as const, rows: [] as TimesheetEntryRow[] };
            }),
        ]);
        if (!cancelled) {
          setData(board);
          if (tsResult.ok) {
            setTimesheet(tsResult.rows);
            setTimesheetError(null);
          } else {
            setTimesheet(null);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load attendance data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBoard, loadTimesheet]);

  const statusVariant = (status?: string | null) => {
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance & Shifts</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Live data from the attendance subgraph through the gateway.
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Shift Templates">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading shifts…</p>
        ) : data?.shifts?.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.shifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{shift.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {shift.startTime ?? '—'} to {shift.endTime ?? '—'}
                    </p>
                  </div>
                  <Badge variant={shift.isNightShift ? 'warning' : 'info'}>
                    {shift.isNightShift ? 'Night' : 'Day'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Work hours: {shift.workHours ?? '—'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No shifts found.</p>
        )}
      </Card>

      <Card title="Recent Attendance">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading attendance…</p>
        ) : data?.attendance?.length ? (
          <Table
            data={data.attendance}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'employeeId',
                label: 'Employee',
                render: (row: AttendanceRow) => row.employeeId,
              },
              {
                key: 'workDate',
                label: 'Date',
                render: (row: AttendanceRow) => new Date(row.workDate).toLocaleDateString('en-IN'),
              },
              {
                key: 'checkInTime',
                label: 'Check in',
                render: (row: AttendanceRow) => row.checkInTime ?? '—',
              },
              {
                key: 'checkOutTime',
                label: 'Check out',
                render: (row: AttendanceRow) => row.checkOutTime ?? '—',
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: AttendanceRow) => (
                  <Badge variant={statusVariant(row.status)}>{row.status ?? '—'}</Badge>
                ),
              },
              { key: 'source', label: 'Source', render: (row: AttendanceRow) => row.source ?? '—' },
              {
                key: 'lateMinutes',
                label: 'Late min',
                render: (row: AttendanceRow) => row.lateMinutes ?? '—',
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No attendance rows found.</p>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timesheet</h2>
        <Button variant="primary" onClick={() => setTimesheetOpen(true)} disabled={loading}>
          Add entry
        </Button>
      </div>

      <Card title="Your timesheet entries">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading timesheet…</p>
        ) : timesheetError ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">{timesheetError}</p>
        ) : timesheet && timesheet.length > 0 ? (
          <Table
            data={timesheet}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'workDate',
                label: 'Date',
                render: (row: TimesheetEntryRow) =>
                  new Date(row.workDate).toLocaleDateString('en-IN'),
              },
              { key: 'hoursWorked', label: 'Hours' },
              {
                key: 'projectCode',
                label: 'Project',
                render: (row: TimesheetEntryRow) => row.projectCode ?? '—',
              },
              {
                key: 'description',
                label: 'Notes',
                render: (row: TimesheetEntryRow) => (
                  <span className="max-w-xs truncate">{row.description ?? '—'}</span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: TimesheetEntryRow) => <Badge variant="info">{row.status}</Badge>,
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No timesheet entries yet.</p>
        )}
      </Card>

      <Modal isOpen={timesheetOpen} onClose={() => setTimesheetOpen(false)} title="Add timesheet">
        <TimesheetEntryForm
          onClose={() => setTimesheetOpen(false)}
          onCreated={async () => {
            try {
              setTimesheet(await loadTimesheet());
            } catch (e) {
              setTimesheetError(e instanceof Error ? e.message : 'Failed to refresh timesheet');
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default AttendancePage;
