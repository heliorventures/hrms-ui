import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  AllCompanyHolidaysDocument,
  type AllCompanyHolidaysQuery,
} from '../../api/graphql/graphql';

const outlineLink =
  'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80';

const LeaveHolidaysPage = () => {
  const client = useGraphClient('client');
  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = useState(defaultYear);
  const [rows, setRows] = useState<AllCompanyHolidaysQuery['upcomingHolidays']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const yearChoices = useMemo(() => {
    const ys: number[] = [];
    for (let y = defaultYear - 6; y <= defaultYear + 1; y++) ys.push(y);
    return ys;
  }, [defaultYear]);

  const load = useCallback(async () => {
    const r = await client.request<AllCompanyHolidaysQuery>(AllCompanyHolidaysDocument, {
      fromDate: `${year}-01-01`,
      limit: 500,
    });
    setRows(r.upcomingHolidays ?? []);
  }, [client, year]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => String(a.holidayDate).localeCompare(String(b.holidayDate)));
  }, [rows]);

  const inYear = useMemo(() => {
    const prefix = `${year}-`;
    return sorted.filter((h) => String(h.holidayDate).startsWith(prefix));
  }, [sorted, year]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Holidays</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Public and company holidays from configured calendars. Choose a calendar year (including past years).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/dashboard" className={outlineLink}>
            Dashboard
          </Link>
          <Link to="/leave" className={outlineLink}>
            Leave home
          </Link>
        </div>
      </div>

      <Card
        title={
          <span className="flex flex-wrap items-center justify-between gap-3">
            <span>Holidays ({year})</span>
            <label className="flex items-center gap-2 text-xs font-normal text-gray-600 dark:text-gray-400">
              Year
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </span>
        }
      >
        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Holidays...</p>
        ) : inYear.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No holidays on record from <span className="font-mono">January 1, {year}</span> onward in this list.
            Earlier dates in the same query window may appear if the API returns multi-year data — filter above limits to{' '}
            <span className="font-mono">{year}</span>.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
            {inYear.map((h) => (
              <li key={h.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                <span className="font-medium text-gray-900 dark:text-white">{h.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(h.holidayDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  · {h.calendarName}
                  {h.holidayType ? ` · ${h.holidayType}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!loading && inYear.length > 0 && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Showing {inYear.length} holiday(s) in {year}. The list loads from{' '}
            <span className="font-mono">Jan 1 {year}</span> forward (up to 500 rows).
          </p>
        )}
      </Card>
    </div>
  );
};

export default LeaveHolidaysPage;
