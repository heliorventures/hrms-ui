import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import { formatBackendTime } from '../../../utils/timeFormat';
import type { ShiftRow } from '../types';

const AttendanceShiftTemplates = ({
  loading,
  shifts,
}: {
  loading: boolean;
  shifts: ShiftRow[];
}) => {
  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>;
  if (!shifts.length)
    return <p className="text-sm text-gray-500 dark:text-gray-400">No Shifts Configured.</p>;
  return (
    <div className="grid grid-cols-1 gap-3">
      {shifts.slice(0, 12).map((shift) => (
        <div key={shift.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{shift.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatBackendTime(shift.startTime ?? null)} -{' '}
            {formatBackendTime(shift.endTime ?? null)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Nominal Hours: {shift.workHours ?? '-'}</p>
        </div>
      ))}
    </div>
  );
};
interface Props {
  loading: boolean;
  shifts: ShiftRow[];
  policyReady: boolean;
  policyMessage: { employee: string; regularizer?: string };
}
const AttendanceGuidance = ({ loading, shifts, policyReady, policyMessage }: Props) => (
  <PageInformation title="Attendance guidance and shifts">
    <div className="mt-3 space-y-3">
      <p className="text-sm text-content-secondary">
        Monthly totals include completed punches only. Each workday is counted once, including days
        with a completed segment and an incomplete punch. Overnight work stays with its starting
        date.
      </p>
      <div className="space-y-1 text-sm text-content-secondary">
        <h2 className="font-semibold text-content-primary">Punch adjustments</h2>
        {policyReady ? (
          <>
            <p>{policyMessage.employee}</p>
            {policyMessage.regularizer ? <p>{policyMessage.regularizer}</p> : null}
          </>
        ) : (
          <p role="status">Loading adjustment policy…</p>
        )}
      </div>
      <Card title="Shift templates">
        <AttendanceShiftTemplates loading={loading} shifts={shifts} />
      </Card>
    </div>
  </PageInformation>
);
export default AttendanceGuidance;
