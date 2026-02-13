import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useDataStore } from '../../store/DataStoreContext';
import { AttendanceRecord, TimesheetEntry } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import TimesheetEntryForm from './components/TimesheetEntryForm';
import TimesheetEntryEditModal from './components/TimesheetEntryEditModal';
import AttendanceCalendar from './components/AttendanceCalendar';
import CorrectionRequestModal from './components/CorrectionRequestModal';

const AttendancePage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const {
    getTimesheetEntries,
    updateTimesheetEntry,
    deleteTimesheetEntry,
    getAttendance,
  } = useDataStore();

  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const timesheetEntries = user
    ? getTimesheetEntries(user.id, currentTenant.id)
    : [];
  const [monthStart, monthEnd] = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return [
      `${y}-${String(m).padStart(2, '0')}-01`,
      `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`,
    ];
  }, [currentMonth]);

  const attendanceRecords = user
    ? getAttendance(user.id, currentTenant.id, monthStart, monthEnd)
    : [];

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return timesheetEntries.filter((e) => e.date === selectedDate);
  }, [timesheetEntries, selectedDate]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'half-day':
        return 'warning';
      case 'leave':
        return 'info';
      case 'holiday':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const handleAddEntryForDate = (date: string) => {
    setSelectedDate(date);
    setShowTimesheetForm(true);
  };

  const attendanceColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (record: AttendanceRecord) =>
        new Date(record.date).toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'punchIn',
      label: 'Punch In',
      render: (record: AttendanceRecord) => record.punchIn || '-',
    },
    {
      key: 'punchOut',
      label: 'Punch Out',
      render: (record: AttendanceRecord) => record.punchOut || '-',
    },
    {
      key: 'workHours',
      label: 'Work Hours',
      render: (record: AttendanceRecord) =>
        record.workHours ? `${record.workHours.toFixed(2)}h` : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (record: AttendanceRecord) => (
        <Badge variant={getStatusVariant(record.status)}>
          {record.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance & Timesheet
        </h1>
        <Button onClick={() => setShowTimesheetForm(!showTimesheetForm)}>
          {showTimesheetForm ? 'Hide Timesheet Form' : 'Add Timesheet Entry'}
        </Button>
      </div>

      {showTimesheetForm && (
        <TimesheetEntryForm
          onClose={() => setShowTimesheetForm(false)}
          initialDate={selectedDate ?? undefined}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Attendance Calendar">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const [y, m] = currentMonth.split('-').map(Number);
                    const prev = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
                    setCurrentMonth(
                      `${prev.y}-${String(prev.m).padStart(2, '0')}`
                    );
                  }}
                >
                  ← Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const [y, m] = currentMonth.split('-').map(Number);
                    const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
                    setCurrentMonth(
                      `${next.y}-${String(next.m).padStart(2, '0')}`
                    );
                  }}
                >
                  Next →
                </Button>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {new Date(currentMonth + '-01').toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <AttendanceCalendar
              attendance={attendanceRecords}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentMonth={currentMonth}
            />
            {selectedDate && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {new Date(selectedDate).toLocaleDateString('en-IN')}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleAddEntryForDate(selectedDate)}
                >
                  Add entry for this date
                </Button>
              </div>
            )}
            {selectedDate && entriesForSelectedDate.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Time entries for this date:
                </p>
                {entriesForSelectedDate.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 dark:border-gray-600"
                  >
                    <span className="text-sm">
                      {e.projectName}: {e.hours}h - {e.taskDescription}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEntry(e)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteTimesheetEntry(e.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Timesheet Entries">
            {timesheetEntries.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {timesheetEntries.slice(0, 20).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-600"
                  >
                    <div>
                      <span className="font-medium">
                        {new Date(e.date).toLocaleDateString('en-IN')}
                      </span>
                      <span className="ml-2 text-gray-500">
                        {e.projectName} - {e.hours}h
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEntry(e)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteTimesheetEntry(e.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {timesheetEntries.length > 20 && (
                  <p className="text-xs text-gray-500">
                    Showing 20 of {timesheetEntries.length}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No timesheet entries. Add one above.
              </p>
            )}
          </Card>
        </div>
      </div>

      <Card title="Attendance Records (derived from timesheet)">
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Full hours (≥8h) → Present • Partial (4–8h) → Half day • No entry →
          Absent
        </p>
        {attendanceRecords.length > 0 ? (
          <Table
            data={attendanceRecords}
            columns={attendanceColumns}
            keyExtractor={(record) => record.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No attendance records for this month
          </p>
        )}
      </Card>

      <TimesheetEntryEditModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={updateTimesheetEntry}
      />

      <CorrectionRequestModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        date={selectedDate || ''}
      />
    </div>
  );
};

export default AttendancePage;
