import type { LeaveCalendarData } from './leaveCalendarModel';

const LeaveCalendarHolidays = ({
  data,
  monthPrefix,
}: {
  data: LeaveCalendarData | null;
  monthPrefix: string;
}) => {
  const holidays = (data?.upcomingHolidays ?? [])
    .filter((row) => String(row.holidayDate).startsWith(monthPrefix))
    .sort((a, b) => String(a.holidayDate).localeCompare(String(b.holidayDate)));
  return (
    <section aria-label="Holidays" data-tour-anchor="leave.holidays-list" className="space-y-2">
      <h2 className="text-sm font-semibold">
        Holidays <span className="text-content-muted">({holidays.length})</span>
      </h2>
      {holidays.length ? (
        <ul className="divide-y divide-line">
          {holidays.map((holiday) => (
            <li key={holiday.id} className="py-2">
              <div className="flex justify-between gap-2 text-sm">
                <span className="font-medium">{holiday.name}</span>
                <time
                  dateTime={String(holiday.holidayDate)}
                  className="whitespace-nowrap text-xs text-content-secondary"
                >
                  {String(holiday.holidayDate).slice(0, 10)}
                </time>
              </div>
              <p className="text-xs text-content-secondary">
                {[holiday.calendarName, holiday.holidayType].filter(Boolean).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-content-muted">No holidays in this month.</p>
      )}
    </section>
  );
};

export default LeaveCalendarHolidays;
