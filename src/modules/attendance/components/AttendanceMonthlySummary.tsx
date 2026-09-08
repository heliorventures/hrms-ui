import type { MyAttendanceBoardQuery } from '../../../api/attendance/graphql';
import { formatMinutesAsHhMm } from '../../../utils/attendanceDuration';

interface Props {
  summary: MyAttendanceBoardQuery['myAttendanceSummary'] | null;
  loading: boolean;
}

const AttendanceMonthlySummary = ({ summary, loading }: Props) => {
  const metrics = [
    [
      'Average / worked day',
      typeof summary?.averageMinutes === 'number'
        ? formatMinutesAsHhMm(summary.averageMinutes)
        : '—',
    ],
    ['Completed workdays', summary ? String(summary.workedDays) : '—'],
    ['Total completed time', summary ? formatMinutesAsHhMm(summary.completedMinutes) : '—'],
    ['Incomplete punches', summary ? String(summary.incompleteSegments) : '—'],
  ];
  return (
    <section aria-label="Monthly attendance summary" aria-busy={loading}>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="min-w-0 bg-surface px-4 py-3">
            <dt className="text-xs font-medium text-content-secondary">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-content-primary">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default AttendanceMonthlySummary;
