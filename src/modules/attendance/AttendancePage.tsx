import { useState } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { mockAttendance } from '../../mocks/attendance';
import { AttendanceRecord } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TimesheetEntryForm from './components/TimesheetEntryForm';
import CorrectionRequestModal from './components/CorrectionRequestModal';

const AttendancePage = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: attendanceRecords, loading } = useMockApi(
    () =>
      mockAttendance
        .filter(
          (a) => a.tenantId === currentTenant.id && a.userId === user?.id
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    { delay: 400 }
  );

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

  const handleRaiseCorrectionRequest = (date: string) => {
    setSelectedDate(date);
    setShowCorrectionModal(true);
  };

  const columns = [
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
    {
      key: 'actions',
      label: 'Actions',
      render: (record: AttendanceRecord) =>
        record.status === 'present' && !record.punchOut ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRaiseCorrectionRequest(record.date)}
          >
            Correction
          </Button>
        ) : null,
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
        <TimesheetEntryForm onClose={() => setShowTimesheetForm(false)} />
      )}

      <Card title="Attendance Records">
        {loading ? (
          <LoadingSpinner />
        ) : attendanceRecords && attendanceRecords.length > 0 ? (
          <Table
            data={attendanceRecords}
            columns={columns}
            keyExtractor={(record) => record.id}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No attendance records found
          </p>
        )}
      </Card>

      <CorrectionRequestModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        date={selectedDate || ''}
      />
    </div>
  );
};

export default AttendancePage;
