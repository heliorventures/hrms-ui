import { UserProfileFull } from '../../../types';
import Card from '../../../components/common/Card';

interface JobDetailsTabProps {
  data: UserProfileFull;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const JobDetailsTab = ({ data }: JobDetailsTabProps) => {
  const { jobDetail, employeeTime, customFields } = data;

  const employeeTimeRows = [
    { label: 'Shift', value: employeeTime.shift },
    { label: 'Weekly Off Policy', value: employeeTime.weeklyOffPolicy },
    { label: 'Leave Plan', value: employeeTime.leavePlan },
    { label: 'Holiday Calendar', value: employeeTime.holidayCalendar },
    { label: 'Attendance Number', value: employeeTime.attendanceNumber },
    { label: 'Payroll Time Source', value: employeeTime.payrollTimeSource },
    {
      label: 'Disable Attendance Tracking',
      value: employeeTime.disableAttendanceTracking ? 'Yes' : 'No',
    },
    {
      label: 'Attendance Capture Scheme',
      value: employeeTime.attendanceCaptureScheme,
    },
    {
      label: 'Attendance Penalisation Policy',
      value: employeeTime.attendancePenalisationPolicy,
    },
    {
      label: 'Attendance Tracking Policy',
      value: employeeTime.attendanceTrackingPolicy,
    },
    { label: 'Shift Weekly Off Rule', value: employeeTime.shiftWeeklyOffRule },
    { label: 'Shift Allowance Policy', value: employeeTime.shiftAllowancePolicy },
    { label: 'Overtime', value: employeeTime.overtime },
  ];

  return (
    <div className="space-y-6">
      <Card title="Job Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Job Title (Primary)
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">{jobDetail.jobTitlePrimary}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Job Title (Secondary)
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {jobDetail.jobTitleSecondary || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Manager</p>
            <p className="mt-1 text-gray-900 dark:text-white">{jobDetail.managerName}</p>
            {jobDetail.managerEmail && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{jobDetail.managerEmail}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Employee ID</p>
            <p className="mt-1 text-gray-900 dark:text-white">{jobDetail.employeeId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Joining Date</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {formatDate(jobDetail.joiningDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Worker Type</p>
            <p className="mt-1 text-gray-900 dark:text-white">{jobDetail.workerType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Time Type</p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {jobDetail.timeType === 'full' ? 'Full time' : 'Half time'}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Employee Time">
        <div className="space-y-3">
          {employeeTimeRows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 border-b border-gray-100 py-2 last:border-0 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {row.label}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{row.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {customFields && customFields.length > 0 && (
        <Card title="Other (Configurable By Admin)">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Custom fields added by your administrator.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customFields.map((field, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {field.label}
                </p>
                <p className="mt-1 text-gray-900 dark:text-white">{field.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobDetailsTab;
