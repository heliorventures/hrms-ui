import { Link } from 'react-router-dom';
import LeaveTeamCalendar from '../hr/components/LeaveTeamCalendar';

const outlineLink =
  'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80';

const LeaveTeamCalendarPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Leave Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Approved leave across people you can see (same scope as your leave list). Pick month and year; hover a cell for
            leave type and dates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard" className={outlineLink}>
            Dashboard
          </Link>
          <Link to="/leave" className={outlineLink}>
            Leave home
          </Link>
        </div>
      </div>

      <LeaveTeamCalendar />
    </div>
  );
};
export default LeaveTeamCalendarPage;
